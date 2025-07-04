import { generatePoints, modelToClone, getParametersFromModel, checkConnections, boxesAround, vec2toVec3, dataFromPositionVector, select, getConnectionsTypeByObject } from "./helpers";
import { checkPosition, cubesPositions, getModelSize, meshGroup, scene } from "./main";
import { getModel } from "./rederObject";
import * as THREE from 'three';

const jointsGroup = new THREE.Group();

jointsGroup.name = "JOINTS_GROUP";


/**
 * 
 * @param {THREE.Mesh} obj 
 */
const connectSingle = async function (obj) {
  const offset = {
    "n": {"x": 0.026, "y": -0.02, "z": 0.028},
    "nlr": {"x": 0.02, "y": -0.02, "z": 0.028},
    "ntb": {"x": 0.025, "y": -0.014, "z": 0.028},
    "nlrtb": {"x": 0.02, "y": -0.014, "z": 0.028},
};

  const nlr = (await getModel("klagem/joints/Joint01.glb")).scene.clone();     // łączy left/right
  const n = (await getModel("klagem/joints/Joint02.glb")).scene.clone();       // bez połączeń
  const ntb = (await getModel("klagem/joints/Joint03.glb")).scene.clone();     // łączy top/bottom
  const nlrtb = (await getModel("klagem/joints/Joint04.glb")).scene.clone();   // łączy top/bottom i left/right
  n.name = "n";
  nlr.name = "nlr";
  ntb.name = "ntb";
  nlrtb.name = "nlrtb";

  const joints = {"n": n, "nlr": nlr, "ntb": ntb, "nlrtb": nlrtb};


  // Obrót dla jointów łączących lewo/prawo
  nlr.rotation.y = -Math.PI/2;
  nlrtb.rotation.y = -Math.PI/2;

  const bAround = boxesAround(obj);
  
  const size = getModelSize(obj);
  const params = getParametersFromModel(obj.name);
  const points = generatePoints(obj);
  const connections = getConnectionsTypeByObject(obj);

  const topLeft = joints[connections.topLeft].clone();
  const topRight = joints[connections.topRight].clone();

  const offsetTL = offset[topLeft.name.toLowerCase()];
  const offsetTR = offset[topRight.name.toLowerCase()];

  topLeft.position.copy(vec2toVec3(points.topLeft));
  topRight.position.copy(vec2toVec3(points.topRight));

  const ftl = topLeft.clone();
  const btl = topLeft.clone();
  const ftr = !bAround.right ? topRight.clone() : null;
  const btr = !bAround.right ? topRight.clone() : null;

  // update rotation
  if(ftr) ftr.rotation.y += Math.PI / 2;
  ftl.rotation.y = 0;
  btl.rotation.y -= Math.PI / 2;
  if(btr) btr.rotation.y = Math.PI;



  // update position
  const depth = size.z;
  ftl.position.z += depth / 2;
  if(ftr) ftr.position.z += depth / 2;
  btl.position.z += -depth / 2;
  if(btr) btr.position.z += -depth / 2;

  // offsets
  // - x
  ftl.position.x += offsetTL.x;
  if(ftr) ftr.position.x -= offsetTR.x;
  btl.position.x += offsetTL.x;
  if(btr) btr.position.x -= offsetTR.x;

  // - y
  ftl.position.y += offsetTL.y;
  if(ftr) ftr.position.y += offsetTR.y;
  btl.position.y += offsetTL.y;
  if(btr) btr.position.y += offsetTR.y;

  // - z
  ftl.position.z -= offsetTL.z;
  if(ftr) ftr.position.z -= offsetTR.z;
  btl.position.z += offsetTL.z;
  if(btr) btr.position.z += offsetTR.z;

  if(params.type != "Legged"){
    const nonleggedX = -0.007;
    const nonleggedZ = -0.004;

    ftl.position.x += nonleggedX;
    if(ftr) ftr.position.x -= nonleggedX;
    btl.position.x += nonleggedX;
    if(btr) btr.position.x -= nonleggedX;

    ftl.position.z -= nonleggedZ;
    if(ftr) ftr.position.z -= nonleggedZ;
    btl.position.z += nonleggedZ;
    if(btr) btr.position.z += nonleggedZ;
  }
  

  const jtoadd = [ftl, btl, ftr, btr].filter(Boolean);

  jointsGroup.add(...jtoadd);
};


export const connectWithJoints = async function(){
  jointsGroup.clear();

  for(const obj of meshGroup.children){
    await connectSingle(obj);
  }

}

/**
 * 
 * @param {THREE.Color} color 
 */
export const changeJointsColor = function(color = new THREE.Color(0,0,0)){
  for(const joint of jointsGroup.children){
    joint.children[0].children[0].material.color?.set(color);
  }
}

export const setJointsVisibility = function(visible = true){
    if(!scene) return;
    
    if(visible) scene.add(jointsGroup);
    else scene.remove(jointsGroup);
}