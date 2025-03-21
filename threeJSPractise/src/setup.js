'use strict'
import * as THREE from 'three';
import {OrbitControls} from 'three/addons/controls/OrbitControls.js';
import { EffectComposer } from "three/examples/jsm/postprocessing/EffectComposer.js";
import { RenderPass } from "three/examples/jsm/postprocessing/RenderPass.js";
import { OutlinePass } from "three/examples/jsm/postprocessing/OutlinePass.js";
import { FXAAShader } from 'three/addons/shaders/FXAAShader.js';
import { ShaderPass } from 'three/examples/jsm/postprocessing/ShaderPass.js';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { rotate, shiftRight } from 'three/src/nodes/TSL.js';



const setup = function(){
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
  
  const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 200);
  camera.position.set(0.6, 0.65, 1.2)
  scene.add(camera);
  
  const ambientLight = new THREE.AmbientLight(0xffffff, 2);
  scene.add(ambientLight)

  const pointLight1 = new THREE.DirectionalLight(0xffffff, 1);
  pointLight1.position.set(3, 0, 2)
  pointLight1.castShadow = true;
  scene.add(pointLight1)


  
  const controls = new OrbitControls(camera, canvas)
  controls.enableDamping = true;
  controls.maxPolarAngle = Math.PI * 0.45;
  // controls.mouseButtons.RIGHT = THREE.MOUSE.ROTATE;

  //floor
  const planeGeo = new THREE.PlaneGeometry(15, 15);
  const planeMaterial = new THREE.MeshBasicMaterial({color: 0xeaeff3, side: THREE.DoubleSide})
  const floor = new THREE.Mesh(planeGeo, planeMaterial)
  floor.rotation.x = Math.PI * 0.5
  // floor.position.y = -0.35
  scene.add(floor)


  //post processing
  // const composer = new EffectComposer(renderer);
  // const renderPass = new RenderPass(scene, camera);
  // composer.addPass(renderPass);

  // const outlinePass = new OutlinePass(new THREE.Vector2(window.innerWidth, window.innerHeight), scene, camera);
  // outlinePass.edgeStrength = 3; 
  // outlinePass.edgeGlow = 2; 
  // outlinePass.edgeThickness = 5;
  // outlinePass.visibleEdgeColor.set("#ffd43b");
  // composer.addPass(outlinePass);
  // outlinePass.renderToScreen = true;
  
  // const effectFXAA = new ShaderPass(FXAAShader);
  // effectFXAA.uniforms[ 'resolution' ].value.set( 1 / window.innerWidth, 1 / window.innerHeight );
  // composer.addPass( effectFXAA );

  //responisve 
  const resize = function () {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
    // composer.setSize(window.innerWidth, window.innerHeight);
    // effectFXAA.uniforms[ 'resolution' ].value.set( 1 / window.innerWidth, 1 / window.innerHeight );
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
    // outlinePass: outlinePass
  };
}

const setUpObj = setup();

export {setUpObj};

