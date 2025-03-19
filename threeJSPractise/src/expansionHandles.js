'use strict'
import * as THREE from 'three';


const clearGroup = function(group){
  group.children.forEach(child => {
    if (child.geometry) child.geometry.dispose();
    if (child.material) {
        if (Array.isArray(child.material)) {
            child.material.forEach(mat => mat.dispose());
        } else {
            child.material.dispose();
        }
    }
});
group.clear()
}

// ! PROTOTYPE
const expansionHandles = new THREE.Group();

const createTriangle = function (vertecies) {
  const triangleGeo = new THREE.BufferGeometry();
  const triangleVertecies = new Float32Array([...vertecies]);
  triangleGeo.setAttribute('position', new THREE.BufferAttribute(triangleVertecies, 3))
  const triangleMaterial = new THREE.MeshBasicMaterial({
    color: '#ced4da',
    side: THREE.DoubleSide,
    transparent: true,
    opacity: 0.8
  })
  const triangle = new THREE.Mesh(triangleGeo, triangleMaterial)
  expansionHandles.add(triangle)
}
//! PROTOTYPE

const createAddBtns = function(points){
  clearGroup(expansionHandles)
  const topBtnVertecies = [
    points.top.x, points.top.y + 0.13, 0.2, // gorny wiercholek
    points.topLeft.x, points.topLeft.y, 0.2, // lewy wierchołek
    points.topRight.x, points.topRight.y, 0.2 // prawy wierchołek
  ];
  
  // Right button
  const rightBtnVertecies = [
    points.right.x + 0.13, points.right.y, 0.2, 
    points.bottomRight.x, points.bottomRight.y, 0.2, 
    points.topRight.x, points.topRight.y, 0.2
  ];
  
  // Left button
  const leftBtnVertecies = [
    points.left.x - 0.13, points.left.y, 0.2, 
    points.bottomLeft.x, points.bottomLeft.y, 0.2, 
    points.topLeft.x, points.topLeft.y, 0.2
  ];
  createTriangle(topBtnVertecies)
  createTriangle(leftBtnVertecies)
  createTriangle(rightBtnVertecies)
}

export{expansionHandles, createAddBtns}

