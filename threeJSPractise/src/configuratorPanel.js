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



export const changeColumnSize = function (group, map, path, position) {

  const currentColumn = group.children.filter((child) => roundToDecimal(child.position.x) == roundToDecimal(position.x));
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
      object.name = path;
      group.add(object);

      object.position.set(roundToDecimal(el.position.x), roundToDecimal(el.position.y), roundToDecimal(el.position.z));

      const newWidth = getModelSize(object).x;
      if(idx === 0)  adjustColmuns(otherColumns, map, getModelSize(currentColumn[0]).x, newWidth, position);

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


export const changeRowSize = function (group, map, path, position) {

  const currentRow = group.children.filter((child) => roundToDecimal(child.position.y) == roundToDecimal(position.y));
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
      object.name = path;
      object.position.set(roundToDecimal(el.position.x), roundToDecimal(el.position.y), roundToDecimal(el.position.z));


      const newHeight = getModelSize(object).y;
      if(idx === 0)  adjustRows(otherRows, getModelSize(currentRow[0]).y, newHeight, position.y);
      
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

