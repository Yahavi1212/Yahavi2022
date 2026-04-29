<?php
/**
 * HackKnow checkout + auth bridge.
 *
 *  REST routes registered under /wp-json/hackknow/v1/
 *    POST /auth/register   { email, password, full_name? }   -> { token, user }
 *    POST /auth/login      { email, password }               -> { token, user }
 *    GET  /auth/me         (Authorization: Bearer <token>)   -> { user }
 *    POST /order           { items, email, phone, first_name, last_name }
 *                                                            -> { wc_order_id, razorpay_order, amount, currency, key_id }
 *    POST /verify          { razorpay_order_id, razorpay_payment_id,
 *                            razorpay_signature, wc_order_id }
 *                                                            -> { success, wc_order_id }
 *
 *  Tokens are stateless HMAC-signed payloads using wp_salt('auth') as the key,
 *  so we don't depend on any external JWT plugin.
 */

if (!defined('ABSPATH')) { exit; }

/* ---------------------------------------------------------------------------
 *  Token helpers
 * ------------------------------------------------------------------------- */

function hackknow_b64url_encode($data) {
    return rtrim(strtr(base64_encode($data), '+/', '-_'), '=');
}
function hackknow_b64url_decode($data) {
    $remainder = strlen($data) % 4;
    if ($remainder) { $data .= str_repeat('=', 4 - $remainder); }
    return base64_decode(strtr($data, '-_', '+/'));
}
function hackknow_make_token($user_id) {
    $payload = wp_json_encode(['uid' => (int) $user_id, 'iat' => time(), 'exp' => time() + 30 * DAY_IN_SECONDS]);
    $b64     = hackknow_b64url_encode($payload);
    $sig     = hash_hmac('sha256', $b64, wp_salt('auth'));
    return $b64 . '.' . $sig;
}
function hackknow_verify_token($token) {
    if (!is_string($token) || strpos($token, '.') === false) return null;
    list($b64, $sig) = explode('.', $token, 2);
    $expected = hash_hmac('sha256', $b64, wp_salt('auth'));
    if (!hash_equals($expected, $sig)) return null;
    $payload = json_decode(hackknow_b64url_decode($b64), true);
    if (!is_array($payload) || empty($payload['uid'])) return null;
    if (!empty($payload['exp']) && $payload['exp'] < time()) return null;
    return (int) $payload['uid'];
}
function hackknow_user_payload(WP_User $user) {
    $first = $user->first_name ?: '';
    $last  = $user->last_name ?: '';
    $name  = trim("$first $last") ?: ($user->display_name ?: $user->user_login);
    return [
        'id'         => (string) $user->ID,
        'name'       => $name,
        'email'      => $user->user_email,
        'first_name' => $first,
        'last_name'  => $last,
        'joinedDate' => mysql2date('F Y', $user->user_registered, false),
        'isVerified' => true,
    ];
}
function hackknow_extract_bearer(WP_REST_Request $req) {
    $h = $req->get_header('authorization');
    if (!$h && function_exists('apache_request_headers')) {
        $headers = apache_request_headers();
        $h = $headers['Authorization'] ?? ($headers['authorization'] ?? '');
    }
    if (!$h || stripos($h, 'Bearer ') !== 0) return '';
    return trim(substr($h, 7));
}

/* ---------------------------------------------------------------------------
 *  CORS — allow both hackknow.com domains; needed because the SPA on
 *  hackknow.com calls shop.hackknow.com directly until nginx proxying lands.
 * ------------------------------------------------------------------------- */

add_action('rest_api_init', function () {
    remove_filter('rest_pre_serve_request', 'rest_send_cors_headers');
    add_filter('rest_pre_serve_request', function ($value) {
        $origin  = get_http_origin();
        $allowed = ['https://hackknow.com', 'https://www.hackknow.com', 'http://localhost:5173', 'http://localhost:3000'];
        if ($origin && in_array($origin, $allowed, true)) {
            header('Access-Control-Allow-Origin: ' . esc_url_raw($origin));
        } else {
            header('Access-Control-Allow-Origin: *');
        }
        header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
        header('Access-Control-Allow-Headers: Authorization, Content-Type, X-WP-Nonce');
        header('Access-Control-Allow-Credentials: false');
        header('Vary: Origin');
        return $value;
    });
}, 15);

/* ---------------------------------------------------------------------------
 *  Routes
 * ------------------------------------------------------------------------- */

