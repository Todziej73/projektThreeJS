'use strict'

import * as THREE from 'three';


export const roundToDecimal = function (num) {
  return Math.round(num * 1000) / 1000;
};

//* returns data from map<position, data> | copy of that data
export const dataFromPosition = function (cubesPositions, x, y, z) {
  const key = JSON.stringify([x, y, z].map((el) => el = roundToDecimal(el)));
  if (cubesPositions.has(key))
    return { ...cubesPositions.get(key) };

  return undefined;
};

//* returns the exact size of the model
export const getModelSize = function (object) {
  const boundingBox = new THREE.Box3().setFromObject(object);
  const size = boundingBox.getSize(new THREE.Vector3());
  return size;
};

//* generate points based on the objects/ width height
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
export const getSizeParametersFromModel = function (name) {
  // np. 729x383x222.glb => [729, 383, 222]
  const params = name.split('x');
  return {
    width: parseInt(params[0]),
    depth: parseInt(params[1]),
    height: parseInt(params[2].split(".")[0]),
  };
};

