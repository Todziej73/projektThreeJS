'use strict'
import * as THREE from 'three';
import {setUpObj} from './setup.js';
import {expansionHandles,createAddBtns} from './expansionHandles';
import {getModel} from './rederObject.js';
import {dataFromPosition,generatePoints,getModelSize,getParametersFromModel,roundToDecimal,select,modelToClone} from './helpers.js';
import {changeColumnSize,changeDepth,changeRowSize} from './configuratorPanel.js';
import {updateActiveVisibler} from './activeVisibler.js';
import * as DIMENSIONS from './dimensions.js';
import './debug.js';
import { changeJointsColor, connectWithJoints, setJointsVisibility } from './connections.js';
import { getPrice } from './woocomerceConn.js';


const scene = setUpObj.scene;
const camera = setUpObj.camera;
const mouse = setUpObj.mouse;

camera.layers.enableAll();

const raycaster = new THREE.Raycaster();
let intersects = [];
let currentBlock;
export const setCurrentBlock = function (object) {
  currentBlock = object
};

let currentColor = '#ebc027';
let currentFrameColor = '#0e0e10';
const price = document.querySelector('.price');

scene.add(expansionHandles);

//* on / off the buttons
const toggleAddBtn = function (addBtn, visible, layer) {
  addBtn.visible = visible;
  addBtn.layers.set(layer);
}

export const hasValue = function (map, posX, posY) {
  let has = false;
  map.forEach(function (el) {
    if (el.x_index === posX && el.y_index === posY) {
      has = true;
    }
  })
  return has;
}

//* helper function - checks if on the given position exist any models 
/**
 * 
 * @param {THREE.Vector3} positionObj 
 * @returns {[boolean, boolean, boolean]} [TOP, LEFT, RIGHT]
 */
export const checkPosition = function (positionObj) {
  let addOption = [true, true, true];
  const currentData = dataFromPosition(cubesPositions, ...Object.values(positionObj));

  if (hasValue(cubesPositions, currentData.x_index, currentData.y_index + 1)) addOption[0] = false;
  if (hasValue(cubesPositions, currentData.x_index - 1, currentData.y_index)) addOption[1] = false;
  if (currentData.y_index != 0 && !hasValue(cubesPositions, currentData.x_index - 1, currentData.y_index - 1)) addOption[1] = false;
  if (hasValue(cubesPositions, currentData.x_index + 1, currentData.y_index)) addOption[2] = false;
  if (currentData.y_index != 0 && !hasValue(cubesPositions, currentData.x_index + 1, currentData.y_index - 1)) addOption[2] = false;

  return addOption;
}



//* checks if there are any elements next to the current block (clicked) if so then the functions removes the unnecassary arrows (btns that add new blocks)
export const checkSides = function (curentBlock) {
  const addOption = checkPosition(curentBlock.position);
  // console.log(addOption);
  for (let i = 0; i < 3; i++) {
    toggleAddBtn(expansionHandles.children[i], addOption[i], !addOption[i]);
  }
}




const meshGroup = new THREE.Group();
scene.add(meshGroup);
export const cubesPositions = new Map();

