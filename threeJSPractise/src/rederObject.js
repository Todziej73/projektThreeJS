'use strict'
import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import {setUpObj} from './setup.js';

const scene = setUpObj.scene;

const loader = new GLTFLoader(); 

const load = function(path){
  loader.load( path, function ( gltf ) {
    
    scene.add(gltf.scene);
  }, undefined, function ( error ) {
    
    console.error( error );
    
  } );
}

load('model.glb')


const move = function(obj){
  obj.position.x += 1
}
