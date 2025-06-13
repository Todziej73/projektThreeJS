import { generatePoints } from "./helpers";
import { checkSides, meshGroup } from "./main";


console.log(generatePoints);

/**
 * 
 * @param {Array} group 
 */

function equalVectors(a, b) {
  return a[0] === b[0] && a[1] === b[1];
}

const points = [];

export const connectBlocks   = function(group){
  group.children.forEach(function(el){
   
}