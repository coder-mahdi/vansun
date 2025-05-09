<?php
/**
 * vansunstudio-cms functions and definitions
 *
 * @link https://developer.wordpress.org/themes/basics/theme-functions/
 *
 * @package vansunstudio-cms
 */

if ( ! defined( '_S_VERSION' ) ) {
	// Replace the version number of the theme on each release.
	define( '_S_VERSION', '1.0.0' );
}

/**
 * Sets up theme defaults and registers support for various WordPress features.
 */
function vansunstudio_cms_setup() {
	load_theme_textdomain( 'vansunstudio-cms', get_template_directory() . '/languages' );
	add_theme_support( 'automatic-feed-links' );
	add_theme_support( 'title-tag' );
	add_theme_support( 'post-thumbnails' );

	register_nav_menus(
		array(
			'menu-1' => esc_html__( 'Primary', 'vansunstudio-cms' ),
		)
	);

	add_theme_support(
		'html5',
		array(
			'search-form',
			'comment-form',
			'comment-list',
			'gallery',
			'caption',
			'style',
			'script',
		)
	);

	add_theme_support(
		'custom-background',
		apply_filters(
			'vansunstudio_cms_custom_background_args',
			array(
				'default-color' => 'ffffff',
				'default-image' => '',
			)
		)
	);

	add_theme_support( 'customize-selective-refresh-widgets' );

	add_theme_support(
		'custom-logo',
		array(
			'height'      => 250,
			'width'       => 250,
			'flex-width'  => true,
			'flex-height' => true,
		)
	);
}
add_action( 'after_setup_theme', 'vansunstudio_cms_setup' );

/**
 * Set the content width in pixels
 */
function vansunstudio_cms_content_width() {
	$GLOBALS['content_width'] = apply_filters( 'vansunstudio_cms_content_width', 640 );
}
add_action( 'after_setup_theme', 'vansunstudio_cms_content_width', 0 );

/**
 * Register widget area.
 */
function vansunstudio_cms_widgets_init() {
	register_sidebar(
		array(
			'name'          => esc_html__( 'Sidebar', 'vansunstudio-cms' ),
			'id'            => 'sidebar-1',
			'description'   => esc_html__( 'Add widgets here.', 'vansunstudio-cms' ),
			'before_widget' => '<section id="%1$s" class="widget %2$s">',
			'after_widget'  => '</section>',
			'before_title'  => '<h2 class="widget-title">',
			'after_title'   => '</h2>',
		)
	);
}
add_action( 'widgets_init', 'vansunstudio_cms_widgets_init' );

/**
 * Enqueue scripts and styles.
 */
function vansunstudio_cms_scripts() {
	wp_enqueue_style( 'vansunstudio-cms-style', get_stylesheet_uri(), array(), _S_VERSION );
	wp_style_add_data( 'vansunstudio-cms-style', 'rtl', 'replace' );
	wp_enqueue_script( 'vansunstudio-cms-navigation', get_template_directory_uri() . '/js/navigation.js', array(), _S_VERSION, true );

	if ( is_singular() && comments_open() && get_option( 'thread_comments' ) ) {
		wp_enqueue_script( 'comment-reply' );
	}
}
add_action( 'wp_enqueue_scripts', 'vansunstudio_cms_scripts' );

/**
 * Required files
 */
require get_template_directory() . '/inc/custom-header.php';
require get_template_directory() . '/inc/template-tags.php';
require get_template_directory() . '/inc/template-functions.php';
require get_template_directory() . '/inc/customizer.php';

if ( defined( 'JETPACK__VERSION' ) ) {
	require get_template_directory() . '/inc/jetpack.php';
}

// Enable WooCommerce Bookings REST API
add_filter('woocommerce_rest_api_enabled', '__return_true');
add_filter('woocommerce_rest_api_enable_bookings', '__return_true');

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

// Add support for WooCommerce
function vansunstudio_cms_add_woocommerce_support() {
    add_theme_support('woocommerce');
    add_theme_support('wc-product-gallery-zoom');
    add_theme_support('wc-product-gallery-lightbox');
    add_theme_support('wc-product-gallery-slider');
}
add_action('after_setup_theme', 'vansunstudio_cms_add_woocommerce_support');

