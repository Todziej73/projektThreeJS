'use strict'
import { updateActiveVisibler } from "./activeVisibler";
import { createAddBtns } from "./expansionHandles";
import {dataFromPosition, generatePoints, getModelSize,getSizeParametersFromModel,roundToDecimal} from "./helpers";
import { currentBlock, setCurrentBlock } from "./main";
import {load} from "./rederObject";


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



export const changeColumnSize = function (group, map, path) {
  const currentColumn = group.children.filter((child) => roundToDecimal(child.position.x) == roundToDecimal(currentBlock.position.x));
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
  currentColumn.forEach(function (el, idx) {
    const directory = el.position.y == 0 ? 'Legged/' : "Normal/"
    const oldSize = getSizeParametersFromModel(el.name);
    const width = getSizeParametersFromModel(path).width;
    const newpath = `${width}x${oldSize.depth}x${oldSize.height}.glb`;

    console.log("Old size: ", oldSize);
    console.log("New size: ", getSizeParametersFromModel(newpath));
    console.log("Path: ", newpath);

    load(directory + newpath).then(function (gltf) {
      const object = gltf.scene;
      object.name = newpath;
      group.add(object);
      
      object.position.set(roundToDecimal(el.position.x), roundToDecimal(el.position.y), roundToDecimal(el.position.z));

      const key = JSON.stringify(Object.values(object.position).map((el) => el = roundToDecimal(el)));
      const value = map.get(key);
      if(value.x_index === currentBlockGridPosition.x_index && value.y_index === currentBlockGridPosition.y_index){
        setCurrentBlock(object);
        updateActiveVisibler(object)
        createAddBtns(generatePoints(object));
      }

      const newWidth = getModelSize(object).x;
      if(idx === 0){
        adjustColmuns(otherColumns, map, getModelSize(currentColumn[0]).x, newWidth, currentBlock.position);
      }

    }, function (error) {
      console.error(error);
    });

    
    group.remove(el);
    
  });


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





export const changeRowSize = function (group, map, path) {

  const currentRow = group.children.filter((child) => roundToDecimal(child.position.y) == roundToDecimal(currentBlock.position.y));
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
  currentRow.forEach(function (el, idx) {
    const directory = el.position.y == 0 ? 'Legged/' : "Normal/";
    const oldSize = getSizeParametersFromModel(el.name);
    const height = getSizeParametersFromModel(path).height;
    const newpath = `${oldSize.width}x${oldSize.depth}x${height}.glb`;
    console.log("Old size: ", oldSize);
    console.log("New size: ", getSizeParametersFromModel(newpath));
    console.log("Path: ", newpath);
    
    

    load(directory + newpath).then(function (gltf) {
      const object = gltf.scene;
      group.add(object)
      object.name = newpath;
      object.position.set(roundToDecimal(el.position.x), roundToDecimal(el.position.y), roundToDecimal(el.position.z));

      const key = JSON.stringify(Object.values(object.position).map((el) => el = roundToDecimal(el)));
      const value = map.get(key);
      if(value.x_index === currentBlockGridPosition.x_index && value.y_index === currentBlockGridPosition.y_index){
        setCurrentBlock(object);
        updateActiveVisibler(object)
        createAddBtns(generatePoints(object));
      }

      const newHeight = getModelSize(object).y;
      if(idx === 0)  adjustRows(otherRows, map, getModelSize(currentRow[0]).y, newHeight, currentBlock.position.y);
      
    }, function (error) {
      console.error(error);
    });

    group.remove(el);
  });

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

