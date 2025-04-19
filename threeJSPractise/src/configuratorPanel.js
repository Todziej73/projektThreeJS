'use strict'
import { updateActiveVisibler } from "./activeVisibler";
import { updateDimensions } from "./dimensions";
import { createAddBtns } from "./expansionHandles";
import {dataFromPosition, dataFromPositionVector, generatePoints, getModelSize,getParametersFromModel,roundToDecimal, select} from "./helpers";
import { checkSides, cubesPositions, currentBlock, meshGroup, setCurrentBlock } from "./main";
import {models} from "./rederObject";
import {compressNormals} from "three/examples/jsm/utils/GeometryCompressionUtils.js";



//! switching the tabs

const tabBtnsContainer = document.querySelector('.select-tab-container');
const tabs = document.querySelectorAll('.configure-tab');

tabBtnsContainer.addEventListener('click', function (e) {
  if (e.target.classList.contains('open-tab-btn')) {
    const tab = document.querySelector('.' + e.target.dataset.tab);
    tabs.forEach((e) => e.classList.add('hidden'));
    tab.classList.remove('hidden');

    Array.from(tabBtnsContainer.children).forEach(el => el.classList.remove('tab--active'));
    e.target.classList.add('tab--active');
  }
})



export const changeColumnSize = async function (group, map, sizeSettings) {
  const data = dataFromPositionVector(cubesPositions, currentBlock.position);
  const currentColumn = select(cubesPositions, meshGroup, data.x_index);
  
  const otherModels = group.children.filter((child) => !currentColumn.includes(child));
  const otherColumns = new Map();
  otherModels.forEach(function (el) {
    const positionX = roundToDecimal(el.position.x);
    if (!otherColumns.has(positionX)) {
      otherColumns.set(positionX, [el]);
    } else otherColumns.get(positionX).push(el)
  })

  
  const currentBlockGridPosition = dataFromPosition(map, currentBlock.position.x, currentBlock.position.y, currentBlock.position.z);
  //delete old and load new elements
  for(const [idx, el] of currentColumn.entries()){
    const directory = el.position.y == 0 ? 'Legged' : "Normal"
    const params = getParametersFromModel(el.name);
    // console.log(`${oldSize}`);
    const width = sizeSettings[0];
    const newPath = `klagem/${params.module}/${directory}/${width}x${params.depth}x${params.height}.glb`;
    

    
    const model = models[newPath];
    
    if(model){
      const clone = model.scene.clone();
      clone.traverse((child) => {
        if (child.isMesh && child.material) {
          child.material = child.material.clone();
        }
      });
      clone.name = newPath;
      clone.position.set(roundToDecimal(el.position.x), roundToDecimal(el.position.y), roundToDecimal(el.position.z));
      clone.children[0].children[0].children[1].material.color.set(el.children[0].children[0].children[1].material.color);
      group.add(clone);

      const key = JSON.stringify(Object.values(clone.position).map((el) => el = roundToDecimal(el)));
      const value = map.get(key);
      if(value.x_index === currentBlockGridPosition.x_index && value.y_index === currentBlockGridPosition.y_index){
        setCurrentBlock(clone);
        updateActiveVisibler(clone)
        createAddBtns(generatePoints(clone));
        checkSides(clone);

      }

      const newWidth = getModelSize(clone).x;
      if(idx === 0){
        adjustColmuns(otherColumns, map, getModelSize(currentColumn[0]).x, newWidth, currentBlock.position);
      }

    }else {
      console.log("Can't load model")
    }
    
    group.remove(el);
    
  };

  updateDimensions();
}


function adjustColmuns(otherColumns, map, oldWidth, newWidth, position) {
  const gap = (oldWidth - newWidth) / 2;
  
  otherColumns.forEach(function (column, positionX, idx) {
    const side = positionX > roundToDecimal(position.x) ? "right" : "left";

      column.forEach(function(el){
        const key = JSON.stringify(Object.values(el.position).map((el) => el = roundToDecimal(el)));
        const value = map.get(key);
        map.delete(key)
        if(side === 'left'){
          el.position.x += gap;
        }else{
          el.position.x -= gap;
        }
        map.set(JSON.stringify(Object.values(el.position).map((val) => val = roundToDecimal(val))), value);
        
      })
  });

}




