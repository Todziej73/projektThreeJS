import { getFullPrice } from "./prices";

const updateWooComerceForm = async() => {

    const productId = 1884;
    const price = getFullPrice();

    const res = await fetch("/wp-admin/admin-ajax.php?action=add_custom_product_to_cart", {
        method: "POST",
        headers: {
            "Content-Type": "application/x-www-form-urlencoded",
        },
        body: `product_id=${productId}&custom_price=${price}`
    });

    const data = await res.json();
    if (data.success) {
        alert("Dodano produkt do koszyka z ceną: " + price + " zł");
        window.location.href = "/koszyk";
    } else {
        alert("Błąd: " + data.data);
    }
}





// -=-=-=-=-=-=-=-=-=-=-=-

document.querySelector("#add-to-cart").addEventListener("click", updateWooComerceForm);