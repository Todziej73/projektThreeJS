'use strict'
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { FontLoader } from 'three/addons/loaders/FontLoader.js';
import { TextGeometry } from 'three/addons/geometries/TextGeometry.js';
import * as THREE from 'three';


const loader = new GLTFLoader(); 

const load = function(path){
    return loader.loadAsync(path);
}



// 3D FONT/TEXT LOADER

const fontLoader = new FontLoader();

/**
 * 
 * @param {string} text 
 * @param {string} fontPath 
 * @param {THREE.MeshStandardMaterial} material 
 * @returns {THREE.Mesh}
 */
const loadText = async function(text, fontPath = "/fonts/Rethink Sans_Regular.json", material = new THREE.MeshStandardMaterial({ color: 0x000000 })) {
    return new Promise((resolve, reject) => {
        fontLoader.load(fontPath, function(font) {
            const geometry = new TextGeometry(text, {
                font: font,
                size: 1
            });

            const textMesh = new THREE.Mesh(geometry, material);
            resolve(textMesh);
        }, undefined, reject);
    });
};



export{ load, loadText };
