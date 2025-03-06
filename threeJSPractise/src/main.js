'use strict'
import * as THREE from 'three';
import {OrbitControls} from 'three/addons/controls/OrbitControls.js';
import {setup} from './setup.js';

const setupObj = setup();
const scene = setupObj.scene;
let width = setupObj.width;
let height = setupObj.height;
const camera = setupObj.camera;
const renderer = setupObj.rederer;
const controls = setupObj.controls;
const mouse = setupObj.mouse;

const raycaster = new THREE.Raycaster()
let intersects = [];
let currentBlock;

class Cube extends THREE.Mesh {
  constructor() {
    super()
    this.geometry = new THREE.BoxGeometry(1, 1, 1);
    this.material = new THREE.MeshStandardMaterial({
      color: '#212529'
    });
  }
  sibblingNextTo = [];
}

Cube.prototype.onClick = function () {
  const clickedPosition = this.position
  addBlockOutline.position.copy(clickedPosition);
}
// ! PROTOTYPE
const addBlockOutline = new THREE.Group();

const createTriangle = function (vertecies) {
  const triangleGeo = new THREE.BufferGeometry();
  const triangleVertecies = new Float32Array([...vertecies]);
  triangleGeo.setAttribute('position', new THREE.BufferAttribute(triangleVertecies, 3))
  const triangleMaterial = new THREE.MeshStandardMaterial({
    color: 'yellow',
    side: THREE.DoubleSide
  })
  const triangle = new THREE.Mesh(triangleGeo, triangleMaterial)
  addBlockOutline.add(triangle)
}
createTriangle([0.0, 0.8, 0.6, -0.5, 0.6, 0.6, 0.5, 0.6, 0.6])
createTriangle([-0.8, 0.0, 0.6, -0.6, 0.5, 0.6, -0.6, -0.5, 0.6])
createTriangle([0.8, 0.0, 0.6, 0.6, 0.5, 0.6, 0.6, -0.5, 0.6])
scene.add(addBlockOutline)
//! PROTOTYPE



const meshGroup = new THREE.Group();
const cubesPositions = new Map();

const addCube = function (side) {
  const cube = new Cube()
  switch (side) {
    case 0:
      cube.position.set(currentBlock.position.x, currentBlock.position.y + 1, currentBlock.position.z)
      break;
    case 2:
      cube.position.set(currentBlock.position.x + 1, currentBlock.position.y, currentBlock.position.z)
      break;
    case 1:
      cube.position.set(currentBlock.position.x - 1, currentBlock.position.y, currentBlock.position.z)
      break;
  }

  if (!cubesPositions.get(JSON.stringify(Object.values(cube.position)))) {
    cubesPositions.set(JSON.stringify(Object.values(cube.position)), true);
    console.log(cubesPositions)
    meshGroup.add(cube)
  } else {
    console.log("Obiekt juz tu istnieje!");
  }
}
addCube()
currentBlock = meshGroup.children[0];
scene.add(meshGroup)

//* EVENTS


document.addEventListener('pointermove', function (e) {
  mouse.set((e.clientX / width) * 2 - 1, -(e.clientY / height) * 2 + 1);
  raycaster.setFromCamera(mouse, camera);
  intersects = raycaster.intersectObjects(scene.children);
});

window.addEventListener('click', function (e) {
  if (intersects.length > 0) {
    const clickedEl = intersects[0].object;

    if (clickedEl.onClick) { //? if block was clicked
      clickedEl.onClick();
      currentBlock = clickedEl;

    } else if (addBlockOutline.children.includes(clickedEl)) { //? if the add btn was clicked
      const addBtnNr = addBlockOutline.children.indexOf(clickedEl);
      addCube(addBtnNr)
    }
  }
});