export const changeRowSize = async function (group, map, sizeSettings) {

  const data = dataFromPositionVector(cubesPositions, currentBlock.position);
  const currentRow = select(cubesPositions, meshGroup, null, data.y_index);
  const otherModels = group.children.filter((child) => !currentRow.includes(child) && roundToDecimal(child.position.y) > roundToDecimal(currentRow[0].position.y));
  const otherRows = new Map();
  otherModels.forEach(function (el) {
    const positionY = roundToDecimal(el.position.y);
    if (!otherRows.has(positionY)) {
      otherRows.set(positionY, [el]);
    } else otherRows.get(positionY).push(el);
  })

  const currentBlockGridPosition = dataFromPosition(map, currentBlock.position.x, currentBlock.position.y, currentBlock.position.z);
  //delete old and load new elements
  for(const [idx, el] of currentRow.entries()){
    const directory = el.position.y == 0 ? 'Legged' : "Normal";
    const params = getParametersFromModel(el.name);
    const height = sizeSettings[2];
    const newPath = `klagem/${params.module}/${directory}/${params.width}x${params.depth}x${height}.glb`;

    const model = models[newPath];
    if(model){
      const clone = model.scene.clone();
      clone.traverse((child) => {
        if (child.isMesh && child.material) {
          child.material = child.material.clone();
        }
      });
      clone.name = newPath;
      clone.position.set(roundToDecimal(el.position.x), roundToDecimal(el.position.y), roundToDecimal(el.position.z));
      clone.children[0].children[0].children[1].material.color.set(el.children[0].children[0].children[1].material.color);
      group.add(clone);

      const key = JSON.stringify(Object.values(clone.position).map((el) => el = roundToDecimal(el)));
      const value = map.get(key);
      if(value.x_index === currentBlockGridPosition.x_index && value.y_index === currentBlockGridPosition.y_index){
        setCurrentBlock(clone);
        updateActiveVisibler(clone)
        createAddBtns(generatePoints(clone));
        checkSides(clone);

      }

      const newHeight = getModelSize(clone).y;
      if(idx === 0){
        adjustRows(otherRows, map, getModelSize(currentRow[0]).y, newHeight, currentBlock.position.y);
      }

    }else {
      console.log("Can't load model")
    }

    group.remove(el);
  };

  updateDimensions();

}



function adjustRows(otherRows, map, oldHeight, newHeight, posY) {
  const gap = (oldHeight - newHeight);
  otherRows.forEach(function (column, positionY, idx) {
    const side = positionY > roundToDecimal(posY) ? "upper" : "lower";
    
      column.forEach(function(el){
        const key = JSON.stringify(Object.values(el.position).map((el) => el = roundToDecimal(el)));
        const value = map.get(key);
        map.delete(key)
        if(side === 'upper'){
          el.position.y -= gap;
        }else{
          el.position.y += gap;
        }
        map.set(JSON.stringify(Object.values(el.position).map((val) => val = roundToDecimal(val))), value);
      })
   
  });

}

export const changeDepth = async function(group, map, sizeSettings){
  const currentBlockGridPosition = dataFromPosition(map, currentBlock.position.x, currentBlock.position.y, currentBlock.position.z);
  const modelsToChange = group.children.map(el => el);
  for(const el of modelsToChange){    
    const directory = el.position.y == 0 ? 'Legged' : "Normal";
    const params = getParametersFromModel(el.name);
    const depth = sizeSettings[1];
    const newPath = `klagem/${params.module}/${directory}/${params.width}x${depth}x${params.height}.glb`;

    const model = models[newPath];
    if(model){
      const clone = model.scene.clone();
      clone.traverse((child) => {
        if (child.isMesh && child.material) {
          child.material = child.material.clone();
        }
      });
      clone.name = newPath;
      clone.position.set(roundToDecimal(el.position.x), roundToDecimal(el.position.y), roundToDecimal(el.position.z));
      clone.children[0].children[0].children[1].material.color.set(el.children[0].children[0].children[1].material.color);
      group.add(clone);

      const key = JSON.stringify(Object.values(clone.position).map((el) => el = roundToDecimal(el)));
      const value = map.get(key);
      if(value.x_index === currentBlockGridPosition.x_index && value.y_index === currentBlockGridPosition.y_index){
        setCurrentBlock(clone);
        updateActiveVisibler(clone)
        createAddBtns(generatePoints(clone));
        checkSides(clone);

      }

    }else {
      console.log("Can't load model")
    }
    group.remove(el);    
  };
  updateDimensions();
}