import { currentBlock, generatePoints, getModelSize, scene } from "./main";
import { LineMaterial } from 'three/examples/jsm/lines/LineMaterial.js';
import { LineSegments2 } from 'three/examples/jsm/lines/LineSegments2.js';
import { LineGeometry } from 'three/examples/jsm/lines/LineGeometry.js';



/**
 * @type {LineSegments2}
 */
let visibler;

const updateActiveVisibler = function(object = currentBlock){
  if(visibler){
    scene.remove(visibler);
    visibler.geometry.dispose();
    visibler.material.dispose();
  }
  if(!object)
    return;


  const currentBlockSize = getModelSize(object);
  const points = generatePoints(object);

  const positions = [
    points.topLeft.x, points.topLeft.y, 0,
    points.bottomLeft.x, points.bottomLeft.y, 0,
    points.bottomRight.x, points.bottomRight.y, 0,
    points.topRight.x, points.topRight.y, 0,
    points.topLeft.x, points.topLeft.y, 0,
  ];

  

  const lineGeometry = new LineGeometry();
  lineGeometry.setPositions(positions);

  const lineMaterial = new LineMaterial({
    color: 0xffff00,
    linewidth: 5,
  });

  visibler = new LineSegments2(lineGeometry, lineMaterial);

  visibler.position.z = object.position.z;

  visibler.position.z += currentBlockSize.z / 2;

  visibler.layers.set(1);

  scene.add(visibler);
}




export { updateActiveVisibler };