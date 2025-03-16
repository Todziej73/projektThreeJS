'use strict'
import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import {setUpObj} from './setup.js';

const scene = setUpObj.scene;

const loader = new GLTFLoader(); 

const load = function(path){
    return loader.loadAsync( path) ;
}

export{load};

