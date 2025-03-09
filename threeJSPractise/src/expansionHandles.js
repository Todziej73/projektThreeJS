'use strict'
import * as THREE from 'three';



// ! PROTOTYPE
const expansionHandles = new THREE.Group();

const createTriangle = function (vertecies) {
  const triangleGeo = new THREE.BufferGeometry();
  const triangleVertecies = new Float32Array([...vertecies]);
  triangleGeo.setAttribute('position', new THREE.BufferAttribute(triangleVertecies, 3))
  const triangleMaterial = new THREE.MeshBasicMaterial({
    color: '#ffd43b',
    side: THREE.DoubleSide,
    transparent: true,
    opacity: 0.6
  })
  const triangle = new THREE.Mesh(triangleGeo, triangleMaterial)
  expansionHandles.add(triangle)
}
createTriangle([0.0, 0.8, 0.6, -0.5, 0.6, 0.6, 0.5, 0.6, 0.6])
createTriangle([-0.8, 0.0, 0.6, -0.6, 0.5, 0.6, -0.6, -0.5, 0.6])
createTriangle([0.8, 0.0, 0.6, 0.6, 0.5, 0.6, 0.6, -0.5, 0.6])
//! PROTOTYPE


export{expansionHandles}

