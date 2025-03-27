'use strict'
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';


const loader = new GLTFLoader(); 

const load = function(path){
    return loader.loadAsync( path) ;
}

export{load};

