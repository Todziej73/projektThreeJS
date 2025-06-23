'use strict'

import * as THREE from 'three';
import { changeFrameColor, changeObjectColor, checkPosition, cubesPositions, currentBlock, hasValue, setCurrentBlock } from './main';
import { color } from 'three/src/nodes/TSL.js';

export const roundToDecimal = function (num) {
  return Math.round(num * 1000) / 1000;
};

//* returns data from map<position, data> | copy of that data
/**
 * 
 * @param {Map} cubesPositions 
 * @param {number} x 
 * @param {number} y 
 * @param {number} z 
 * @returns {{x_index: number, y_index: number}}
 */
export const dataFromPosition = function (cubesPositions, x, y, z) {
  const key = JSON.stringify([x, y, z].map((el) => el = roundToDecimal(el)));
  if (cubesPositions.has(key))
    return { ...cubesPositions.get(key) };

  return undefined;
};

/**
 * 
 * @param {Map} cubesPositions 
 * @param {THREE.Vector3} vector 
 */
export const dataFromPositionVector = function(cubesPositions, vector){
  return dataFromPosition(cubesPositions, vector.x, vector.y, vector.z);
}

//* returns the exact size of the model
export const getModelSize = function (object) {
  const boundingBox = new THREE.Box3().setFromObject(object);
  const size = boundingBox.getSize(new THREE.Vector3());
  return size;
};

//* generate points based on the objects/ width height
/**
 * 
 * @param {THREE.Mesh} object 
 * @returns 
 */
export const generatePoints = function (object) {
  const objectSize = Object.values(getModelSize(object));
  const width = objectSize[0];
  const height = objectSize[1];


  const box = new THREE.Box3().setFromObject(object);
  const center = new THREE.Vector3();
  box.getCenter(center);
  const centerX = center.x;
  const centerY = center.y;


  return {
    top: new THREE.Vector2(centerX, roundToDecimal(centerY + height / 2)),
    bottom: new THREE.Vector2(centerX, roundToDecimal(centerY - height / 2)),
    right: new THREE.Vector2(roundToDecimal(centerX + width / 2), centerY),
    left: new THREE.Vector2(roundToDecimal(centerX - width / 2), centerY),
    center: new THREE.Vector2(centerX, centerY),

    topLeft: new THREE.Vector2(roundToDecimal(centerX - width / 2), roundToDecimal(centerY + height / 2)),
    topRight: new THREE.Vector2(roundToDecimal(centerX + width / 2), roundToDecimal(centerY + height / 2)),
    bottomRight: new THREE.Vector2(roundToDecimal(centerX + width / 2), roundToDecimal(centerY - height / 2)),
    bottomLeft: new THREE.Vector2(roundToDecimal(centerX - width / 2), roundToDecimal(centerY - height / 2))
  };
};

/**
 *
 * @param {string} name
 */
export const getParametersFromModel = function (name) {
  // np. klagem/module_F/Legged/729x383x222.glb => [729, 383, 222]
  const splitted = name.split("/");
  const onlyname = splitted[splitted.length - 1];
  const params = onlyname.split('x');
  
  return {
    module: splitted[1],
    type: splitted[2],
    width: parseInt(params[0]),
    depth: parseInt(params[1]),
    height: parseInt(params[2].split(".")[0]),
  };
};

/**
 *
 * @param {Map} map
 * @param {THREE.Group} group
 * @param {number} x_index
 * @param {number} y_index
 * @returns {[THREE.Mesh]}
 */
export const select = function (map, group, x_index = null, y_index = null) {
  const ret = [];

  group.children.forEach(el => {
    const data = dataFromPosition(map, el.position.x, el.position.y, el.position.z); // { x_index: ?, y_index: ? }
    if (x_index != null && y_index != null && (data.x_index == x_index && data.y_index == y_index)) ret.push(el); // x i y
    else if (x_index != null && y_index == null && (data.x_index == x_index)) ret.push(el); // x
    else if (x_index == null && y_index != null && (data.y_index == y_index)) ret.push(el); // y
    else if (x_index == null && y_index == null) ret.push(el); // wszystkie
  });


  return ret;
};

/**
 * @param {Map} map 
 */
export const extremeValues = function(map) {
  
  if (map.size <= 0) {
    console.error("Map is empty!");
    return;
  }

  const first = map.values().toArray()[0];
  
  let min_x = first.x_index;
  let max_x = first.x_index;
  let min_y = first.y_index;
  let max_y = first.y_index;

  map.forEach(el => {
    if (el.x_index < min_x) min_x = el.x_index;
    if (el.x_index > max_x) max_x = el.x_index;
    if (el.y_index < min_y) min_y = el.y_index;
    if (el.y_index > max_y) max_y = el.y_index;
  });

  return { min_x, max_x, min_y, max_y };
};

/**
 * @param {[THREE.Mesh]} array
 * @returns {{min_x: number, max_x: number, min_x_Object: THREE.Mesh, max_x_Object: THREE.Mesh, min_y: number, max_y: number, min_y_Object: THREE.Mesh, max_y_Object: THREE.Mesh}}
 */
export const extremeInArray = function(array) {
  if (array.length <= 0) {
      console.error("Array is empty!");
      return null;
  }

  const first = dataFromPosition(cubesPositions, array[0].position.x, array[0].position.y, array[0].position.z);

  let min_x = first.x_index, min_x_Object = array[0];
  let max_x = first.x_index, max_x_Object = array[0];
  let min_y = first.y_index, min_y_Object = array[0];
  let max_y = first.y_index, max_y_Object = array[0];

  array.forEach(el => {
      const data = dataFromPosition(cubesPositions, el.position.x, el.position.y, el.position.z);

      if (data.x_index < min_x) {
          min_x = data.x_index;
          min_x_Object = el;
      }
      if (data.x_index > max_x) {
          max_x = data.x_index;
          max_x_Object = el;
      }
      if (data.y_index < min_y) {
          min_y = data.y_index;
          min_y_Object = el;
      }
      if (data.y_index > max_y) {
          max_y = data.y_index;
          max_y_Object = el;
      }
  });

  return { min_x, max_x, min_x_Object, max_x_Object, min_y, max_y, min_y_Object, max_y_Object };
};

