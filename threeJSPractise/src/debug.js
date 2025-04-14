import { meshGroup, setCurrentBlock } from "./main";

/**
 * | DEBUG FUNCTION | -> Rapidly changes size of random blocks
 * @param {number} cd 
 * @param {number} iterations 
 */
const _startChangingSizes = function(cd = 50, iterations = 10){
    if(iterations <= 0) return;

    const rnd1 = Math.floor(Math.random() * (meshGroup.children.length - 1));
    const randomBlock = meshGroup.children[rnd1];
    setCurrentBlock(randomBlock);


    const buttons = document.querySelectorAll(".size-option");
    const rnd2 = Math.floor(Math.random() * (buttons.length - 1));
    const btn = buttons[rnd2];
    btn.click();
    window.setTimeout(function(){_startChangingSizes(cd, iterations-1)}, cd);
}






//* DEBUG
window._startChangingSizes = _startChangingSizes;