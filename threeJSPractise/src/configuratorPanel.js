'use strict'
import {getModelSize,roundToDecimal} from "./helpers";
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


//* log columns and rows

export const getColumn = function (group, path, posX) {

  const currentColumn = group.children.filter((child) => roundToDecimal(child.position.x) == roundToDecimal(posX));
  const otherModels = group.children.filter((child) => !currentColumn.includes(child));
  const otherColumns = new Map();
  otherModels.forEach(function (el) {
    const positionX = roundToDecimal(el.position.x);
    if (!otherColumns.has(positionX)) {
      otherColumns.set(positionX, [el]);
    } else otherColumns.get(positionX).push(el)
  })



  //delete old and load new elements
  currentColumn.forEach(function (el, idx) {
    const directory = el.position.y == 0 ? 'Legged/' : "Normal/"

    load(directory + path).then(function (gltf) {
      const object = gltf.scene;
      group.add(object)
      object.position.set(roundToDecimal(el.position.x), roundToDecimal(el.position.y), roundToDecimal(el.position.z));

      const newWidth = getModelSize(object).x;
      if(idx === 0)  adjustColmuns(otherColumns, getModelSize(currentColumn[0]).x, newWidth, posX);

    }, function (error) {
      console.error(error);
    });

    group.remove(el);
  });



 


}




function adjustColmuns(otherColumns, oldWidth, newWidth, posX) {
  const gap = (oldWidth - newWidth) / 2;
  otherColumns.forEach(function (column, positionX, idx) {
    const side = positionX > roundToDecimal(posX) ? "right" : "left";
    if(side == 'right'){
      column.forEach(function(el){
        el.position.x -= gap;
      })
    }else{
      column.forEach(function(el){
        el.position.x += gap;
      })
    }
  });
}


export const changeRow = function (group, path, posY) {

  const currentRow = group.children.filter((child) => roundToDecimal(child.position.y) == roundToDecimal(posY));
  const otherModels = group.children.filter((child) => !currentRow.includes(child) && roundToDecimal(child.position.y) > roundToDecimal(currentRow[0].position.y));
  const otherRows = new Map();
  otherModels.forEach(function (el) {
    const positionY = roundToDecimal(el.position.y);
    if (!otherRows.has(positionY)) {
      otherRows.set(positionY, [el]);
    } else otherRows.get(positionY).push(el)
  })



  //delete old and load new elements
  currentRow.forEach(function (el, idx) {
    const directory = el.position.y == 0 ? 'Legged/' : "Normal/"

    load(directory + path).then(function (gltf) {
      const object = gltf.scene;
      group.add(object)
      object.position.set(roundToDecimal(el.position.x), roundToDecimal(el.position.y), roundToDecimal(el.position.z));


      const newHeight = getModelSize(object).y;
      if(idx === 0)  adjustRows(otherRows, getModelSize(currentRow[0]).y, newHeight, posY);
      
    }, function (error) {
      console.error(error);
    });

    group.remove(el);
  });



 


}




function adjustRows(otherRows, oldHeight, newHeight, posY) {
  const gap = (oldHeight - newHeight);
  otherRows.forEach(function (column, positionY, idx) {
    const side = positionY > roundToDecimal(posY) ? "upper" : "lower";
    if(side == 'upper'){
      column.forEach(function(el){
        el.position.y -= gap;
      })
    }else{
      column.forEach(function(el){
        el.position.y += gap;
      })
    }
  });
}


// // ! changing the size 
// let measurments = [729, 329, 154];

// const depthInputsEl = document.querySelector('.select-size--depth .inputs');
// const heightInputsEl = document.querySelector('.select-size--height .inputs');
// const widthInputsEl = document.querySelector('.select-size--width .inputs');


// const getModelPath = function(measurments){
//   return measurments.join("x") + ".glb";
// }


// const showActiveBtn = function(arr){
//   arr.forEach(element => {
//     element.classList.remove('size-option--active')
//   });
// }

// depthInputsEl.addEventListener('click', function(e){
//   if(e.target.classList.contains('size-option')){
//     showActiveBtn(document.querySelectorAll('.select-size--depth .inputs *'))
//     e.target.classList.add('size-option--active');
//     measurments[1] = Number(e.target.dataset.size);
//     console.log(getModelPath(measurments));    
//   }
// });


// heightInputsEl.addEventListener('click', function(e){
//   if(e.target.classList.contains('size-option')){
//     showActiveBtn(document.querySelectorAll('.select-size--height .inputs *'))
//     e.target.classList.add('size-option--active');
//     measurments[2] = Number(e.target.dataset.size);
//     console.log(getModelPath(measurments));    
//   }
// });

// widthInputsEl.addEventListener('click', function(e){
//   if(e.target.classList.contains('size-option')){
//     showActiveBtn(document.querySelectorAll('.select-size--width .inputs *'))
//     e.target.classList.add('size-option--active');
//     measurments[0] = Number(e.target.dataset.size);
//     console.log(getModelPath(measurments));    
//     console.log(currentBlock);
//   }
// });