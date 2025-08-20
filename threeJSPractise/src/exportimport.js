import { addCube, changeObjectColor, cubesPositions, meshGroup, scene, spawnCube } from "./main.js";
import { dataFromPositionVector, getFrameColor, getObjectColor, getParametersFromModel } from "./helpers.js";
import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import { jointsGroup } from "./connections.js";


export const configurationToJSON = function(){
    const payload = meshGroup.children.map(obj => {
    return {
      name: obj.name, // np. klagem/module_F/Legged/729x383x222.glb
      position: obj.position.clone(),
      material: {
        color: getObjectColor(obj),
        frameColor: getFrameColor(obj)
      },
      data: dataFromPositionVector(cubesPositions, obj.position)
    };
  });
  return payload;
}

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
  input.accept = ".klg";

  input.onchange = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (e) => {
      try {
        const data = JSON.parse(e.target.result);
        importConfigurationFromJSON(data);
        console.log("Zaimportowano konfigurację:", data.length, "elementów");
      } catch (error) {
        console.error("Błąd przy imporcie konfiguracji:", error);
      }
    };
    reader.readAsText(file);
  };

  input.click();
};

export const importConfigurationFromJSON = function (data) {
    meshGroup.clear();
    jointsGroup.clear();
    cubesPositions.clear();
    for (const rec of data) {
        spawnCube(rec);
    }
}