add_action('rest_api_init', function () {
    register_rest_route('hackknow/v1', '/auth/register', [
        'methods'             => 'POST',
        'callback'            => 'hackknow_auth_register',
        'permission_callback' => '__return_true',
    ]);
    register_rest_route('hackknow/v1', '/auth/login', [
        'methods'             => 'POST',
        'callback'            => 'hackknow_auth_login',
        'permission_callback' => '__return_true',
    ]);
    register_rest_route('hackknow/v1', '/auth/me', [
        'methods'             => 'GET',
        'callback'            => 'hackknow_auth_me',
        'permission_callback' => '__return_true',
    ]);
    register_rest_route('hackknow/v1', '/order', [
        'methods'             => 'POST',
        'callback'            => 'hackknow_create_order',
        'permission_callback' => '__return_true',
    ]);
    register_rest_route('hackknow/v1', '/verify', [
        'methods'             => 'POST',
        'callback'            => 'hackknow_verify_payment',
        'permission_callback' => '__return_true',
    ]);
});

/* ---------------------------------------------------------------------------
 *  Auth handlers
 * ------------------------------------------------------------------------- */

function hackknow_auth_register(WP_REST_Request $req) {
    $email     = sanitize_email((string) $req->get_param('email'));
    $password  = (string) $req->get_param('password');
    $full_name = sanitize_text_field((string) ($req->get_param('full_name') ?: $req->get_param('name')));
    $phone     = sanitize_text_field((string) $req->get_param('phone'));

    if (!is_email($email))    return new WP_Error('bad_email',     'A valid email is required',          ['status' => 400]);
    if (strlen($password) < 8) return new WP_Error('weak_password', 'Password must be at least 8 characters', ['status' => 400]);
    if (email_exists($email))  return new WP_Error('email_exists', 'An account with this email already exists', ['status' => 409]);

    $base_login = sanitize_user(strtolower(str_replace(' ', '_', $full_name)), true);
    if (!$base_login) {
        $base_login = sanitize_user(strtolower(explode('@', $email)[0]), true);
    }
    if (!$base_login) $base_login = 'user';
    $username = $base_login;
    $i = 1;
    while (username_exists($username)) {
        $username = $base_login . $i++;
        if ($i > 1000) break;
    }

    $first = $full_name;
    $last  = '';
    if (strpos($full_name, ' ') !== false) {
        $parts = explode(' ', $full_name, 2);
        $first = $parts[0];
        $last  = $parts[1];
    }

    $user_id = wp_insert_user([
        'user_login'   => $username,
        'user_email'   => $email,
        'user_pass'    => $password,
        'first_name'   => $first,
        'last_name'    => $last,
        'display_name' => $full_name ?: $username,
        'role'         => 'customer',
    ]);
    if (is_wp_error($user_id)) {
        return new WP_Error('register_failed', $user_id->get_error_message(), ['status' => 400]);
    }
    if ($phone) {
        update_user_meta($user_id, 'billing_phone', $phone);
    }

    $user = get_user_by('id', $user_id);
    return [
        'token' => hackknow_make_token($user_id),
        'user'  => hackknow_user_payload($user),
    ];
}

function hackknow_auth_login(WP_REST_Request $req) {
    $login    = sanitize_text_field((string) ($req->get_param('email') ?: $req->get_param('username')));
    $password = (string) $req->get_param('password');

    if (!$login || !$password) {
        return new WP_Error('bad_request', 'Email and password are required', ['status' => 400]);
    }

    $user = is_email($login) ? get_user_by('email', $login) : null;
    if (!$user) $user = get_user_by('login', $login);
    if (!$user || !wp_check_password($password, $user->user_pass, $user->ID)) {
        return new WP_Error('invalid_credentials', 'Invalid email or password', ['status' => 401]);
    }

    return [
        'token' => hackknow_make_token($user->ID),
        'user'  => hackknow_user_payload($user),
    ];
}

function hackknow_auth_me(WP_REST_Request $req) {
    $token = hackknow_extract_bearer($req);
    $uid   = hackknow_verify_token($token);
    if (!$uid) return new WP_Error('unauthorized', 'Invalid or expired token', ['status' => 401]);
    $user = get_user_by('id', $uid);
    if (!$user) return new WP_Error('not_found', 'User not found', ['status' => 404]);
    return ['user' => hackknow_user_payload($user)];
}

/* ---------------------------------------------------------------------------
 *  Razorpay order + verify (unchanged behaviour, kept here so the file is
 *  the single source of truth for hackknow/v1/*).
 * ------------------------------------------------------------------------- */

function hackknow_get_rzp_keys() {
    if (defined('HACKKNOW_RAZORPAY_KEY_ID') && defined('HACKKNOW_RAZORPAY_KEY_SECRET')) {
        return [HACKKNOW_RAZORPAY_KEY_ID, HACKKNOW_RAZORPAY_KEY_SECRET];
    }
    $opt = get_option('woocommerce_razorpay_settings');
    return [$opt['key_id'] ?? '', $opt['key_secret'] ?? ''];
}

