'use strict'
import * as THREE from 'three';



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
    opacity: 0.7
  })
  const triangle = new THREE.Mesh(triangleGeo, triangleMaterial)
  expansionHandles.add(triangle)
}
createTriangle([0.0, 1, 0.4, -0.3, 0.85, 0.4, 0.3, 0.85, 0.4])
createTriangle([-0.55, 0.5, 0.4, -0.4, 0.15, 0.4, -0.4, 0.8, 0.4]
)
createTriangle(
  [0.55, 0.5, 0.4, 
  0.4, 0.15, 0.4, 
  0.4, 0.8, 0.4]

)
//! PROTOTYPE


export{expansionHandles}

