'use strict'
import * as THREE from 'three';
import {setUpObj} from './setup.js';
import { expansionHandles } from './expansionHandles';

const scene = setUpObj.scene;
const camera = setUpObj.camera;
const mouse = setUpObj.mouse;
const outlinePass = setUpObj.outlinePass

const raycaster = new THREE.Raycaster()
let intersects = [];
let currentBlock;


const inputColor = document.querySelector('.inputColor')
let currentColor = inputColor.value





class Cube extends THREE.Mesh {
  constructor() {
    super()
    this.geometry = new THREE.BoxGeometry(1, 1, 1);
    this.material = new THREE.MeshPhysicalMaterial({
      color: currentColor,
      roughness: 0.5,
    });
  }
}

Cube.prototype.onClick = function () {
  const clickedPosition = this.position
  outlinePass.selectedObjects = [this]
  expansionHandles.position.copy(clickedPosition);
  currentBlock = this;
  checkSides(clickedPosition);
}

scene.add(expansionHandles)

const checkPosition = function(positionObj, x, y, z){
  return cubesPositions.get(JSON.stringify(Object.values({x: positionObj.x + x, y: positionObj.y + y, z: positionObj.z + z})));
}

const toggleAddBtn = function(addBtn, visible, layer){
 addBtn.visible = visible
 addBtn.layers.set(layer);
}

const checkSides = function(clickedPosition){
  expansionHandles.children.forEach(function(addBtn, side){
    switch (side) {
      case 0: //check top
       if(checkPosition(clickedPosition, 0, 1, 0)){
        toggleAddBtn(addBtn, false, 1)
      }else{
        toggleAddBtn(addBtn, true, 0)
      }
        break;
      case 2: //check right
        if(checkPosition(clickedPosition, 1, 0, 0)){
          toggleAddBtn(addBtn, false, 1)
        }else if(clickedPosition.y > 0 && !checkPosition(clickedPosition, 1, -1, 0)){
          toggleAddBtn(addBtn, false, 1)
        }else{
          toggleAddBtn(addBtn, true, 0)
        }
        break;
      case 1: //check left
        if(checkPosition(clickedPosition, -1, 0, 0)){
          toggleAddBtn(addBtn, false, 1)
        }else if(clickedPosition.y > 0 && !checkPosition(clickedPosition, -1, -1, 0)){
          toggleAddBtn(addBtn, false, 1)
        }else{
          toggleAddBtn(addBtn, true, 0)
        }
    }
  })
}



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

  
    cubesPositions.set(JSON.stringify(Object.values(cube.position)), true);
    console.log(cubesPositions)
    meshGroup.add(cube)

    if(meshGroup.children.length > 1){
      checkSides(currentBlock.position)
    }
}
addCube()
currentBlock = meshGroup.children[0];
outlinePass.selectedObjects = [currentBlock]
checkSides(currentBlock.position)
scene.add(meshGroup)


//* EVENTS


document.addEventListener('pointermove', function (e) {
  mouse.set((e.clientX / window.innerWidth) * 2 - 1, -(e.clientY / window.innerHeight) * 2 + 1);
  raycaster.setFromCamera(mouse, camera);
  intersects = raycaster.intersectObjects(scene.children);
  if(intersects.length > 0 && expansionHandles.children.includes(intersects[0].object)){
    document.querySelector('body').style.cursor = 'pointer';
  }else{
    document.querySelector('body').style.cursor = 'default';
  }
});

window.addEventListener('click', function (e) {
  if (intersects.length > 0) {
    const clickedEl = intersects[0].object;

    if (clickedEl.onClick) { //? if block was clicked
      clickedEl.onClick();
    } else if (expansionHandles.children.includes(clickedEl)) { //? if the add btn was clicked
      const addBtnNr = expansionHandles.children.indexOf(clickedEl);
      addCube(addBtnNr)
    }
  }
});


const unpdateColors = function(){
  meshGroup.children.forEach((e) => e.material.color.set(currentColor))

}

inputColor.addEventListener('input', function(){
  currentColor = this.value;
  unpdateColors()
});

