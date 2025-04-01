import { cubesPositions, generatePoints, scene, meshGroup } from "./main";
import * as THREE from 'three';
import { load, loadText } from "./rederObject";
import { changeColumnSize } from "./configuratorPanel";
import { getSizeParametersFromModel, select, extremeValues, getModelSize, extremeInArray } from "./helpers";


const dimensionsGroup = new THREE.Group();

const TextOptions = {
    size: 0.75,
    material: new THREE.MeshBasicMaterial({
        color: "#222222"
    })
}



const setDimensionsVisiblity = async function(visible = true){
    if(!scene) return;

    if(visible) scene.add(dimensionsGroup);
    else scene.remove(dimensionsGroup);
}


const updateDimensions = function(){
    dimensionsGroup.clear();
    
    // dimensionsGroup.add(uDTop());
    dimensionsGroup.add(uDFront());
}

const uDTop = function (){
    const offset = new THREE.Vector3(0, 0.03, -0.05);
    // -=-=-=-=-=-=
    const miniGroup = new THREE.Group();
    
    const extremes = extremeValues(cubesPositions);
    const texted = [];
    for(let i = extremes.min_x; i <= extremes.max_x; i++){       
                 
        texted.push(extremeInArray(select(cubesPositions, meshGroup, i)).max_y_Object);
    }
    
    texted.forEach(el => {
        const text = blockDimensionTextWithPlacement(el, EDGES.FrontWidthTop);
        text.position.add(offset);
        miniGroup.add(text);
    });

    return miniGroup;
}

const uDFront = function(){
    const offset = new THREE.Vector3(0, 0.5, -0.2);
    // -=-=-=-=-=-=
    const miniGroup = new THREE.Group();
    const extremes = extremeValues(cubesPositions);
    const bottomRow = select(cubesPositions, meshGroup, null, extremes.min_y);
    
    let modelXSizeName = 0;
    bottomRow.forEach(el => {        
        modelXSizeName += getSizeParametersFromModel(el.name).width;
    });    
    
    const first = generatePoints(extremeInArray(bottomRow).min_x_Object).left;
    const last = generatePoints(extremeInArray(bottomRow).max_x_Object).right;
    const scaleX = last.x + first.x;
    console.log(last);
    // console.log(first);
    
    const geometry = new THREE.BoxGeometry(scaleX);
    const tempObj = new THREE.Mesh(geometry);
    tempObj.position.x = scaleX / 2;
    tempObj.position.y = 0;
    tempObj.position.z = bottomRow[0].position.z;
    
    tempObj.name = `${modelXSizeName}x0x0.glb`;

    

    const text = blockDimensionTextWithPlacement(tempObj, EDGES.FrontWidthBottom);
    text.position.add(offset);
    miniGroup.add(text);


    return miniGroup;
}

const uDDepth = function(){

}

const uDHeight = function(){

}


const EDGES = {
    FrontWidthTop: 0,
    FrontWidthBottom: 1,
    FrontHeightLeft: 2,
    FrontHeightRight: 3,
    DepthBottomLeft: 4,
    DepthBottomRight: 5,
}

const TextEdgesHelper = {
    getPoint: function(object, edge){
        const points = generatePoints(object);
        const size = getModelSize(object);
        points.top.z = size.z / 2;
        points.top.rotation = new THREE.Vector3(0, 0, 0);

        points.bottom.z = size.z / 2;
        points.bottom.rotation = new THREE.Vector3(-1.3, 0, 0);

        points.left.z = size.z / 2;
        points.right.z = size.z / 2;


        if(edge == EDGES.FrontWidthTop) return points.top;
        if(edge == EDGES.FrontWidthBottom) return points.bottom;
        if(edge == EDGES.FrontHeightLeft) return points.left;
        if(edge == EDGES.FrontHeightRight) return points.right;
        if(edge == EDGES.DepthBottomLeft) return points.bottomLeft;
        if(edge == EDGES.DepthBottomRight) return points.bottomRight;
        
        return new THREE.Vector2(0, 0);
    },

    getText: function(object, edge){
        const size = getSizeParametersFromModel(object.name);
        const printTexts = {
            w: `${size.width} mm`,
            h: `${size.height} mm`,
            d: `${size.depth} mm`,
        };

        if(edge == EDGES.FrontWidthTop || edge == EDGES.FrontWidthBottom) return printTexts.w;
        else if(edge == EDGES.FrontHeightLeft || edge == EDGES.FrontHeightRight) return printTexts.h;
        else return printTexts.d;
    }
}


/**
 * 
 * @param {THREE.Mesh} object 
 * @param {number} edge 
 */
const blockDimensionTextWithPlacement = function(object, edge){
    
    const point = TextEdgesHelper.getPoint(object, edge);
    const printed = TextEdgesHelper.getText(object, edge);

    const text = loadText(printed, TextOptions.material);
    text.position.x = point.x;
    text.position.y = point.y;
    text.position.z = point.z;

    text.scale.x *= TextOptions.size;
    text.scale.y *= TextOptions.size;
    text.scale.z *= TextOptions.size;

    const textSize = getModelSize(text);
    text.position.x -= textSize.x / 2;

    
    text.rotateX(point.rotation.x);
    text.rotateY(point.rotation.y);
    text.rotateZ(point.rotation.z);
    return text;
}








export { setDimensionsVisiblity, updateDimensions };