//* adds new elements
export const addCube = async function (side) {

  let data = {
    y_index: 0,
    x_index: 0
  };
  if (currentBlock !== undefined) {
    data = dataFromPosition(cubesPositions, currentBlock.position.x, currentBlock.position.y, currentBlock.position.z) // UPDATE IF EXISTS | (EXACT SAME LIKE CURRENTBLOCK DATA)
  }
  const withLegs = currentBlock !== undefined ? data.y_index == 0 && side != 0 : true;



  switch (side) {
    case 0: // UP
      data.y_index++;
      break;
    case 1: // Left
      data.x_index--;
      break;
    case 2: // Right
      data.x_index++;
      break;
    default:
      break;
  }

  const predictedSize = getPredictedSize(data.x_index, data.y_index);
  const width = predictedSize.width == undefined ? 729 : predictedSize.width;
  const height = predictedSize.height == undefined ? 154 : predictedSize.height;
  const depth = predictedSize.depth == undefined ? 329 : predictedSize.depth;

  const directory = withLegs ? "Legged" : "Normal";
  const module = `${currentBlock !== undefined ? getParametersFromModel(currentBlock.name).module : "module_"}`;
  const modelName = `${width}x${depth}x${height}.glb`;
  const modelPath = `klagem/${module}/${directory}/${modelName}`;
  // load model on scene

  const model = await getModel(modelPath);
  // console.log(models, modelPath)
  if(model){
    const clone = modelToClone(model, modelPath);
    let selectAfter = data.x_index == 0 && data.y_index == 0;
    const borderCollapse = data.y_index == 0 ? 0.04 : 0.028;



    let positions, currentBlockPoints;
    if (currentBlock !== undefined) {
      currentBlockPoints = generatePoints(currentBlock)
    }

    if (side == 0) positions = [currentBlock.position.x, currentBlockPoints.top.y - 0.028, currentBlock.position.z]; // UP
    else if (side == 1) positions = [currentBlockPoints.left.x - getModelSize(clone).x / 2 + borderCollapse, currentBlock.position.y, currentBlock.position.z]; // LEFT
    else if (side == 2) positions = [currentBlockPoints.right.x + getModelSize(clone).x / 2 - borderCollapse, currentBlock.position.y, currentBlock.position.z]; // RIGHT
    else if (side == -1) positions = [0, 0, 0]; // THE DEFAULT ONE
    else {
      console.error("AddCube function had problem with deciding positions|sides");
      return;
    }

    clone.position.set(...positions);
    cubesPositions.set(JSON.stringify(positions.map((val) => roundToDecimal(val))), {
      ...data
    });
    // console.log(cubesPositions)
    meshGroup.add(clone)

    if (selectAfter) {
      currentBlock = clone;
      updateActiveVisibler();
      createAddBtns(generatePoints(currentBlock));
    }


    if (meshGroup.children.length == 1)
      createAddBtns(generatePoints(currentBlock));

    if (meshGroup.children.length > 1) {
      checkSides(currentBlock);
    }

    // changeObjectColor(object, currentColor);
    // changeFrameColor(object, currentFrameColor);
    DIMENSIONS.updateDimensions();
    changeObjectColor(clone, currentColor);
    changeFrameColor(clone, currentFrameColor);
    canDelete(currentBlock)
    price.textContent = await getPrice() + "zł";
    await connectWithJoints();
    
    changeJointsColor(new THREE.Color(currentFrameColor));
  }else{
    console.log("Can't load model");
  }
}



export const spawnCube = async function (definition) {
  const modelPath = definition.name;
  const model = await getModel(modelPath);
  if(model){
    const clone = modelToClone(model, modelPath);
    const data = definition.data;
    const currentColor = definition.material.color;
    const currentFrameColor = definition.material.frameColor;
    const x = definition.position.x;
    const y = definition.position.y;
    const z = definition.position.z;
    const positions = [x, y, z];

    clone.position.set(...positions);
    cubesPositions.set(JSON.stringify(positions.map((val) => roundToDecimal(val))), {
      ...data
    });
    // console.log(cubesPositions)
    meshGroup.add(clone)


    currentBlock = clone;
    updateActiveVisibler();
    createAddBtns(generatePoints(currentBlock));
    DIMENSIONS.updateDimensions();
    changeObjectColor(clone, currentColor);
    changeFrameColor(clone, currentFrameColor);
    price.textContent = await getPrice() + "zł";
    await connectWithJoints();
    
    changeJointsColor(new THREE.Color(currentFrameColor));
  }else{
    console.log("Can't load model");
  }
}




export const changeObjectColor = function (object, targetColor) {
  const targetColorVector = new THREE.Color(targetColor);
  const meshToChange = object.children[0].children[0].children[1];
  meshToChange.material.color = targetColorVector;
}

export const changeFrameColor = function (object, targetColor) {
  const targetColorVector = new THREE.Color(targetColor);
  const meshToChange = object.children[0].children[0].children[0];
  meshToChange.material.color = targetColorVector;
}


const deselectCurrentBlock = function () {
  currentBlock = undefined;
  expansionHandles.children.forEach(function (el) {
    toggleAddBtn(el, false, 1);
  });
  updateActiveVisibler();
 
}

// ! changing the size 
let measurments = [729, 329, 154];

const depthInputsEl = document.querySelector('.select-size--depth .inputs');
const heightInputsEl = document.querySelector('.select-size--height .inputs');
const widthInputsEl = document.querySelector('.select-size--width .inputs');


//* EVENTS


let isMouseDown = false;
document.addEventListener("pointerdown", () => isMouseDown = true);
document.addEventListener("pointerup", () => isMouseDown = false);

document.addEventListener("pointermove", function (e) {
  if (isMouseDown) return; // Pomijamy, jeśli użytkownik przeciąga

  const mouseX = (e.clientX / window.innerWidth) * 2 - 1;
  const mouseY = -(e.clientY / window.innerHeight) * 2 + 1;
  mouse.set(mouseX, mouseY);

  raycaster.setFromCamera(mouse, camera);
  raycaster.layers.set(0);

  const intersects = raycaster.intersectObjects(scene.children);

  if (intersects.length > 0 && expansionHandles.children.includes(intersects[0].object)) {
    document.querySelector('body').style.cursor = 'pointer';
    intersects[0].object.material.opacity = 0.8;
    intersects[0].object.material.color.set(0xadb5bd);
  } else {
    document.querySelector('body').style.cursor = 'default';
    expansionHandles.children.forEach(function (e) {
      e.material.color.set(0xced4da);
      e.material.opacity = 0.8;
    });
  }
});

