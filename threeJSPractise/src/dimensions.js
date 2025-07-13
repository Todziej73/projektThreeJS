import { cubesPositions, generatePoints, scene, meshGroup } from "./main";
import * as THREE from 'three';
import { loadText } from "./rederObject";
import { changeColumnSize } from "./configuratorPanel";
import { getParametersFromModel, select, extremeValues, getModelSize, extremeInArray, dataFromPosition, dataFromPositionVector, getConnectionsTypeByObject, boxesAround } from "./helpers";


const dimensionsGroup = new THREE.Group();
dimensionsGroup.name = "DIMENSIONS_GROUP";




const DefaultTextOptions = {
    size: 0.5,
    material: new THREE.MeshBasicMaterial({
        color: "#222222"
    }),
    bold: false
}

const BoldTextOptions = {
    size: 0.7,
    material: new THREE.MeshBasicMaterial({
        color: "#222222"
    }),
    bold: true
}



const setDimensionsVisiblity = function(visible = true){
    if(!scene) return;

    if(visible) scene.add(dimensionsGroup);
    else scene.remove(dimensionsGroup);
}


const updateDimensions = function(){
    dimensionsGroup.clear();
    
    // console.log(cubesPositions);
    
    dimensionsGroup.add(uDTop(DefaultTextOptions));
    dimensionsGroup.add(uDFront(BoldTextOptions));
    dimensionsGroup.add(uDDepth(DefaultTextOptions, BoldTextOptions));
    dimensionsGroup.add(uDHeight(DefaultTextOptions, BoldTextOptions));
}

const uDTop = function (TextOptions = DefaultTextOptions){
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
        const text = blockDimensionTextWithPlacement(el, EDGES.FrontWidthTop, TextOptions);
        text.position.add(offset);
        miniGroup.add(text);
    });

    return miniGroup;
}

const uDFront = function(TextOptions = DefaultTextOptions){
    const offset = new THREE.Vector3(0, 0.52, -0.15);
    // -=-=-=-=-=-=
    const miniGroup = new THREE.Group();
    const extremes = extremeValues(cubesPositions);
    const bottomRow = select(cubesPositions, meshGroup, null, extremes.min_y);
    
    let modelXSizeName = 0;
    bottomRow.forEach(el => {

        const joints = getConnectionsTypeByObject(el);
        const params = getParametersFromModel(el.name);
        const bAround = boxesAround(el);
        const isLeft = !bAround.left;

        modelXSizeName += OTHER_SIZES.joints[joints.bottomRight].width;
        if(isLeft) modelXSizeName += OTHER_SIZES.joints[joints.bottomLeft].width;
        modelXSizeName += params.width;
    });    
    
    const first = generatePoints(extremeInArray(bottomRow).min_x_Object).left;
    const last = generatePoints(extremeInArray(bottomRow).max_x_Object).right;
    const scaleX = last.x + first.x;
    
    const geometry = new THREE.BoxGeometry(scaleX);
    const tempObj = new THREE.Mesh(geometry);
    tempObj.position.x = scaleX / 2;
    tempObj.position.y = 0;
    tempObj.position.z = bottomRow[0].position.z;
    
    tempObj.name = `${modelXSizeName}x0x0.glb`;

    

    const text = blockDimensionTextWithPlacement(tempObj, EDGES.FrontWidthBottom, TextOptions);
    text.position.add(offset);
    miniGroup.add(text);


    return miniGroup;
}

