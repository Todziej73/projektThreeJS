<?php
require "prices-lib.php";

/**
 * Dodanie customowego produktu do koszyka z własną ceną i konfiguracją.
 */
function add_custom_product($json) {
    importPrices();
    loadFullData($json);

    $product_id = 1884;
    $qty        = 1;
    $price      = (float) getFullPrice();
    $config     = $json;

    $cart_item_data = [
        '_custom_price' => $price,
        '_config'       => $config,
        '_unique'       => md5( wp_json_encode($config) . microtime(true) . wp_rand() ),
    ];

    // Dodaj do koszyka
    $cart_item_key = WC()->cart->add_to_cart($product_id, $qty, 0, [], $cart_item_data);

    return $cart_item_key;
}
