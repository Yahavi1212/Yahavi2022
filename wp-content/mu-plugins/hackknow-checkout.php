<?php
/**
 * HackKnow checkout bridge — exposes 2 REST endpoints for the React frontend.
 *  POST /wp-json/hackknow/v1/order   → creates a WC order + Razorpay order
 *  POST /wp-json/hackknow/v1/verify  → verifies signature + marks order paid
 */

add_action('rest_api_init', function () {
    register_rest_route('hackknow/v1', '/order', [
        'methods'  => 'POST',
        'callback' => 'hackknow_create_order',
        'permission_callback' => '__return_true',
    ]);
    register_rest_route('hackknow/v1', '/verify', [
        'methods'  => 'POST',
        'callback' => 'hackknow_verify_payment',
        'permission_callback' => '__return_true',
    ]);
});

function hackknow_create_order(WP_REST_Request $req) {
    $items = $req->get_param('items');
    $email = sanitize_email($req->get_param('email'));
    $phone = sanitize_text_field($req->get_param('phone'));
    $first = sanitize_text_field($req->get_param('first_name'));
    $last  = sanitize_text_field($req->get_param('last_name'));

    if (!is_array($items) || empty($items) || !$email) {
        return new WP_Error('bad_request', 'Missing items or email', ['status' => 400]);
    }

    $order = wc_create_order(['status' => 'pending']);
    foreach ($items as $i) {
        $product_id = absint($i['product_id'] ?? 0);
        $qty        = max(1, absint($i['quantity'] ?? 1));
        if ($product_id) $order->add_product(wc_get_product($product_id), $qty);
    }
    $order->set_billing_email($email);
    $order->set_billing_phone($phone);
    $order->set_billing_first_name($first);
    $order->set_billing_last_name($last);
    $order->calculate_totals();

    $amount_paise = (int) round($order->get_total() * 100);
    $rzp = get_option('woocommerce_razorpay_settings');
    $key_id = $rzp['key_id'] ?? ''; $key_secret = $rzp['key_secret'] ?? '';
    if (!$key_id || !$key_secret) {
        return new WP_Error('rzp_unconfigured', 'Razorpay not configured', ['status' => 500]);
    }

    $resp = wp_remote_post('https://api.razorpay.com/v1/orders', [
        'headers' => [
            'Authorization' => 'Basic ' . base64_encode($key_id . ':' . $key_secret),
            'Content-Type'  => 'application/json',
        ],
        'body' => wp_json_encode([
            'amount'   => $amount_paise,
            'currency' => 'INR',
            'receipt'  => 'wc_' . $order->get_id(),
            'notes'    => ['wc_order_id' => $order->get_id()],
        ]),
        'timeout' => 15,
    ]);
    if (is_wp_error($resp)) return new WP_Error('rzp_http', $resp->get_error_message(), ['status' => 502]);
    $body = json_decode(wp_remote_retrieve_body($resp), true);
    if (empty($body['id'])) return new WP_Error('rzp_no_id', 'Razorpay order failed', ['status' => 502, 'detail' => $body]);

    update_post_meta($order->get_id(), '_razorpay_order_id', $body['id']);

    return [
        'wc_order_id'    => $order->get_id(),
        'razorpay_order' => $body['id'],
        'amount'         => $amount_paise,
        'currency'       => 'INR',
        'key_id'         => $key_id,
    ];
}

function hackknow_verify_payment(WP_REST_Request $req) {
    $rzp_order_id   = sanitize_text_field($req->get_param('razorpay_order_id'));
    $rzp_payment_id = sanitize_text_field($req->get_param('razorpay_payment_id'));
    $rzp_signature  = sanitize_text_field($req->get_param('razorpay_signature'));
    $wc_order_id    = absint($req->get_param('wc_order_id'));

    if (!$rzp_order_id || !$rzp_payment_id || !$rzp_signature || !$wc_order_id) {
        return new WP_Error('bad_request', 'Missing fields', ['status' => 400]);
    }
    $rzp = get_option('woocommerce_razorpay_settings');
    $key_secret = $rzp['key_secret'] ?? '';
    $expected = hash_hmac('sha256', $rzp_order_id . '|' . $rzp_payment_id, $key_secret);
    if (!hash_equals($expected, $rzp_signature)) {
        return new WP_Error('bad_signature', 'Invalid payment signature', ['status' => 400]);
    }

    $order = wc_get_order($wc_order_id);
    if (!$order) return new WP_Error('no_order', 'Order not found', ['status' => 404]);

    $order->payment_complete($rzp_payment_id);
    $order->add_order_note('Razorpay payment ' . $rzp_payment_id . ' verified.');

    return ['success' => true, 'wc_order_id' => $wc_order_id];
}
