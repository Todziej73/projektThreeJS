'use strict'
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { Font, FontLoader } from 'three/addons/loaders/FontLoader.js';
import { TextGeometry } from 'three/addons/geometries/TextGeometry.js';
import * as THREE from 'three';
import {addCube} from "./main.js";
import { _timerStart, _timerStop } from './debug.js';
import { DRACOLoader } from 'three/examples/jsm/loaders/DRACOLoader.js';

const mustManager = new THREE.LoadingManager();


// 3D FONT/TEXT LOADER -- must

let font;
const fontLoader = new FontLoader(mustManager);
fontLoader.load("fonts/Rethink Sans_Regular.json", (loadedFont) => {
    font = loadedFont;
    console.log("--= Font was correctly assigned! =--");
});


/**
 * 
 * @param {string} text 
 * @param {string} fontPath 
 * @param {THREE.MeshStandardMaterial} material 
 * @returns {THREE.Mesh}
 */
const loadText = function(text, material = new THREE.MeshStandardMaterial({ color: 0x000000 })) {
    const geometry = new TextGeometry(text, {
        font: font,
        size: 0.05,
        depth: 0.001
    });

    const textMesh = new THREE.Mesh(geometry, material);

    return textMesh;
};


window.addEventListener('load', async () => {
    mustManager.onLoad = async function () {
        console.log('Ready to work (MUSTLOADER)!');
        await addCube(-1);
        overlay.classList.add('hidden');
        fill.classList.add('hidden');
        text.classList.add('hidden');
        percentage.classList.add('hidden');
    };
});




// PRELOADING all the models -- optional

const dracoLoader = new DRACOLoader();
dracoLoader.setDecoderPath("draco/");
const loader = new GLTFLoader();
loader.setDRACOLoader(dracoLoader);



const widths = [229, 329, 374, 420, 479, 523, 729];
const depths = [329, 374];
const heights = [79, 154, 229, 329, 374, 420];

const modules = ['', 'F', 'FB', 'FBLR', 'FBLRTB']
const type = ['Normal', 'Legged'];

const queue = [];
const modelPaths = [];
const models = {};

modules.forEach(mod => {
    type.forEach(type => {
        widths.forEach(w => {
            depths.forEach(d => {
                heights.forEach(h => {
                    const path = `klagem/module_${mod}/${type}/${w}x${d}x${h}.glb`;                    
                    modelPaths.push(path);
                    queue.push(path);                    
                });
            });
        });
    });
})

const loadNextInQueue = async function(){
    if(queue.length <= 0) return;
    const toLoad = queue[0];
    queue.splice(0, 1);

    const model = await loader.loadAsync(toLoad)
    .catch((reason) => {
        console.log(`🟥 Error: ${toLoad} | Reason: `, reason);
        return;
    });

    models[toLoad] = model;
}

const loadAllQueue = async function(){
    let loaded = 0;
    _timerStop();
    while(queue.length > 0){
        const total = queue.length + loaded;
        const progress = ((loaded / total) * 100).toPrecision(2);
        // console.log(`${loaded}/${total} --> ${progress}%`);
        await loadNextInQueue();
        loaded++;
    }
    const tookTime = _timerStop();
    console.log(`Loading all models took about: ${Math.round(tookTime)} seconds`);
}

const prioritizeModel = (path) => {
    const index = modelPaths.indexOf(path);
    if (index > -1) {
        modelPaths.splice(index, 1);
    }
    modelPaths.unshift(path);
};

/**
 * 
 * @param {string} path 
 * @returns { Promise<import('three/addons/loaders/GLTFLoader.js').GLTF> }
 */
const getModel = async function(path){
    if(!models[path]){
        prioritizeModel(path);
        models[path] = await loader.loadAsync(path);
    }

    return models[path];
}



const fill = document.querySelector('.fill');
const text = document.querySelector('.outline');
const overlay = document.querySelector('.overlay');
const percentage = document.querySelector('.percentage');

mustManager.onProgress = function (url, itemsLoaded, itemsTotal) {
    const progress = (itemsLoaded / itemsTotal) * 100;
    fill.style.width = `${progress}%`;
    percentage.textContent = Math.round(progress) + '%';
};






loadAllQueue();






export{loadText, getModel};