function hackknow_create_order(WP_REST_Request $req) {
    $items = $req->get_param('items');
    $email = sanitize_email((string) $req->get_param('email'));
    $phone = sanitize_text_field((string) $req->get_param('phone'));
    $first = sanitize_text_field((string) $req->get_param('first_name'));
    $last  = sanitize_text_field((string) $req->get_param('last_name'));

    if (!is_array($items) || empty($items) || !$email) {
        return new WP_Error('bad_request', 'Missing items or email', ['status' => 400]);
    }
    if (!function_exists('wc_create_order')) {
        return new WP_Error('no_woocommerce', 'WooCommerce is not active', ['status' => 500]);
    }

    $token = hackknow_extract_bearer($req);
    $uid   = $token ? hackknow_verify_token($token) : null;

    $order = wc_create_order(['status' => 'pending']);
    if ($uid) $order->set_customer_id($uid);

    $line_total_paise = 0;
    foreach ($items as $i) {
        $product_id = absint($i['product_id'] ?? 0);
        $qty        = max(1, absint($i['quantity'] ?? 1));
        if (!$product_id) continue;
        $product = wc_get_product($product_id);
        if (!$product) continue;
        $order->add_product($product, $qty);
    }
    $order->set_billing_email($email);
    $order->set_billing_phone($phone);
    $order->set_billing_first_name($first);
    $order->set_billing_last_name($last);
    $order->calculate_totals();

    $amount_paise = (int) round($order->get_total() * 100);
    if ($amount_paise <= 0) {
        $order->update_status('cancelled', 'Hackknow: zero-total order rejected');
        return new WP_Error('zero_total', 'Order total is zero', ['status' => 400]);
    }

    list($key_id, $key_secret) = hackknow_get_rzp_keys();
    if (!$key_id || !$key_secret) {
        return new WP_Error('rzp_unconfigured', 'Razorpay keys are not configured on the server', ['status' => 500]);
    }

    $resp = wp_remote_post('https://api.razorpay.com/v1/orders', [
        'headers' => [
            'Authorization' => 'Basic ' . base64_encode($key_id . ':' . $key_secret),
            'Content-Type'  => 'application/json',
        ],
        'body'    => wp_json_encode([
            'amount'   => $amount_paise,
            'currency' => 'INR',
            'receipt'  => 'wc_' . $order->get_id(),
            'notes'    => ['wc_order_id' => (string) $order->get_id()],
        ]),
        'timeout' => 20,
    ]);
    if (is_wp_error($resp)) {
        return new WP_Error('rzp_http', $resp->get_error_message(), ['status' => 502]);
    }
    $body = json_decode(wp_remote_retrieve_body($resp), true);
    if (empty($body['id'])) {
        return new WP_Error('rzp_no_id', 'Razorpay order creation failed', ['status' => 502, 'detail' => $body]);
    }

    update_post_meta($order->get_id(), '_razorpay_order_id', sanitize_text_field($body['id']));

    return [
        'wc_order_id'    => $order->get_id(),
        'razorpay_order' => $body['id'],
        'amount'         => $amount_paise,
        'currency'       => 'INR',
        'key_id'         => $key_id,
    ];
}

function hackknow_verify_payment(WP_REST_Request $req) {
    $rzp_order_id   = sanitize_text_field((string) $req->get_param('razorpay_order_id'));
    $rzp_payment_id = sanitize_text_field((string) $req->get_param('razorpay_payment_id'));
    $rzp_signature  = sanitize_text_field((string) $req->get_param('razorpay_signature'));
    $wc_order_id    = absint($req->get_param('wc_order_id'));

    if (!$rzp_order_id || !$rzp_payment_id || !$rzp_signature || !$wc_order_id) {
        return new WP_Error('bad_request', 'Missing fields', ['status' => 400]);
    }

    $order = wc_get_order($wc_order_id);
    if (!$order) return new WP_Error('no_order', 'Order not found', ['status' => 404]);

    $stored = get_post_meta($wc_order_id, '_razorpay_order_id', true);
    if ($stored && $stored !== $rzp_order_id) {
        $order->update_status('failed', 'Razorpay order id mismatch');
        return new WP_Error('order_mismatch', 'Order id mismatch', ['status' => 400]);
    }

    list(, $key_secret) = hackknow_get_rzp_keys();
    $expected = hash_hmac('sha256', $rzp_order_id . '|' . $rzp_payment_id, $key_secret);
    if (!hash_equals($expected, $rzp_signature)) {
        $order->update_status('failed', 'Razorpay signature verification failed');
        return new WP_Error('bad_signature', 'Invalid payment signature', ['status' => 400]);
    }

    update_post_meta($wc_order_id, '_razorpay_payment_id', $rzp_payment_id);
    $order->payment_complete($rzp_payment_id);
    $order->add_order_note('Razorpay payment ' . $rzp_payment_id . ' verified server-side.');

    return ['success' => true, 'wc_order_id' => $wc_order_id];
}
