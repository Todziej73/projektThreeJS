'use strict'
import * as THREE from 'three';
import {OrbitControls} from 'three/addons/controls/OrbitControls.js';

const setup = function(){
  //* SET UP
  let width = 0;
  let height = 0;
  
  const mouse = new THREE.Vector2();
  
  const scene = new THREE.Scene();
  const canvas = document.querySelector('.canvas');
  const renderer = new THREE.WebGLRenderer({
    canvas: canvas,
    antialias: true
  });
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



  const resize = function () {
    width = window.innerWidth;
    height = window.innerHeight;
    camera.aspect = width / height;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
    console.log('resize!');
  };
  resize();
  window.addEventListener('resize', resize);
  
  const rednerLoop = function () {
    controls.update();
    renderer.render(scene, camera);
    window.requestAnimationFrame(rednerLoop);
  }
  rednerLoop();

  return {
    scene: scene,
    width: width,
    height: height,
    camera: camera,
    rederer: renderer,
    controls: controls,
    mouse: mouse
  };
}


export {setup};

