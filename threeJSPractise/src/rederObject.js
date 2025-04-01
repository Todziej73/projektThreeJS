'use strict'
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { Font, FontLoader } from 'three/addons/loaders/FontLoader.js';
import { TextGeometry } from 'three/addons/geometries/TextGeometry.js';
import * as THREE from 'three';


const loader = new GLTFLoader(); 

const load = function(path){
    return loader.loadAsync(path);
}



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



export{ load, loadText };
