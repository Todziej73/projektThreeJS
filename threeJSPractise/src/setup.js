'use strict'
import * as THREE from 'three';
import {OrbitControls} from 'three/addons/controls/OrbitControls.js';

const setup = function () {
  //* SET UP
  const mouse = new THREE.Vector2();

  const scene = new THREE.Scene();
  const canvas = document.querySelector('.canvas');
  const renderer = new THREE.WebGLRenderer({
    canvas: canvas,
    antialias: true
  });
  renderer.setClearColor('white', 0);
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setPixelRatio(2)
  const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 200);
  camera.position.set(0.6, 0.65, 1.2)
  scene.add(camera);

  const ambientLight = new THREE.AmbientLight(0xffffff, 1);
  scene.add(ambientLight)

  const pointLight1 = new THREE.DirectionalLight(0xffffff, 2);
  pointLight1.position.set(3, 1, 2)
  pointLight1.castShadow = true;
  scene.add(pointLight1)



  const controls = new OrbitControls(camera, canvas)
  controls.enableDamping = true;
  controls.maxPolarAngle = Math.PI * 0.45;
  // controls.mouseButtons.RIGHT = THREE.MOUSE.ROTATE;

  //floor
  const planeGeo = new THREE.PlaneGeometry(15, 15);
  const planeMaterial = new THREE.MeshBasicMaterial({
    color: 0xeaeff3,
    side: THREE.DoubleSide
  })
  const floor = new THREE.Mesh(planeGeo, planeMaterial)
  floor.rotation.x = Math.PI * 0.5
  floor.position.y = 0
  scene.add(floor)



  //responisve 
  const resize = function () {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
    console.log('resize!');
  };
  resize();
  window.addEventListener('resize', resize);

  //animation loop
  const rednerLoop = function () {
    controls.update();
    renderer.render(scene, camera);
    window.requestAnimationFrame(rednerLoop);
  }
  rednerLoop();


  return {
    scene: scene,
    camera: camera,
    mouse: mouse,
    renderer: renderer,
  };
}

const setUpObj = setup();

export {
  setUpObj
};