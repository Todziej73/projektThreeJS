'use strict'

//! switching the tabs

const tabBtnsContainer = document.querySelector('.select-tab-container');
const tabs = document.querySelectorAll('.configure-tab');

tabBtnsContainer.addEventListener('click', function(e){
  if(e.target.classList.contains('open-tab-btn')){
    const tab = document.querySelector('.' + e.target.dataset.tab);
    tabs.forEach((e) => e.classList.add('hidden'));
    tab.classList.remove('hidden');

    Array.from(tabBtnsContainer.children).forEach(el => el.classList.remove('tab--active'));
    e.target.classList.add('tab--active');
  }
})



// ! changing the size 
let measurments = [729, 329, 154];

const depthInputsEl = document.querySelector('.select-size--depth .inputs');
const heightInputsEl = document.querySelector('.select-size--height .inputs');
const widthInputsEl = document.querySelector('.select-size--width .inputs');


const getModelPath = function(measurments){
  return measurments.join("x") + ".glb";
}


const showActiveBtn = function(arr){
  arr.forEach(element => {
    element.classList.remove('size-option--active')
  });
}

depthInputsEl.addEventListener('click', function(e){
  if(e.target.classList.contains('size-option')){
    showActiveBtn(document.querySelectorAll('.select-size--depth .inputs *'))
    e.target.classList.add('size-option--active');
    measurments[1] = Number(e.target.dataset.size);
    console.log(getModelPath(measurments));    
  }
});


heightInputsEl.addEventListener('click', function(e){
  if(e.target.classList.contains('size-option')){
    showActiveBtn(document.querySelectorAll('.select-size--height .inputs *'))
    e.target.classList.add('size-option--active');
    measurments[2] = Number(e.target.dataset.size);
    console.log(getModelPath(measurments));    
  }
});

widthInputsEl.addEventListener('click', function(e){
  if(e.target.classList.contains('size-option')){
    showActiveBtn(document.querySelectorAll('.select-size--width .inputs *'))
    e.target.classList.add('size-option--active');
    measurments[0] = Number(e.target.dataset.size);
    console.log(getModelPath(measurments));    
  }
});


//! changing the color 