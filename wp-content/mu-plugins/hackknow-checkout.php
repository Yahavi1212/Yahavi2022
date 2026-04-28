<?php
/**
 * Plugin Name: HackKnow Checkout (Razorpay server-side)
 * Description: Server-side Razorpay order creation + signature verification for the
 *              HackKnow React frontend. Place this file at
 *              wp-content/mu-plugins/hackknow-checkout.php on the WordPress server.
 * Version: 1.0.0
 *
 * Required environment / wp-config.php constants:
 *   define('HACKKNOW_RAZORPAY_KEY_ID', 'rzp_live_xxx');
 *   define('HACKKNOW_RAZORPAY_KEY_SECRET', 'xxx');
 */

if (!defined('ABSPATH')) {
    exit;
}

add_action('rest_api_init', function () {
    register_rest_route('hackknow/v1', '/checkout/create-order', [
        'methods'             => 'POST',
        'permission_callback' => '__return_true',
        'callback'            => 'hackknow_create_order',
    ]);

    register_rest_route('hackknow/v1', '/checkout/verify-payment', [
        'methods'             => 'POST',
        'permission_callback' => '__return_true',
        'callback'            => 'hackknow_verify_payment',
    ]);
});

function hackknow_keys() {
    $key_id     = defined('HACKKNOW_RAZORPAY_KEY_ID') ? HACKKNOW_RAZORPAY_KEY_ID : '';
    $key_secret = defined('HACKKNOW_RAZORPAY_KEY_SECRET') ? HACKKNOW_RAZORPAY_KEY_SECRET : '';
    if (!$key_id || !$key_secret) {
        return new WP_Error('hackknow_misconfigured', 'Razorpay keys not configured', ['status' => 500]);
    }
    return ['id' => $key_id, 'secret' => $key_secret];
}

function hackknow_create_order(WP_REST_Request $request) {
    $keys = hackknow_keys();
    if (is_wp_error($keys)) return $keys;

    $body     = $request->get_json_params();
    $cart     = isset($body['cart']) && is_array($body['cart']) ? $body['cart'] : [];
    $customer = isset($body['customer']) && is_array($body['customer']) ? $body['customer'] : [];

    if (empty($cart)) {
        return new WP_Error('hackknow_empty_cart', 'Cart is empty', ['status' => 400]);
    }

    // Compute total from authoritative WooCommerce prices (never trust the client)
    $total_paise = 0;
    $line_items  = [];
    foreach ($cart as $line) {
        $product_id = isset($line['product_id']) ? intval($line['product_id']) : 0;
        $quantity   = isset($line['quantity']) ? max(1, intval($line['quantity'])) : 1;
        if (!$product_id) continue;

        $product = function_exists('wc_get_product') ? wc_get_product($product_id) : null;
        if (!$product) {
            return new WP_Error('hackknow_bad_product', "Unknown product: $product_id", ['status' => 400]);
        }
        $price        = floatval($product->get_price());
        $line_total   = $price * $quantity;
        $total_paise += intval(round($line_total * 100));
        $line_items[] = [
            'product_id' => $product_id,
            'quantity'   => $quantity,
            'price'      => $price,
        ];
    }

    if ($total_paise <= 0) {
        return new WP_Error('hackknow_zero_total', 'Order total is zero', ['status' => 400]);
    }

    // Create WooCommerce order in pending state
    if (!function_exists('wc_create_order')) {
        return new WP_Error('hackknow_no_woo', 'WooCommerce not available', ['status' => 500]);
    }
    $order = wc_create_order();
    foreach ($line_items as $line) {
        $order->add_product(wc_get_product($line['product_id']), $line['quantity']);
    }
    $order->set_address([
        'first_name' => sanitize_text_field($customer['first_name'] ?? ''),
        'last_name'  => sanitize_text_field($customer['last_name'] ?? ''),
        'email'      => sanitize_email($customer['email'] ?? ''),
        'phone'      => sanitize_text_field($customer['phone'] ?? ''),
    ], 'billing');
    $order->set_payment_method('razorpay');
    $order->update_status('pending', 'Awaiting Razorpay payment');
    $order->calculate_totals();
    $order_id = $order->get_id();

    // Create Razorpay order via REST API
    $rzp_response = wp_remote_post('https://api.razorpay.com/v1/orders', [
        'timeout' => 20,
        'headers' => [
            'Content-Type'  => 'application/json',
            'Authorization' => 'Basic ' . base64_encode($keys['id'] . ':' . $keys['secret']),
        ],
        'body'    => wp_json_encode([
            'amount'   => $total_paise,
            'currency' => 'INR',
            'receipt'  => 'wc_' . $order_id,
            'notes'    => ['wc_order_id' => (string) $order_id],
        ]),
    ]);

    if (is_wp_error($rzp_response)) {
        return new WP_Error('hackknow_rzp_error', $rzp_response->get_error_message(), ['status' => 502]);
    }
    $rzp_body = json_decode(wp_remote_retrieve_body($rzp_response), true);
    if (empty($rzp_body['id'])) {
        return new WP_Error('hackknow_rzp_invalid', 'Razorpay did not return an order id', ['status' => 502]);
    }

    update_post_meta($order_id, '_razorpay_order_id', sanitize_text_field($rzp_body['id']));

    return rest_ensure_response([
        'order_id'          => $order_id,
        'razorpay_order_id' => $rzp_body['id'],
        'amount'            => $total_paise,
        'currency'          => 'INR',
        'key_id'            => $keys['id'],
    ]);
}

function hackknow_verify_payment(WP_REST_Request $request) {
    $keys = hackknow_keys();
    if (is_wp_error($keys)) return $keys;

    $body = $request->get_json_params();
    $order_id          = intval($body['order_id'] ?? 0);
    $razorpay_order_id = sanitize_text_field($body['razorpay_order_id'] ?? '');
    $payment_id        = sanitize_text_field($body['razorpay_payment_id'] ?? '');
    $signature         = sanitize_text_field($body['razorpay_signature'] ?? '');

    if (!$order_id || !$razorpay_order_id || !$payment_id || !$signature) {
        return new WP_Error('hackknow_missing_fields', 'Missing payment fields', ['status' => 400]);
    }

    $order = wc_get_order($order_id);
    if (!$order) {
        return new WP_Error('hackknow_no_order', 'Order not found', ['status' => 404]);
    }

    $stored_rzp_order = get_post_meta($order_id, '_razorpay_order_id', true);
    if ($stored_rzp_order !== $razorpay_order_id) {
        return new WP_Error('hackknow_mismatched_order', 'Order id mismatch', ['status' => 400]);
    }

    $expected = hash_hmac('sha256', $razorpay_order_id . '|' . $payment_id, $keys['secret']);
    if (!hash_equals($expected, $signature)) {
        $order->update_status('failed', 'Razorpay signature verification failed');
        return new WP_Error('hackknow_bad_signature', 'Signature verification failed', ['status' => 400]);
    }

    update_post_meta($order_id, '_razorpay_payment_id', $payment_id);
    $order->payment_complete($payment_id);
    $order->add_order_note('Razorpay payment verified server-side. Payment id: ' . $payment_id);

    return rest_ensure_response([
        'success'  => true,
        'order_id' => $order_id,
    ]);
}