const uDDepth = function(TextOptions1 = DefaultTextOptions, TextOptions2 = DefaultTextOptions){
    const offset = new THREE.Vector3(0, 0.02, 0);
    const sumaddoffset = new THREE.Vector3(0.1, 0, 0)

    // -=-=-=-=-=-=
    const miniGroup = new THREE.Group();
    const extremes = extremeValues(cubesPositions);
    const bottomRow = select(cubesPositions, meshGroup, null, extremes.min_y);

    const extremeObjects = extremeInArray(bottomRow);
    const left = extremeObjects.min_x_Object;
    const right = extremeObjects.max_x_Object;

    const textLeft = blockDimensionTextWithPlacement(left, EDGES.DepthBottomLeft, TextOptions1);
    const textRight = blockDimensionTextWithPlacement(right, EDGES.DepthBottomRight, TextOptions1);

    const copyl = left.clone();
    const copyr = right.clone();


    copyl.name = `0x${getParametersFromModel(left.name).depth + (2*OTHER_SIZES.joints.n.width)}x0.glb`;
    copyr.name = `0x${getParametersFromModel(right.name).depth + (2*OTHER_SIZES.joints.n.width)}x0.glb`;

    const sumTextLeft = blockDimensionTextWithPlacement(copyl, EDGES.DepthBottomLeft, TextOptions2);
    const sumTextRight = blockDimensionTextWithPlacement(copyr, EDGES.DepthBottomRight, TextOptions2);

    textLeft.position.add(offset);
    textRight.position.add(offset);
    sumTextLeft.position.add(offset.clone().sub(sumaddoffset));
    sumTextRight.position.add(offset.clone().add(sumaddoffset));
    sumTextLeft.rotation.y = 0;
    sumTextRight.rotation.y = 0;

    miniGroup.add(textLeft);
    miniGroup.add(textRight);
    miniGroup.add(sumTextLeft);
    miniGroup.add(sumTextRight);

    


    return miniGroup;
}

const uDHeight = function(TextOptions1 = DefaultTextOptions, TextOptions2 = DefaultTextOptions){
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
        const text = blockDimensionTextWithPlacement(el, EDGES.FrontHeightLeft, TextOptions1);
        const elPoints = generatePoints(el);
        text.rotateY(Math.PI / 4);
        text.rotateZ(Math.PI / 2);
        const pos = new THREE.Vector3(first.left.x, elPoints.left.y, getModelSize(firstObject).z / 2);
        text.position.x = pos.x;
        text.position.y = pos.y;
        text.position.z = pos.z;
        text.position.add(offset);
        
        miniGroup.add(text);
        // -=-=-=-
        const joints = getConnectionsTypeByObject(el);
        const params = getParametersFromModel(el.name);
        const isLegged = params.type == "Legged";

        modelYSizeName += OTHER_SIZES.joints[joints.topLeft].height;
        if(isLegged) modelYSizeName += OTHER_SIZES.joints[joints.bottomLeft].height;
        modelYSizeName += params.height;
    });

    // -=-=-=-=-=-=-

    modelYSizeName += OTHER_SIZES.feet.height;
    
    const scaleY = last.top.y + first.bottom.y;

    const geometry = new THREE.BoxGeometry(undefined, scaleY);
    const tempObj = new THREE.Mesh(geometry);
    tempObj.position.y = scaleY / 2 + offset.y;
    
    tempObj.name = `0x0x${modelYSizeName}.glb`;

    const text = blockDimensionTextWithPlacement(tempObj, EDGES.FrontHeightLeft, TextOptions2);
    // text.position.add(offset);
    text.rotateY(Math.PI / 4);
    text.rotateZ(Math.PI / 2);
    text.position.x = miniGroup.children[0].position.x - getModelSize(text).y / 2;
    text.position.z = miniGroup.children[0].position.z + getModelSize(text).y / 2;
    miniGroup.add(text);

    return miniGroup;
}


const OTHER_SIZES = {
    "joints": {
        "n": {
            "height": 39,
            "width": 45
        },
        "nlr": {
            "height": 39,
            "width": 50
        },
        "ntb": {
            "height": 50,
            "width": 45
        },
        "nlrtb": {
            "height": 50,
            "width": 50
        }
    },
    "feet": {
        height: 52
    }
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
        const size = getParametersFromModel(object.name);
        const printTexts = {
            w: `${size.width} mm`,
            h: `${size.height} mm`,
            d: `${size.depth} mm`,
        };

        // console.log(size);
        

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
const blockDimensionTextWithPlacement = function(object, edge, TextOptions = DefaultTextOptions){
    
    const point = TextEdgesHelper.getPoint(object, edge);
    const printed = TextEdgesHelper.getText(object, edge);

    const text = loadText(printed, TextOptions.material, TextOptions.bold);
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