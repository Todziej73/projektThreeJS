import { configurationToJSON } from "./exportimport";
import html2canvas from "html2canvas";

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

const updateWooComerceForm = async () => {
  const productId = 1884;
  const imageUrl = await captureAndSendImage();
  // console.log("URL obrazka:", imageUrl);

  const body = new URLSearchParams();
  body.append("action", "add_custom_product_to_cart");
  body.append("product_id", productId);
  body.append("configuration", configurationToJSON());
  body.append("image_url", imageUrl);

  const res = await fetch("", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(configurationToJSON()),
  });

  const data = await res.json();
  if (data.success) {
    const price = data.price;
    alert("Cena: " + price + " zł");
    window.location.href = "/koszyk";
  } else {
    alert("Błąd: " + data.data);
  }
};

export async function getPrice() {
  const config = configurationToJSON();
  const res = await fetch(
    "https://klagem.pl/wp-content/plugins/customplugin/prices.php",
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(config),
    }
  );
  const data = await res.json();
  return data.price;
}

// -=-=-=-=-=-=-=-=-=-=-=-

document
  .querySelector("#add-to-cart")
  .addEventListener("click", updateWooComerceForm);