/**
 * 
 * @param { import('three/examples/jsm/loaders/GLTFLoader.js').GLTF } model - GLTF model
 * @param { string } pathName - Path of the model, it will be used as a name of a clone (clone.name = pathName)
 * @param { THREE.Object3D } el - [optional] Element that it is based off. It's used to determine clone's position and color
 * @returns { THREE.Object3D }
 */
export const modelToClone = function(model, pathName, el = null){
  const clone = model.scene.clone();
  const parameters = getParametersFromModel(pathName);
  const isfblrtb = parameters.module.split('_')[1] == "FBLRTB"; // exception for this exact module (cause it has no walls)

  
  if(isfblrtb && parameters.type != "Legged"){
    const newgroup = new THREE.Group();
    const transport = clone.children[0].children[0];
    console.log('Transport: ', transport);
    
    clone.children[0].remove(transport);
    clone.children[0].add(newgroup);
    newgroup.add(transport);
    console.log('Clone: ', clone);
    
  }

  const meshes = clone.children[0].children[0];


  while(meshes.children.length <= 2)
    meshes.add(new THREE.Mesh());

  if(isfblrtb && parameters.type == "Legged"){ 
      const moved = meshes.children.splice(1, 1)[0];
      meshes.add(moved);
  }

  // console.log(meshes);
  

  clone.traverse((child) => {
    if (child.isMesh && child.material) {
      child.material = child.material.clone();
    }
  });
  clone.name = pathName;

  if(el){
    const objectColor = el.children[0].children[0].children[1].material.color;
    const frameColor = el.children[0].children[0].children[0].material.color;
    clone.position.set(roundToDecimal(el.position.x), roundToDecimal(el.position.y), roundToDecimal(el.position.z));
    changeObjectColor(clone, objectColor);
    changeFrameColor(clone, frameColor);
    if(currentBlock == el)
      setCurrentBlock(clone);
  }

  
  
  return clone;
}

/**
 * 
 * @param {THREE.Mesh} object 
 * @returns {THREE.Color}
 */
export const getFrameColor = function(object){
  const meshToChange = object.children[0].children[0].children[0];
  return meshToChange.material.color;
}

/**
 * 
 * @param {THREE.Mesh} object 
 * @returns {THREE.Color}
 */
export const getObjectColor = function(object){
  const meshToChange = object.children[0].children[0].children[1];
  return meshToChange.material.color;
}

/**
 * 
 * @param {string} name 
 */
export const nameToColor = function(name) {
  const colorMap = new Map();
  colorMap.set('gold', 16766720);
  colorMap.set('9005', 2500134);
  colorMap.set('bronze', 13467442);

  if (colorMap.has(name)) {
    const hex = colorMap.get(name);
    return new THREE.Color().setHex(hex);
  }

  return new THREE.Color(0, 0, 0);
};

/**
 * 
 * @param {THREE.Mesh} object 
 */
export const checkConnections = function(object){
  const parameters = getParametersFromModel(object.name);
  const checkPos = checkPosition(object.position);
  const blockOnTop = checkPos[0];
  const blockOnLeft = checkPos[1];
  const blockOnRight = checkPos[2];
  const blockOnBottom = parameters.type == 'Legged';

  const leftTopSides = blockOnTop + blockOnLeft + 3;
  const rightTopSides = blockOnTop + blockOnRight + 3;
  const leftBottomSides = blockOnBottom + blockOnLeft + 3;
  const rightBottomSides = blockOnBottom + blockOnRight + 3;
  

  return {
    'leftTopSides': leftTopSides,
    'rightTopSides': rightTopSides,
    'leftBottomSides': leftBottomSides,
    'rightBottomSides': rightBottomSides
  }
}

/**
 * 
 * @param {THREE.Group} object 
 */
export const getFullObjectData = function(object){
  const modelParameters = getParametersFromModel(object.name);
  const frameColor = getFrameColor(object);
  const objectColor = getObjectColor(object);
  
  const data = {
      'parameters': modelParameters,
      'colors': {'frameColor':frameColor, 'objectColor': objectColor}
  }
  
  return data;
}

/**
 * 
 * @param {THREE.Group} object 
 */
export const boxesAround = function(object){
  let posChecked = [true, true, true];
  const currentData = dataFromPositionVector(cubesPositions, object.position);
  
  if (hasValue(cubesPositions, currentData.x_index, currentData.y_index + 1)) posChecked[0] = false;
  if (hasValue(cubesPositions, currentData.x_index - 1, currentData.y_index)) posChecked[1] = false;
  if (hasValue(cubesPositions, currentData.x_index + 1, currentData.y_index)) posChecked[2] = false;
  
  const boxesAround = {
      "top": !posChecked[0],
      "bottom": getParametersFromModel(object.name).type != "Legged",
      "left": !posChecked[1],
      "right": !posChecked[2]
  };

  return boxesAround;
}

/**
 * 
 * @param {THREE.Vector2} vec2 
 * @param {number} z 
 * @returns 
 */
export const vec2toVec3 = function(vec2, z = 0) {
  return new THREE.Vector3(vec2.x, vec2.y, z);
}