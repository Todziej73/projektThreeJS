'use strict'
import * as THREE from 'three';
import {
  setUpObj
} from './setup.js';
import {
  expansionHandles,
  createAddBtns
} from './expansionHandles';
import {
  load,
  loadText
} from './rederObject.js';
import {
  dataFromPosition,
  extremeInArray,
  extremeValues,
  generatePoints,
  getModelSize,
  getSizeParametersFromModel,
  roundToDecimal,
  select
} from './helpers.js';
import {
  changeColumnSize,
  changeRowSize
} from './configuratorPanel.js';
import {
  updateActiveVisibler
} from './activeVisibler.js';
import * as DIMENSIONS from './dimensions.js';

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

let currentColor;
let currentFrameColor = '#0e0e10';

scene.add(expansionHandles);

//* on / off the buttons
const toggleAddBtn = function (addBtn, visible, layer) {
  addBtn.visible = visible;
  addBtn.layers.set(layer);
}

const hasValue = function (map, posX, posY) {
  let has = false;
  map.forEach(function (el) {
    if (el.x_index === posX && el.y_index === posY) {
      has = true;
    }
  })
  return has;
}

//* helper function - checks if on the given position exist any models 
const checkPosition = function (positionObj) {
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
const checkSides = function (curentBlock) {
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
const addCube = function (side) {

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

  const directory = withLegs ? "Legged/" : "Normal/";
  const modelName = `${width}x${depth}x${height}.glb`;
  const modelPath = directory + modelName;
  // load model on scene
  console.log(modelPath);

  load(modelPath).then(function (gltf) {
    gltf.scene.name = modelName;
    onObjectLoaded(gltf, data, side);
  }, function (error) {
    console.error(error);
  });

}


//* when the model is loaded adds it to the scene and to the map
const onObjectLoaded = function (gltf, data, side) {

  const object = gltf.scene;

  // -- 1. setup position and map<position, data> value

  let selectAfter = data.x_index == 0 && data.y_index == 0;
  const borderCollapse = data.y_index == 0 ? 0.04 : 0.028;


  let positions, currentBlockPoints;
  if (currentBlock !== undefined) {
    currentBlockPoints = generatePoints(currentBlock)
  }

  if (side == 0) positions = [currentBlock.position.x, currentBlockPoints.top.y - 0.028, currentBlock.position.z]; // UP
  else if (side == 1) positions = [currentBlockPoints.left.x - getModelSize(object).x / 2 + borderCollapse, currentBlock.position.y, currentBlock.position.z]; // LEFT
  else if (side == 2) positions = [currentBlockPoints.right.x + getModelSize(object).x / 2 - borderCollapse, currentBlock.position.y, currentBlock.position.z]; // RIGHT
  else if (side == -1) positions = [0, 0, 0]; // THE DEFAULT ONE
  else {
    console.error("AddCube function had problem with deciding positions|sides");
    return;
  }

  object.position.set(...positions);

  cubesPositions.set(JSON.stringify(positions.map((val) => roundToDecimal(val))), {
    ...data
  });

  meshGroup.add(object)
  // console.log(object);

  if (selectAfter) {
    currentBlock = object;
    updateActiveVisibler();
    createAddBtns(generatePoints(currentBlock));
  }


  if (meshGroup.children.length == 1)
    createAddBtns(generatePoints(currentBlock));

  if (meshGroup.children.length > 1) {
    checkSides(currentBlock);
  }

  changeObjectColor(object, currentColor);
  changeFrameColor(object, currentFrameColor);
  DIMENSIONS.updateDimensions();
}



const changeObjectColor = function (object, targetColor) {

  const targetColorVector = new THREE.Color(targetColor);
  const meshToChange = object.children[0].children[0].children[1];



  meshToChange.material.color = targetColorVector;
}

const changeFrameColor = function (object, targetColor) {
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

//* EVENTS


document.addEventListener('pointermove', function (e) {
  mouse.set((e.clientX / window.innerWidth) * 2 - 1, -(e.clientY / window.innerHeight) * 2 + 1);
  raycaster.setFromCamera(mouse, camera);
  raycaster.layers.set(0);
  intersects = raycaster.intersectObjects(scene.children);
  if (intersects.length > 0 && expansionHandles.children.includes(intersects[0].object)) {
    document.querySelector('body').style.cursor = 'pointer';
    intersects[0].object.material.opacity = 0.8;
    intersects[0].object.material.color.set(0xadb5bd);
  } else {
    document.querySelector('body').style.cursor = 'default';
    expansionHandles.children.forEach(function (e) {
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
      updateActiveVisibler();
      expansionHandles.position.copy(currentBlock.position);
      // createAddBtns(generatePoints(currentBlock))
      

      checkSides(currentBlock);
    } else if (expansionHandles.children.includes(clickedEl)) { //? if the add btn was clicked
      const addBtnNr = expansionHandles.children.indexOf(clickedEl);
      addCube(addBtnNr);
    } else if (!document.querySelector('.configure-tabs').contains(e.target) && e.target != document.querySelector('.configure-tabs')) {
      deselectCurrentBlock();
    }
  } else if (!document.querySelector('.configure-tabs').contains(e.target) && e.target != document.querySelector('.configure-tabs')) {
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
    }
  }
})




const frameColorInputs = document.querySelector('.frame-color-picker .inputs');
frameColorInputs.addEventListener('click', function (e) {
  const clickedEl = e.target;
  if (clickedEl.classList.contains('color')) {

    Array.from(frameColorInputs.children).forEach(e => e.classList.remove('color--active'));
    clickedEl.classList.add('color--active');


    meshGroup.children.forEach(function (obj) {
      changeFrameColor(obj, clickedEl.dataset.color);
    })
    currentFrameColor = clickedEl.dataset.color;
  }
})





// ! changing the size 
let measurments = [729, 329, 154];

const depthInputsEl = document.querySelector('.select-size--depth .inputs');
const heightInputsEl = document.querySelector('.select-size--height .inputs');
const widthInputsEl = document.querySelector('.select-size--width .inputs');





const showActiveBtn = function (arr) {
  arr.forEach(element => {
    element.classList.remove('size-option--active')
  });
}

depthInputsEl.addEventListener('click', function (e) {
  if (e.target.classList.contains('size-option')) {
    showActiveBtn(document.querySelectorAll('.select-size--depth .inputs *'))
    e.target.classList.add('size-option--active');
    measurments[1] = Number(e.target.dataset.size);
  }
});


heightInputsEl.addEventListener('click', function (e) {
  if (e.target.classList.contains('size-option')) {
    showActiveBtn(document.querySelectorAll('.select-size--height .inputs *'))
    e.target.classList.add('size-option--active');
    measurments[2] = Number(e.target.dataset.size);
    changeRowSize(meshGroup, cubesPositions, measurments);
  }
});

widthInputsEl.addEventListener('click', function (e) {
  if (e.target.classList.contains('size-option')) {
    showActiveBtn(document.querySelectorAll('.select-size--width .inputs *'))
    e.target.classList.add('size-option--active');
    measurments[0] = Number(e.target.dataset.size);
    changeColumnSize(meshGroup, cubesPositions, measurments);
  }
});


// x, y - gdzie powinno byc
const getPredictedSize = function (x_index, y_index) {
  let width = undefined;
  let height = undefined;
  let depth = meshGroup.children.length > 0 ? getSizeParametersFromModel(meshGroup.children[0].name).depth : undefined;

  const column = select(cubesPositions, meshGroup, x_index);
  const row = select(cubesPositions, meshGroup, null, y_index);
  if (column.length > 0) width = getSizeParametersFromModel(column[0].name).width;
  if (row.length > 0) height = getSizeParametersFromModel(row[0].name).height;

  return {
    width: width,
    height: height,
    depth: depth
  }
}

//* EXECUTABLE


//* loads the first element
addCube(-1);
DIMENSIONS.setDimensionsVisiblity(true);


//* EXPORTS
export {
  currentBlock,
  generatePoints,
  getModelSize,
  scene,
  meshGroup
};





//* DEBUG
window.scene = scene;
window.updateDimensions = DIMENSIONS.updateDimensions;
window.select = select;
window.meshGroup = meshGroup;
window.cubesPositions = cubesPositions;
window.getSizeParametersFromModel = getSizeParametersFromModel;

window.updateDimensions = DIMENSIONS.updateDimensions;
window.extremeValues = extremeValues;
window.loadText = loadText;
window.extremeInArray = extremeInArray;