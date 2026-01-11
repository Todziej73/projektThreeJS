import { configurationToJSON } from "./exportimport";
import html2canvas from "html2canvas";

export async function getPrice() {
  const form = new FormData();
  form.append("action", "get_price");
  form.append("config", JSON.stringify(configurationToJSON()));

  const res = await fetch("/wp-admin/admin-ajax.php", {
    method: "POST",
    body: form,
  });
  const data = await res.json();
  if (data) return data.data.price; // WordPress zwraca { success, data{price} }
}

const captureAndSendImage = async () => {
  const node = document.querySelector("canvas");

  const canvas = await html2canvas(node);
  const dataUrl = canvas.toDataURL("image/png");

  const formData = new FormData();
  formData.append("action", "upload_custom_product_image");
  formData.append("image", dataUrl);

  const res = await fetch("/wp-admin/admin-ajax.php", {
    method: "POST",
    body: formData,
  });

  const data = await res.json();
  console.log(data);

  return data?.data?.url;
};

const addCustomProductToCart = async () => {
  const imageUrl = await captureAndSendImage();

  const formData = new FormData();
  formData.append("action", "add_custom_product_to_cart");
  formData.append("config", JSON.stringify(configurationToJSON()));
  formData.append("image_url", imageUrl);

  const res = await fetch("/wp-admin/admin-ajax.php", {
    method: "POST",
    body: formData,
  });

  const data = await res.json();
  if (data.success) {
    alert("Dodano produkt do koszyka!");
    window.location.href = "/koszyk";
  } else {
    alert("Błąd: " + data.data);
  }
};

// -=-=-=-=-=-=-=-=-=-=-=-

document
  .querySelector("#add-to-cart")
  .addEventListener("click", addCustomProductToCart);
