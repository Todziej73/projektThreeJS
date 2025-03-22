'use strict'
import * as THREE from 'three';
import {setUpObj} from './setup.js';
import { expansionHandles, createAddBtns} from './expansionHandles';
import {load} from './rederObject.js';
import { faceForward, round } from 'three/src/nodes/TSL.js';

const scene = setUpObj.scene;
const camera = setUpObj.camera;
const mouse = setUpObj.mouse;
const outlinePass = setUpObj.outlinePass;

const raycaster = new THREE.Raycaster();
let intersects = [];
let currentBlock;

const borderCollapse = 0.057;

const inputColor = document.querySelector('.inputColor');
let currentColor = inputColor.value;

const roundToDecimal = function(num){
  return Math.round(num * 1000) / 1000;
}


scene.add(expansionHandles);

//* on / off the buttons
const toggleAddBtn = function(addBtn, visible, layer){
 addBtn.visible = visible;
 addBtn.layers.set(layer);
}


const hasValue = function(map, posX, posY){
  let has = false;
  map.forEach(function(el){
    if(el.x_index === posX && el.y_index === posY){
      has = true;
    }
  })
  return has;
}

//* helper function - checks if on the given position exist any models 
const checkPosition = function(positionObj){
  let addOption = [true, true, true]; 
  const currentData = dataFromPosition(...Object.values(positionObj));

  if(hasValue(cubesPositions, currentData.x_index, currentData.y_index + 1)) addOption[0] = false;
  if(hasValue(cubesPositions, currentData.x_index + 1, currentData.y_index)) addOption[1] = false;
  if(currentData.y_index != 0 && !hasValue(cubesPositions, currentData.x_index + 1, currentData.y_index - 1)) addOption[1] = false;
  if(hasValue(cubesPositions, currentData.x_index - 1, currentData.y_index)) addOption[2] = false;
  if(currentData.y_index != 0 && !hasValue(cubesPositions, currentData.x_index - 1, currentData.y_index - 1)) addOption[2] = false;

  return addOption;
}

//* returns data from map<position, data> | copy of that data
const dataFromPosition = function(x, y, z){
  const key = JSON.stringify([x, y, z].map((el) => el = roundToDecimal(el)));
  if(cubesPositions.has(key))
    return { ...cubesPositions.get(key) };
  
  return undefined;
}


//* checks if there are any elements next to the current block (clicked) if so then the functions removes the unnecassary arrows (btns that add new blocks)
const checkSides = function(curentBlock){
  const addOption = checkPosition(curentBlock.position);
  console.log(addOption);
   for(let i = 0; i < 3; i++){
    toggleAddBtn(expansionHandles.children[i], addOption[i], !addOption[i]);
   }
}

// toggleAddBtn(addBtn, false, 1)

const meshGroup = new THREE.Group();
scene.add(meshGroup);
const cubesPositions = new Map();

//* returns the exact size of the model
const getModelSize = function(object){
  const boundingBox = new THREE.Box3().setFromObject(object);
  const size = boundingBox.getSize(new THREE.Vector3());
  return size;
}

//* generate points based on the objects/ width height
const generatePoints = function(object){
  const objectSize = Object.values(getModelSize(object));
  const width = objectSize[0];
  const height = objectSize[1];

  const objectCenter = Object.values(object.position);
  // const centerX = objectCenter[0];  
  // const centerY = objectCenter[1];  

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
  }
}


//* adds new elements
const addCube = function (side) {

  let data; 
  if(currentBlock !== undefined){
     data = dataFromPosition(currentBlock.position.x, currentBlock.position.y, currentBlock.position.z)
  }
  const withLegs = currentBlock !== undefined ? data.y_index == 0 && side != 0 : true;
  const directory = withLegs ? "Legged/" : "Normal/";
  const modelName = "model.glb";
  const modelPath = directory + modelName;


  // load model on scene

  load(modelPath).then(function (gltf) {
    onObjectLoaded(gltf, side);
  },function ( error ) {
    console.error( error );
  } );

}


//* when the model is loaded adds it to the scene and to the map
const onObjectLoaded = function (gltf, side) {

  const object = gltf.scene;
  
  // -- 1. setup position and map<position, data> value

  let positions, selectAfter = false;
  let data = { y_index: 0, x_index: 0 }; // DEFAULT
  let currentBlockPoints;
  const newObjectSize = getModelSize(object);

  if(currentBlock !== undefined){
    data = dataFromPosition(currentBlock.position.x, currentBlock.position.y, currentBlock.position.z); // UPDATE IF EXISTS | (EXACT SAME LIKE CURRENTBLOCK DATA)
    currentBlockPoints = generatePoints(currentBlock)
  }
    

  switch (side) {
    case 0: // UP
      positions = [currentBlock.position.x, currentBlockPoints.top.y - 0.09, currentBlock.position.z];
      data.y_index++;
      break;
    case 1: // Left
      positions = [currentBlockPoints.left.x - getModelSize(currentBlock).x / 2, currentBlock.position.y, currentBlock.position.z];
      data.x_index++;
      break;
    case 2: // Right
      positions = [currentBlockPoints.right.x + getModelSize(currentBlock).x / 2, currentBlock.position.y, currentBlock.position.z];
      data.x_index--;
      break;
    case -1: // THE DEFAULT ONE ( THE FIRST ONE )
      positions = [0, 0, 0];
      selectAfter = true;
      break;
    default:
      console.error("AddCube function had problem with deciding positions|sides");
      return;  
  }

  // -- 2. pick model

  const withLegs = data.y_index == 0;
  const directory = withLegs ? "Legged/" : "Normal/";
  const modelName = "model.glb";
  const modelPath = directory + modelName;




  object.position.set(...positions);

  cubesPositions.set(JSON.stringify(positions.map((val) => roundToDecimal(val))), { ...data });
  meshGroup.add(object)
  console.log(cubesPositions);
  // object.scale.set(2, 2, 2);
  // console.log(getModelSize(object));
  // console.log(cubesPositions);
  
  if(selectAfter)
    currentBlock = object;
  // console.log(dataFromPosition(currentBlock.position.x, currentBlock.position.y, currentBlock.position.z));
  // console.log(cubesPositions);


  if(meshGroup.children.length == 1)
    createAddBtns(generatePoints(currentBlock));

  if(meshGroup.children.length > 1){
    checkSides(currentBlock);  
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
      e.material.opacity = 0.8;
    })
  }
});


window.addEventListener('click', function (e) {
  if (intersects.length > 0) {
    const clickedEl = intersects[0].object;
    if (clickedEl.parent.parent != null && meshGroup.children.includes(clickedEl.parent.parent.parent)) { //? if block was clicked
      currentBlock = clickedEl.parent.parent.parent;
      expansionHandles.position.copy(currentBlock.position);
      // console.log(expansionHandles.position);


      checkSides(currentBlock);
    } else if (expansionHandles.children.includes(clickedEl)) { //? if the add btn was clicked
      const addBtnNr = expansionHandles.children.indexOf(clickedEl);
      addCube(addBtnNr);
    }
  }
});





//* EXECUTABLE


//* loads the first element
addCube(-1);




// const unpdateColors = function(){
//   meshGroup.children.forEach((e) => e.material.color.set(currentColor))

// }

// inputColor.addEventListener('input', function(){
//   currentColor = this.value;
//   unpdateColors()
// });

