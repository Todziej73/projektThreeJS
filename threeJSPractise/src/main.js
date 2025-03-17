'use strict'
import * as THREE from 'three';
import {setUpObj} from './setup.js';
import { expansionHandles } from './expansionHandles';
import {load} from './rederObject.js';

const scene = setUpObj.scene;
const camera = setUpObj.camera;
const mouse = setUpObj.mouse;
const outlinePass = setUpObj.outlinePass

const raycaster = new THREE.Raycaster()
let intersects = [];
let currentBlock;

const borderCollapse = 0.057;

const inputColor = document.querySelector('.inputColor')
let currentColor = inputColor.value

const roundToDecimal = function(num){
  return Math.round(num * 1000) / 1000;
}


scene.add(expansionHandles)

//* on / off the buttons
const toggleAddBtn = function(addBtn, visible, layer){
 addBtn.visible = visible
 addBtn.layers.set(layer);
}

//* helper function - checks if on the given position exist any models 
const checkPosition = function(positionObj, x, y, z){
  return cubesPositions.get(JSON.stringify(Object.values({x: roundToDecimal(positionObj.x + x), y: roundToDecimal(positionObj.y + y), z: roundToDecimal(positionObj.z + z)})));
}

//* checks if there are any elements next to the current block (clicked) if so then the functions removes the unnecassary arrows (btns that add new blocks)
const checkSides = function(curentBlock){
  expansionHandles.children.forEach(function(addBtn, side){
    switch (side) {
      case 0: //check top
       if(checkPosition(curentBlock.position, 0, getModelSize(curentBlock).y - borderCollapse, 0)){
        toggleAddBtn(addBtn, false, 1)
      }else{
        toggleAddBtn(addBtn, true, 0)
      }
        break;
      case 2: //check right
        if(checkPosition(curentBlock.position, getModelSize(curentBlock).x - borderCollapse, 0, 0)){
          toggleAddBtn(addBtn, false, 1)
        }else if(curentBlock.position.y > 0 && !checkPosition(curentBlock.position, getModelSize(curentBlock).x - borderCollapse, -(getModelSize(curentBlock).y - borderCollapse), 0)){
          toggleAddBtn(addBtn, false, 1)
        }else{
          toggleAddBtn(addBtn, true, 0)
        }
        break;
      case 1: //check left
        if(checkPosition(curentBlock.position, -(getModelSize(curentBlock).x - borderCollapse), 0, 0)){
          toggleAddBtn(addBtn, false, 1)
        }else if(curentBlock.position.y > 0 && !checkPosition(curentBlock.position, -(getModelSize(curentBlock).x - borderCollapse), -(getModelSize(curentBlock).y - borderCollapse), 0)){
          toggleAddBtn(addBtn, false, 1)
        }else{
          toggleAddBtn(addBtn, true, 0)
        }
        break;
    }
  })
}


const meshGroup = new THREE.Group();
scene.add(meshGroup)
const cubesPositions = new Map();

//* returns the exact size of the model
const getModelSize = function(object){
  const boundingBox = new THREE.Box3().setFromObject(object)
  const size = boundingBox.getSize(new THREE.Vector3())
  return size;
}

//* adds new elements
const addCube = function (side) {
  switch (side) {
    case 0:
      load('model2.glb').then(function (gltf) {
        onObjectLoaded(gltf, [currentBlock.position.x, roundToDecimal(currentBlock.position.y + getModelSize(currentBlock).y - borderCollapse), currentBlock.position.z]);
      },function ( error ) {
        console.error( error );
      } )
      break;
    case 2:
      load('model2.glb').then(function (gltf) {
        onObjectLoaded(gltf, [roundToDecimal(currentBlock.position.x + getModelSize(currentBlock).x - borderCollapse), currentBlock.position.y, currentBlock.position.z]);
      },function ( error ) {
        console.error( error );
      } )
      break;
    case 1:
      load('model2.glb').then(function (gltf) {
        onObjectLoaded(gltf, [roundToDecimal(currentBlock.position.x - getModelSize(currentBlock).x + borderCollapse), currentBlock.position.y, currentBlock.position.z]);
      },function ( error ) {
        console.error( error );
      } )
  }

  
   
}
//* loads the first element
load('model2.glb').then(function ( gltf ) {
  const object = gltf.scene;

  meshGroup.add(object)
  currentBlock = meshGroup.children[0];
  cubesPositions.set(JSON.stringify(Object.values(object.position)), true)
  object.scale.set(2, 2, 2);
  console.log(cubesPositions);
  // outlinePass.selectedObjects = [currentBlock]
  console.log(getModelSize(object));
  checkSides(currentBlock)


}, function ( error ) {
  console.error( error );
});


//* when the model is loaded adds it to the scene and to the map
const onObjectLoaded = function (gltf, positions) {
  const object = gltf.scene;
  object.position.set(...positions)

  cubesPositions.set(JSON.stringify(positions.map((val) => roundToDecimal(val))), true);
  meshGroup.add(object)
  object.scale.set(2, 2, 2);
  console.log(getModelSize(object));
  console.log(cubesPositions);
  

  if(meshGroup.children.length > 1){
    checkSides(currentBlock)
  }
}


//* EVENTS


document.addEventListener('pointermove', function (e) {
  mouse.set((e.clientX / window.innerWidth) * 2 - 1, -(e.clientY / window.innerHeight) * 2 + 1);
  raycaster.setFromCamera(mouse, camera);
  intersects = raycaster.intersectObjects(scene.children);
  if(intersects.length > 0 && expansionHandles.children.includes(intersects[0].object)){
    document.querySelector('body').style.cursor = 'pointer';
    intersects[0].object.material.opacity = 0.8;
    intersects[0].object.material.color.set(0xadb5bd);
  }else{
    document.querySelector('body').style.cursor = 'default';
    expansionHandles.children.forEach(function(e){
      e.material.color.set(0xced4da)
      e.material.opacity = 0.6;
    })
  }
});

window.addEventListener('click', function (e) {
  if (intersects.length > 0) {
    const clickedEl = intersects[0].object;
    if (meshGroup.children.includes(clickedEl.parent.parent)) { //? if block was clicked
      currentBlock = clickedEl.parent.parent;
      checkSides(currentBlock)
    } else if (expansionHandles.children.includes(clickedEl)) { //? if the add btn was clicked
      const addBtnNr = expansionHandles.children.indexOf(clickedEl);
      addCube(addBtnNr)
    }
  }
});



// const unpdateColors = function(){
//   meshGroup.children.forEach((e) => e.material.color.set(currentColor))

// }

// inputColor.addEventListener('input', function(){
//   currentColor = this.value;
//   unpdateColors()
// });

