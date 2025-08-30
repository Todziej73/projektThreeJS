import { configurationToJSON } from "./exportimport";
import html2canvas from "html2canvas";

export async function getPrice() {
  const form = new FormData();
  form.append("action", "get_price");
  form.append("config", JSON.stringify(configurationToJSON()));

  const res = await fetch("https://klagem.pl/wp-admin/admin-ajax.php", {
    method: "POST",
    credentials: "include",
    body: form,
  });
  const data = await res.json();
  return data.data.price; // WordPress zwraca { success, data:{ price } }
}

export const captureAndSendImage = async () => {
  const node = document.querySelector("canvas");
  if (!node) throw new Error("Nie znaleziono <canvas>.");

  const canvas = await html2canvas(node);
  const dataUrl = canvas.toDataURL("image/png"); // data:image/png;base64,...

  const form = new FormData();
  form.append("action", "upload_custom_product_image");
  form.append("image", dataUrl);

  const res = await fetch("https://klagem.pl/wp-admin/admin-ajax.php", {
    method: "POST",
    credentials: "include",
    body: form,
  });

  const data = await res.json();
  if (!data?.success) throw new Error(data?.data || "Błąd uploadu obrazu");
  return data.data.url; // URL pliku w uploads
};

export async function addCustomProductToCart() {
  const form = new FormData();
  const imageUrl = await captureAndSendImage();
  form.append("action", "add_custom_product_to_cart");
  form.append("image_url", imageUrl || "");
  form.append("config", JSON.stringify(configurationToJSON()));

  const res = await fetch("https://klagem.pl/wp-admin/admin-ajax.php", {
    method: "POST",
    credentials: "include",
    body: form,
  });

  const data = await res.json();
  if (!data?.success) throw new Error(data?.data || "Błąd dodania do koszyka");
  return data;
}

// -=-=-=-=-=-=-=-=-=-=-=-

document
  .querySelector("#add-to-cart")
  .addEventListener("click", addCustomProductToCart);
