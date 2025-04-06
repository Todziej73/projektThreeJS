'use strict'
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { Font, FontLoader } from 'three/addons/loaders/FontLoader.js';
import { TextGeometry } from 'three/addons/geometries/TextGeometry.js';
import * as THREE from 'three';
import {addCube} from "./main.js";

const manager = new THREE.LoadingManager();
const loader = new GLTFLoader(manager);



const load = async function(path){
    return await loader.loadAsync(path);
}


//prelaod all the models
const widths = [229, 329, 374, 420, 479, 523, 729];
const depths = [329, 374];
const heights = [79, 154, 229, 329, 374, 420];

const folders = ['Normal', 'Legged'];

const modelPaths = [];
const models = {};

folders.forEach(folder => {
    widths.forEach(w => {
        depths.forEach(d => {
            heights.forEach(h => {
                modelPaths.push(`${folder}/${w}x${d}x${h}.glb`);
            });
        });
    });
});

modelPaths.forEach((path) => {
    const name = path;
    loader.load(path, (gltf) => {
        models[name] = gltf;
    });
});

const progressBarContainer = document.querySelector('.progressbar');
const progressBar = document.querySelector('.progress');
const loadedModels = document.querySelector('.loaded');
const overlay = document.querySelector('.overlay');
manager.onProgress = function (url, itemsLoaded, itemsTotal) {
    const progress = (itemsLoaded / itemsTotal) * 100;
    progressBar.style.width = `${progress}%`;
    loadedModels.textContent = itemsLoaded;
};

manager.onLoad = function () {
    console.log('All the models were correctly loaded!');
    addCube(-1)
    progressBar.style.borderTopRightRadius = '100px';
    progressBar.style.borderBottomRightRadius = '100px';
    overlay.classList.add('hidden');
    progressBarContainer.classList.add('hidden');
};


// 3D FONT/TEXT LOADER

const fontLoader = new FontLoader();
let font;
fontLoader.load("/fonts/Rethink Sans_Regular.json", (loadedFont) => {
    font = loadedFont;
    console.log("--= Font was correctly assigned! =--");
})


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



export{ load, loadText, models};