const deleteModelBtn = document.querySelector('.deleteModelBtn');

function canDelete(currentBlock) {
  const blockAbove = !checkPosition(currentBlock.position)[0];
  const blockToLeft = !checkPosition(currentBlock.position)[1];
  const blockToRight = !checkPosition(currentBlock.position)[2];

  if ((currentBlock.position.y === 0 && !blockAbove && blockToLeft && blockToRight) || meshGroup.children.length === 1 || (blockAbove)) {
    deleteModelBtn.classList.remove('active-btn');
  } else {
    deleteModelBtn.classList.add('active-btn');
  }
}



deleteModelBtn.addEventListener('click', async function(){
  if(currentBlock && deleteModelBtn.classList.contains('active-btn')){
    cubesPositions.delete( JSON.stringify(Object.values(currentBlock.position).map((el) => el = roundToDecimal(el))));
   meshGroup.remove(currentBlock)
   DIMENSIONS.updateDimensions();
    price.textContent = await getPrice() + "zł";
    await connectWithJoints();
  }
});

//* RESET THE CONFIGURATION
const resetBtn = document.querySelector('.resetBtn');
const confirmResetContainer = document.querySelector('.resetConfirmContainer');
const overlay = document.querySelector('.overlay');
const confirmResetBtn = document.querySelector('.confirmResetBtn');
const cancelResetBtn = document.querySelector('.cancelResetBtn');

resetBtn.addEventListener('click', function(){
  confirmResetContainer.classList.remove('hidden');
  confirmResetContainer.style.animation = 'showResetContainer 0.5s forwards ease';
  overlay.classList.remove('hidden');
});

const hideConfirmContainer = function(){
  confirmResetContainer.classList.add('hidden');
  overlay.classList.add('hidden');
}

document.addEventListener('keydown', function(e){
  if(e.key === 'Escape' && !confirmResetContainer.classList.contains('hidden')) hideConfirmContainer();
});


confirmResetBtn.addEventListener('click', async function(){
  meshGroup.children.slice().forEach(function(child){
    meshGroup.remove(child);

    if (child.geometry) child.geometry.dispose();
    if (child.material) {
      if (Array.isArray(child.material)) {
        child.material.forEach(m => m.dispose());
      } else {
        child.material.dispose();
      }
    }
  });
  hideConfirmContainer();
  cubesPositions.clear()
  currentColor = '#ebc027';
  addCube(-1);
  price.textContent = await getPrice() + "zł";
});

cancelResetBtn.addEventListener('click', hideConfirmContainer);
overlay.addEventListener('click', hideConfirmContainer);

//* HIDE THE TUTORIAL

const closeTutorialBtn = document.querySelector('.tutorialHeader svg');
const tutorialContainer = document.querySelector('.tutorialContainer');
const openTutorialBtn = document.querySelector('.openTuturialBtn');

closeTutorialBtn.addEventListener('click', function(){
  tutorialContainer.classList.add('hidden')
});

openTutorialBtn.addEventListener('click', function(){
  tutorialContainer.classList.remove('hidden');
  tutorialContainer.style.animation = 'showTutorial 0.5s ease';
})



window.addEventListener('pointerdown', function (e) {
  const mouseX = (e.clientX / window.innerWidth) * 2 - 1;
  const mouseY = -(e.clientY / window.innerHeight) * 2 + 1;
  mouse.set(mouseX, mouseY);

  raycaster.setFromCamera(mouse, camera);
  raycaster.layers.set(0);
  const intersects = raycaster.intersectObjects(scene.children, true);

  if (intersects.length > 0) {
    const clickedEl = intersects[0].object;

    if (clickedEl.parent?.parent && meshGroup.children.includes(clickedEl.parent.parent.parent)) {
      currentBlock = clickedEl.parent.parent.parent;
      updateActiveVisibler();
      createAddBtns(generatePoints(currentBlock));

      const modelSize = getParametersFromModel(currentBlock.name);
      const allInputs = document.querySelectorAll('.size-option');
      allInputs.forEach(el => el.classList.remove('size-option--active'));

      document.querySelector(`.width--option[data-size="${modelSize.width}"]`).classList.add('size-option--active');
      document.querySelector(`.height--option[data-size="${modelSize.height}"]`).classList.add('size-option--active');
      document.querySelector(`.depth--option[data-size="${modelSize.depth}"]`).classList.add('size-option--active');

      const clickedElColor = '#' + currentBlock.children[0].children[0].children[1].material.color.getHexString();
      const allColorInputs = document.querySelectorAll('.main-color-picker .inputs .color');
      allColorInputs.forEach(el => el.classList.remove('color--active'));
      document.querySelector(`.color[data-color="${clickedElColor}"]`).classList.add('color--active');

      canDelete(currentBlock);
      checkSides(currentBlock);

    } else if (expansionHandles.children.includes(clickedEl)) {
      const addBtnNr = expansionHandles.children.indexOf(clickedEl);
      addCube(addBtnNr);

    } else if (!document.querySelector('.configure-tabs').contains(e.target)) {
      deselectCurrentBlock();
    }

  } else if (!document.querySelector('.configure-tabs').contains(e.target)) {
    deselectCurrentBlock();
  }
});


