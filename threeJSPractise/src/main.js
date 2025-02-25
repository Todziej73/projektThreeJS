import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

//* SET UP
let width = 0;
let height = 0;

const mouse = new THREE.Vector2();

const scene = new THREE.Scene();
const canvas = document.querySelector('.canvas');
const renderer = new THREE.WebGLRenderer({canvas: canvas, antialias: true});
renderer.setClearColor('white', 0);
renderer.setSize(window.innerWidth, window.innerHeight);

const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 200);
camera.position.z = 3;
camera.position.x = 2;
camera.position.y = 1;
scene.add(camera);

const ambientLight = new THREE.AmbientLight(0xffffff, 1);
scene.add(ambientLight)

const pointLight = new THREE.PointLight(0xffffff, 1);
pointLight.position.z = 3;
pointLight.position.x = 2;
scene.add(pointLight)

const controls = new OrbitControls(camera, canvas)
controls.enableDamping = true;


const raycaster = new THREE.Raycaster()
let intersects = [];
let currentBlock;

class Cube extends THREE.Mesh{
  constructor(){
    super()
    this.geometry = new THREE.BoxGeometry(1, 1, 1);
    this.material = new THREE.MeshStandardMaterial({color: '#212529'});
  }
  sibblingNextTo = [];
}

Cube.prototype.onClick = function(){
  this.material.color.setHex(0xc92a2a);
}





const meshGroup = new THREE.Group();

const addCube = function(side){
  const cube = new Cube()
  meshGroup.add(cube)
  switch(side){
    case 'top':
      cube.position.set(currentBlock.position.x, currentBlock.position.y + 1, currentBlock.position.z)
      break;
    case 'right':
      cube.position.set(currentBlock.position.x + 1, currentBlock.position.y, currentBlock.position.z)
      break;
    case 'left':
      cube.position.set(currentBlock.position.x - 1, currentBlock.position.y, currentBlock.position.z)
      break;
  }
}
addCube()
scene.add(meshGroup)

//* EVENTS
const resize = function(){
  width = window.innerWidth;
  height = window.innerHeight;
  camera.aspect = width / height;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
  console.log('resize!');
};
resize();
window.addEventListener('resize', resize);



document.addEventListener('pointermove', function(e){
  mouse.set((e.clientX / width) * 2 - 1, -(e.clientY / height) * 2 + 1);
  raycaster.setFromCamera(mouse, camera);
  intersects = raycaster.intersectObjects(scene.children);
});

window.addEventListener('click', function(e){
  if(intersects.length > 0){
  meshGroup.children.forEach(function(e){
    e.material.color.setHex(0x212529)
  })
    intersects[0].object.onClick();
    currentBlock = intersects[0].object;
  }
});


const addBlockBtns = document.querySelectorAll('.block');
addBlockBtns.forEach(function(el, idx){
  if(!el.classList.contains('clickedBlock')){
    el.addEventListener('click', function(){
      const side = this.dataset.side;
      addCube(side);
    });
  }
});

const rednerLoop = function(){
  controls.update();
  renderer.render(scene, camera);
  window.requestAnimationFrame(rednerLoop);
  // cubeMesh.rotation.y += 0.005;
}
rednerLoop();


