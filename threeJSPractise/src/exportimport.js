import { cubesPositions, meshGroup, spawnCube } from "./main.js";
import {
  boxesAround,
  checkConnections,
  dataFromPositionVector,
  getFrameColor,
  getObjectColor,
  getParametersFromModel,
  updatePrice,
} from "./helpers.js";
import { jointsGroup } from "./connections.js";

export const configurationToJSON = function () {
  const payload = meshGroup.children.map((obj) => {
    return {
      name: obj.name, // np. klagem/module_F/Legged/729x383x222.glb
      position: obj.position.clone(),
      parameters: getParametersFromModel(obj.name),
      material: {
        color: getObjectColor(obj),
        frameColor: getFrameColor(obj),
      },
      data: dataFromPositionVector(cubesPositions, obj.position),
      connections: checkConnections(obj),
      boxesAround: boxesAround(obj),
    };
  });
  return payload;
};

export const exportConfiguration = function () {
  const payload = configurationToJSON();
  const data = JSON.stringify(payload, null, 2);
  const blob = new Blob([data], { type: "application/json" });
  const url = URL.createObjectURL(blob);

  const a = document.createElement("a");
  a.href = url;
  a.download = "configuration.klg";
  a.click();

  URL.revokeObjectURL(url);
};

export const importConfiguration = function () {
  const input = document.createElement("input");
  input.type = "file";
  input.accept = ".klg,application/json";

  input.onchange = (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      let text = e.target.result.trim().toString();
      if (text.includes('\\"')) {
        text = text.replace(/\\"/g, '"');
      }
      console.log(text);
      const data = JSON.parse(text);
      importConfigurationFromJSON(data);
    };

    reader.readAsText(file);
  };

  document.body.appendChild(input);
  input.click();
};

export const importConfigurationFromJSON = function (data) {
  meshGroup.clear();
  jointsGroup.clear();
  cubesPositions.clear();
  for (const rec of data) {
    spawnCube(rec);
  }
};

document.querySelector("#export").addEventListener("click", (e) => {
  exportConfiguration();
});

document.querySelector("#import").addEventListener("click", (e) => {
  importConfiguration();
  updatePrice();
});
