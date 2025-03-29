import { cubesPositions, generatePoints, scene, meshGroup } from "./main";
import * as THREE from 'three';
import { load, loadText } from "./rederObject";
import { getColumn } from "./configuratorPanel";


const dimensionsGroup = new THREE.Group();

const setDimensionsVisiblity = async function(visible = true){
    if(!scene) return;

    if(visible) scene.add(dimensionsGroup);
    else scene.remove(dimensionsGroup);
}


const updateDimensions = async function(){
    dimensionsGroup.clear();
}

const uDTop = async function () {

}

const uDFront = async function(){

}

const uDDepth = async function(){

}

const uDHeight = async function(){

}











export { setDimensionsVisiblity, updateDimensions };