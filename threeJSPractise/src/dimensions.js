import { cubesPositions, generatePoints, scene, meshGroup } from "./main";
import * as THREE from 'three';
import { load, loadText } from "./rederObject";
import { changeColumnSize } from "./configuratorPanel";
import { getSizeParametersFromModel, select, extremeValues, getModelSize, extremeInArray, dataFromPosition, dataFromPositionVector } from "./helpers";


const dimensionsGroup = new THREE.Group();




const TextOptions = {
    size: 0.5,
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
    
    console.log(cubesPositions);
    
    dimensionsGroup.add(uDTop());
    dimensionsGroup.add(uDFront());
    dimensionsGroup.add(uDDepth());
    dimensionsGroup.add(uDHeight());
}

const uDTop = function (){
    const offset = new THREE.Vector3(0, 0.03, -0.05);
    // -=-=-=-=-=-=
    const miniGroup = new THREE.Group();
    
    const extremes = extremeValues(cubesPositions);
    const texted = [];
    for(let i = extremes.min_x; i <= extremes.max_x; i++){      
        const col = select(cubesPositions, meshGroup, i);
        
        texted.push(extremeInArray(col).max_y_Object);
    }

    
    
    texted.forEach(el => {
        const text = blockDimensionTextWithPlacement(el, EDGES.FrontWidthTop);
        text.position.add(offset);
        miniGroup.add(text);
    });

    return miniGroup;
}

const uDFront = function(){
    const offset = new THREE.Vector3(0, 0.52, -0.15);
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
    // console.log(last);
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
    const offset = new THREE.Vector3(0, 0.02, 0);
    // -=-=-=-=-=-=
    const miniGroup = new THREE.Group();
    const extremes = extremeValues(cubesPositions);
    const bottomRow = select(cubesPositions, meshGroup, null, extremes.min_y);

    const extremeObjects = extremeInArray(bottomRow);
    const left = extremeObjects.min_x_Object;
    const right = extremeObjects.max_x_Object;

    const textLeft = blockDimensionTextWithPlacement(left, EDGES.DepthBottomLeft);
    const textRight = blockDimensionTextWithPlacement(right, EDGES.DepthBottomRight);

    textLeft.position.add(offset);
    textRight.position.add(offset);


    miniGroup.add(textLeft);
    miniGroup.add(textRight);

    


    return miniGroup;
}

const uDHeight = function(){
    const offset = new THREE.Vector3(-0, -0.05, 0);
    // -=-=-=-=-=-=-
    const miniGroup = new THREE.Group();
    const extremes = extremeValues(cubesPositions);
    const highestColumnXIndex = dataFromPositionVector(cubesPositions, extremeInArray(select(cubesPositions, meshGroup, null, extremes.max_y)).max_y_Object.position).x_index;
    const highestColumn = select(cubesPositions, meshGroup, highestColumnXIndex);
    const leftColumn = select(cubesPositions, meshGroup, extremes.min_x);
    let modelYSizeName = 0;

    // only for position
    const firstObject = extremeInArray(leftColumn).min_y_Object;
    const first = generatePoints(firstObject);
    const last = generatePoints(extremeInArray(highestColumn).max_y_Object);    
    // -=-=-=-=-

    highestColumn.forEach(el => {
        const text = blockDimensionTextWithPlacement(el, EDGES.FrontHeightLeft);
        const elPoints = generatePoints(el);
        text.rotateY(Math.PI / 4);
        text.rotateZ(Math.PI / 2);
        const pos = new THREE.Vector3(first.left.x, elPoints.left.y, getModelSize(firstObject).z / 2);
        console.log(pos);
        text.position.x = pos.x;
        text.position.y = pos.y;
        text.position.z = pos.z;
        text.position.add(offset);
        console.log(text.position);
        
        miniGroup.add(text);
        // -=-=-=-
        modelYSizeName += getSizeParametersFromModel(el.name).height;
    });

    // -=-=-=-=-=-=-

    
    const scaleY = last.top.y + first.bottom.y;

    const geometry = new THREE.BoxGeometry(undefined, scaleY);
    const tempObj = new THREE.Mesh(geometry);
    tempObj.position.y = scaleY / 2 + offset.y;
    
    tempObj.name = `0x0x${modelYSizeName}.glb`;

    const text = blockDimensionTextWithPlacement(tempObj, EDGES.FrontHeightLeft);
    // text.position.add(offset);
    text.rotateY(Math.PI / 4);
    text.rotateZ(Math.PI / 2);
    text.position.x = miniGroup.children[0].position.x - getModelSize(text).y / 2;
    text.position.z = miniGroup.children[0].position.z + getModelSize(text).y / 2;
    miniGroup.add(text);

    return miniGroup;
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
        points.bottom.rotation = new THREE.Vector3(-Math.PI / 3, 0, 0);

        points.left.z = size.z / 2;
        points.left.rotation = new THREE.Vector3(0, 0, 0);

        points.right.z = size.z / 2;
        points.right.rotation = new THREE.Vector3(0, 0, 0);

        points.bottomLeft.z = 0;
        points.bottomLeft.rotation = new THREE.Vector3(-Math.PI / 2, -Math.PI / 3, -Math.PI / 2);

        points.bottomRight.z = 0;
        points.bottomRight.rotation = new THREE.Vector3(-Math.PI / 2, Math.PI / 3, Math.PI / 2);


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
    const rotationMultiplier = (point.rotation.z < 0 ? 1 : -1);

    text.position.x -= textSize.x / 2 * (edge == EDGES.DepthBottomRight ? rotationMultiplier : 1);
    text.position.y -= textSize.y / 2;
    if(edge == EDGES.DepthBottomLeft || edge == EDGES.DepthBottomRight)
        text.position.z -= (textSize.x / 2) * rotationMultiplier;
    else
        text.position.z -= textSize.z / 2;

    
    text.rotateX(point.rotation.x);
    text.rotateY(point.rotation.y);
    text.rotateZ(point.rotation.z);
    return text;
}








export { setDimensionsVisiblity, updateDimensions };