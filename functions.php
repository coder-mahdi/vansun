<?php
// Enable WooCommerce Bookings REST API
add_filter('woocommerce_rest_api_enabled', '__return_true');

// Add CORS headers for React frontend
add_action('rest_api_init', function() {
    remove_filter('rest_pre_serve_request', 'rest_send_cors_headers');
    add_filter('rest_pre_serve_request', function($value) {
        header('Access-Control-Allow-Origin: *');
        header('Access-Control-Allow-Methods: POST, GET, OPTIONS, PUT, DELETE');
        header('Access-Control-Allow-Credentials: true');
        header('Access-Control-Allow-Headers: Origin, X-Requested-With, Content-Type, Accept');
        return $value;
    });
}, 15);

// Enable WooCommerce Bookings endpoints
add_filter('woocommerce_rest_api_enabled', '__return_true');
add_filter('woocommerce_rest_api_enable_bookings', '__return_true'); 