// Register Custom Booking Endpoint
function register_booking_endpoint() {
    register_rest_route('vansunstudio/v1', '/booking', array(
        'methods' => 'POST',
        'callback' => 'handle_booking_creation',
        'permission_callback' => '__return_true'
    ));
}
add_action('rest_api_init', 'register_booking_endpoint');

// Add custom fields to bookings
function add_custom_booking_fields($booking_data) {
    // Add custom fields to booking data
    $booking_data['meta_data'] = array(
        array(
            'key' => '_booking_customer_name',
            'value' => $booking_data['full_name']
        ),
        array(
            'key' => '_booking_customer_email',
            'value' => $booking_data['email_address']
        ),
        array(
            'key' => '_booking_customer_phone',
            'value' => $booking_data['phone']
        )
    );
    
    return $booking_data;
}
add_filter('woocommerce_booking_data', 'add_custom_booking_fields');

// Modify handle_booking_creation function to use custom fields
function handle_booking_creation($request) {
    // Check if WooCommerce is active
    if (!function_exists('WC')) {
        return new WP_Error('woocommerce_not_active', 'WooCommerce is not active', array('status' => 500));
    }

    // Check if WooCommerce Bookings is active
    if (!class_exists('WC_Booking')) {
        return new WP_Error('bookings_not_active', 'WooCommerce Bookings is not active', array('status' => 500));
    }

    // Include WooCommerce Bookings files if needed
    if (!function_exists('wc_get_product')) {
        require_once(WP_PLUGIN_DIR . '/woocommerce/includes/wc-product-functions.php');
    }

    $params = $request->get_params();
    
    // Debug information
    error_log('Booking endpoint called');
    error_log('Request parameters: ' . print_r($params, true));

    // Validate required fields
    if (empty($params['full_name']) || 
        empty($params['email']) || 
        empty($params['phone']) || 
        empty($params['booking_date']) || 
        empty($params['booking_time']) || 
        empty($params['product_id']) ||
        empty($params['recaptcha_token'])) {
        error_log('Missing required fields');
        return new WP_Error('missing_fields', 'All fields are required', array('status' => 400));
    }

    // Verify reCAPTCHA token
    $recaptcha_secret = "6Lez4zErAAAAADLh3bipgwi75nB6a9_01BQg9aBI"; // Secret key for reCAPTCHA verification
    $recaptcha_response = $params['recaptcha_token'];
    
    $verify_url = "https://www.google.com/recaptcha/api/siteverify";
    $data = array(
        'secret' => $recaptcha_secret,
        'response' => $recaptcha_response
    );

    $options = array(
        'http' => array(
            'header' => "Content-type: application/x-www-form-urlencoded\r\n",
            'method' => 'POST',
            'content' => http_build_query($data)
        )
    );

    $context = stream_context_create($options);
    $verify_response = file_get_contents($verify_url, false, $context);
    $captcha_success = json_decode($verify_response);

    if (!$captcha_success->success) {
        error_log('reCAPTCHA verification failed');
        return new WP_Error('recaptcha_failed', 'reCAPTCHA verification failed', array('status' => 400));
    }

    // Get the product
    $product = wc_get_product($params['product_id']);
    if (!$product || !is_a($product, 'WC_Product_Booking')) {
        error_log('Invalid product or not a booking product');
        return new WP_Error('invalid_product', 'Invalid booking product', array('status' => 400));
    }

    // Create booking data
    $booking_data = array(
        'product_id' => $params['product_id'],
        'start_date' => $params['booking_date'] . ' ' . $params['booking_time'],
        'end_date' => $params['booking_date'] . ' ' . $params['booking_time'],
        'full_name' => $params['full_name'],
        'email_address' => $params['email'],
        'phone' => $params['phone']
    );

    // Apply custom fields filter
    $booking_data = apply_filters('woocommerce_booking_data', $booking_data);

    // Create the booking
    $booking = new WC_Booking();
    $booking->set_props($booking_data);
    $booking->save();

    return array(
        'success' => true,
        'booking_id' => $booking->get_id(),
        'message' => 'Booking created successfully'
    );
} 