//* changing the colors
const mainColorInputs = document.querySelector('.main-color-picker .inputs');

mainColorInputs.addEventListener('click', function (e) {
  const clickedEl = e.target;
  if (clickedEl.classList.contains('color')) {

    Array.from(mainColorInputs.children).forEach(e => e.classList.remove('color--active'));
    clickedEl.classList.add('color--active');

    if (currentBlock == undefined) {
      meshGroup.children.forEach(function (obj) {
        changeObjectColor(obj, clickedEl.dataset.color);
      })
      currentColor = clickedEl.dataset.color;
    } else {
      changeObjectColor(currentBlock, clickedEl.dataset.color);
      currentColor = clickedEl.dataset.color;
    }
  }
})




const frameColorInputs = document.querySelector('.frame-color-picker .inputs');
frameColorInputs.addEventListener('click', async function (e) {
  const clickedEl = e.target;
  if (clickedEl.classList.contains('color')) {

    Array.from(frameColorInputs.children).forEach(e => e.classList.remove('color--active'));
    clickedEl.classList.add('color--active');


    meshGroup.children.forEach(function (obj) {
      changeFrameColor(obj, clickedEl.dataset.color);
    })
    currentFrameColor = clickedEl.dataset.color;
    price.textContent = await getPrice() + "zł";
    changeJointsColor(new THREE.Color(currentFrameColor));
  }
})





const showActiveBtn = function (arr) {
  arr.forEach(element => {
    element.classList.remove('size-option--active')
  });
}



depthInputsEl.addEventListener('click', async function (e) {
  if(currentBlock){
    if (e.target.classList.contains('size-option')) {
      showActiveBtn(document.querySelectorAll('.select-size--depth .inputs *'))
      e.target.classList.add('size-option--active');
      measurments[1] = Number(e.target.dataset.size);
      // console.log(meshGroup.children);
      changeDepth(meshGroup, cubesPositions, measurments);
    }
  }else{
    alert("Nie wybrano żadnego elementu");
  }
});


heightInputsEl.addEventListener('click', async function (e) {
  if(currentBlock){
    if (e.target.classList.contains('size-option')) {
      showActiveBtn(document.querySelectorAll('.select-size--height .inputs *'))
      e.target.classList.add('size-option--active');
      measurments[2] = Number(e.target.dataset.size);
      changeRowSize(meshGroup, cubesPositions, measurments);
    }
  }else{
    alert("Nie wybrano żadnego elementu");
  }
});

widthInputsEl.addEventListener('click', async function (e) {
  if(currentBlock){
    if (e.target.classList.contains('size-option')) {
      showActiveBtn(document.querySelectorAll('.select-size--width .inputs *'))
      e.target.classList.add('size-option--active');
      measurments[0] = Number(e.target.dataset.size);
      changeColumnSize(meshGroup, cubesPositions, measurments);
    }
  }else{
    alert("Nie wybrano żadnego elementu");
  }
});


// x, y - gdzie powinno byc
const getPredictedSize = function (x_index, y_index) {
  let width = undefined;
  let height = undefined;
  let depth = meshGroup.children.length > 0 ? getParametersFromModel(meshGroup.children[0].name).depth : undefined;

  const column = select(cubesPositions, meshGroup, x_index);
  const row = select(cubesPositions, meshGroup, null, y_index);
  if (column.length > 0) width = getParametersFromModel(column[0].name).width;
  if (row.length > 0) height = getParametersFromModel(row[0].name).height;

  return {
    width: width,
    height: height,
    depth: depth
  }
}

//* EXECUTABLE


//* loads the first element
// addCube(-1);
DIMENSIONS.setDimensionsVisiblity(true);
setJointsVisibility(true);
document.querySelector('div[data-color="#262626"]').click();


//* EXPORTS
export {
  currentBlock,
  generatePoints,
  getModelSize,
  scene,
  meshGroup,
};