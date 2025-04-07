'use strict'
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { Font, FontLoader } from 'three/addons/loaders/FontLoader.js';
import { TextGeometry } from 'three/addons/geometries/TextGeometry.js';
import * as THREE from 'three';
import {addCube} from "./main.js";

const manager = new THREE.LoadingManager();
const loader = new GLTFLoader(manager);



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



const fill = document.querySelector('.fill');
const text = document.querySelector('.outline');
const overlay = document.querySelector('.overlay');
const percentage = document.querySelector('.percentage');

manager.onProgress = function (url, itemsLoaded, itemsTotal) {
    const progress = (itemsLoaded / itemsTotal) * 100;
    fill.style.width = `${progress}%`;
    percentage.textContent = Math.round(progress) + '%'
};

manager.onLoad = function () {
    console.log('All the models were correctly loaded!');
    addCube(-1)
    overlay.classList.add('hidden');
    fill.classList.add('hidden');
    text.classList.add('hidden');
    percentage.classList.add('hidden');
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



export{loadText, models};
