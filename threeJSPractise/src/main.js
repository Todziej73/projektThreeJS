import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';

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
// camera.position.x = 3;

scene.add(camera);



const raycaster = new THREE.Raycaster()
let intersects = [];

const cubeGeometry = new THREE.BoxGeometry(1, 1, 1);
const cubeMaterial = new THREE.MeshBasicMaterial({color: 'red', wireframe: true});

const meshGroup = new THREE.Group();
const cubeMesh = new THREE.Mesh(cubeGeometry, cubeMaterial)
meshGroup.add(cubeMesh)
scene.add(meshGroup)

const addCube = function(side){
  const newCubeMesh = new THREE.Mesh(cubeGeometry, cubeMaterial);
  newCubeMesh.position.y += meshGroup.children.length
  meshGroup.add(newCubeMesh);
  
}



//! events
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
  intersects.forEach(function(el){
    el.object.material.color.setHex(0x000000)
  });
});

const sunLight = new THREE.AmbientLight(0xffffff, 1);
scene.add(sunLight)



const controls = new OrbitControls(camera, canvas)
controls.enableDamping = true;
// controls.autoRotate = true;





const rednerLoop = function(){
  controls.update();
  renderer.render(scene, camera);
  window.requestAnimationFrame(rednerLoop);
  // cubeMesh.rotation.y += 0.005;
}
rednerLoop();


//changing the colors

const btnContainer = document.querySelector('.btnContainer');
btnContainer.addEventListener('click', function(e){
  if(e.target.classList.contains('changeColorBtn')){
    const color = e.target.dataset.color;
    document.querySelectorAll('.changeColorBtn').forEach(e => e.classList.remove('clicked'));
    e.target.classList.add('clicked')
    cubeMesh.material.color.setHex(color);
  }
});

//changing the size
const inputElArr = document.querySelectorAll('.changeSizeInput input');

inputElArr.forEach(function(e, idx){
  e.addEventListener('input', function(){
    const value = this.value / 10;
    switch(idx){
      case 0:
        console.log("X value: ", value);
        cubeMesh.scale.x = value;
      case 1:
        console.log("Y value: ", value);
        cubeMesh.scale.y = value;
      case 2:
        console.log("Z value: ", value);
        cubeMesh.scale.z = value;
    }
  });
});


const switchEl = document.querySelector('.switch');
const ball = document.querySelector('.ball');
let checked = true;


switchEl.addEventListener('click', function(){
  if(checked){
    ball.style.animation = 'moveLeft 0.3s forwards ease-in-out';
    controls.autoRotate = false;
    switchEl.style.backgroundColor = '#efefef';
    ball.style.backgroundColor = '#343a40'
  }else{
    ball.style.animation = 'moveRight 0.3s forwards ease-in-out';
    switchEl.style.backgroundColor = '#37b24d';
    ball.style.backgroundColor = '#efefef'
    controls.autoRotate = true;
  }
  checked = !checked;
});

const settingsBtn = document.querySelector('.openSettingsBtn');
const settingsTab = document.querySelector('aside');
settingsBtn.addEventListener('click', () => settingsTab.classList.toggle('none'));