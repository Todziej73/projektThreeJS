import { checkConnections, getFrameColor, getFullObjectData, getObjectColor, getParametersFromModel, nameToColor } from "./helpers";
import { checkPosition, checkSides, meshGroup } from "./main"
import * as THREE from 'three';
import pricesText from '/src/prices.csv?raw';


/**
 * @type {{
 *  drawers: [{width: number, height: number, depth: number, price: number}],
 *  walls: [{width: number, height: number, price: number, type: string}],
 *  feet: [{color: THREE.Color, price: number}],
 *  knees: [{color: THREE.Color, connects: number, price: number}],
 *  profiles: [{color: THREE.Color, len: number, price: number}],
 *  handle: {price: number}
 *  }}
 */
const _PRICES = {
    drawers: [],
    walls: [],
    feet: [],
    knees: [],
    profiles: [],
    handle: { price: 0 }
};
function importPrices() {
    const rows = pricesText.split("\n");
    for(let i = 0; i < rows.length; i++){
        rows[i] = rows[i].split(",");
    }

    
    rows.forEach(r => {
        if(r[0] == 'other') _PRICES.handle = {'price':parseFloat(r[3])};
        else if(r[0] == 'feet') _PRICES.feet.push({'color':nameToColor(r[2]), 'price':parseFloat(r[3])});
        else if(r[0] == 'profile') _PRICES.profiles.push({'color':nameToColor(r[2]), 'price':parseFloat(r[3]), 'len':parseInt(r[6])});
        else if(r[0] == 'knee') _PRICES.knees.push({'color':nameToColor(r[2]), 'price':parseFloat(r[3]), 'connects': parseInt(r[1].split('lacznik ')[1])});
        else if(r[0] == 'drawer') _PRICES.drawers.push({'depth':parseInt(r[8]), 'height':parseInt(r[7]), 'width':parseInt(r[6]), 'price':parseFloat(r[3])});
        else if(r[0] == 'wall' || r[0] == 'shelf') _PRICES.walls.push({'width':parseInt(r[4]), 'height':parseInt(r[5]), 'price':parseFloat(r[3])});
    });
    
}


// -=-=-=-=-=-=-=-=-=-

/**
 * @param {{
 *    parameters: { width: number, height: number, depth: number, module: string, type: string },
 *    colors: { frameColor: THREE.Color, objectColor: THREE.Color }
 * }} data
 * @returns {number}
 */
const getDrawerPrice = function(data){
    const drawer = _PRICES['drawers'].find(drawer =>
        drawer.width == data.parameters.width && drawer.height == data.parameters.height && drawer.depth == data.parameters.depth
    );

    const drawerPrice = drawer.price;

    return drawerPrice;
}

/**
 * 
 * @param {number} width 
 * @param {number} height 
 * @returns {number}
 */
const getWallPrice = function(width, height){
    const wallPrice = _PRICES['walls'].find(wall => 
        wall.width == width && wall.height == height || wall.height == width && wall.width == height
    ).price;

    return wallPrice;
}


/**
 * @param {{
 *    parameters: { width: number, height: number, depth: number, module: string, type: string },
 *    colors: { frameColor: THREE.Color, objectColor: THREE.Color }
 * }} data
 */
const getWallsPrice = function(data){
    const ml = data.parameters.module.replace("module_");

    const horizontalWallsAmount = (ml.includes('TB') ? 0 : 2); // poziome 
    const frontBackWallsAmount = (ml.includes('F') ? 0 : 1) + (ml.includes('B') ? 0 : 1); // pionowe Front Back 
    const sideWallsAmount = (ml.includes('L') ? 0 : 1) + (ml.includes('R') ? 0 : 1); // pionowe Left Right 

    // -- shelf
    const horizontalWallsUnitPrice = getWallPrice(data.parameters.width, data.parameters.depth);
    const horizontalWallsPrice = horizontalWallsUnitPrice * horizontalWallsAmount;

    // -- wall
    const frontBackWallsUnitPrice = getWallPrice(data.parameters.width, data.parameters.height);
    const frontBackWallsPrice = frontBackWallsUnitPrice * frontBackWallsAmount;

    const sideWallsUnitPrice = getWallPrice(data.parameters.depth, data.parameters.height);
    const sideWallsPrice = sideWallsUnitPrice * sideWallsAmount;

    const fullPrice = frontBackWallsPrice + horizontalWallsPrice + sideWallsPrice;

    return {
        'fullPrice': fullPrice,
        'frontBackWallsPrice': frontBackWallsPrice,
        'frontBackWallsAmount': frontBackWallsAmount,
        'sideWallsPrice': sideWallsPrice,
        'sideWallsAmount': sideWallsAmount,
        'horizontalWallsPrice': horizontalWallsPrice,
        'horizontalWallsAmount': horizontalWallsAmount,
    };
};


/**
 * @param {{
 *    parameters: { width: number, height: number, depth: number, module: string, type: string },
 *    colors: { frameColor: THREE.Color, objectColor: THREE.Color }
 * }} data
 */
const getKneesPrice = function(object, data){
    const connections = checkConnections(object);

    const topLeftPrice = _PRICES['knees'].find(knee => 
        knee.color.getHex() === data.colors.frameColor.getHex() && knee.connects === connections.leftTopSides
    ).price * 2;
    const bottomLeftPrice = _PRICES['knees'].find(knee => 
        knee.color.getHex() === data.colors.frameColor.getHex() && knee.connects === connections.leftBottomSides
    ).price * 2;
    const topRightPrice = _PRICES['knees'].find(knee => 
        knee.color.getHex() === data.colors.frameColor.getHex() && knee.connects === connections.rightTopSides
    ).price * 2;
    const bottomRightPrice = _PRICES['knees'].find(knee => 
        knee.color.getHex() === data.colors.frameColor.getHex() && knee.connects === connections.rightBottomSides
    ).price * 2;

    const fullPrice = topLeftPrice + bottomLeftPrice + topRightPrice + bottomRightPrice;

    return {
        "fullPrice": fullPrice,
        "topLeftPrice": topLeftPrice,
        "bottomLeftPrice": bottomLeftPrice,
        "topRightPrice": topRightPrice,
        "bottomRightPrice": bottomRightPrice 
    };
}

/**
 * @param {{
 *    parameters: { width: number, height: number, depth: number, module: string, type: string },
 *    colors: { frameColor: THREE.Color, objectColor: THREE.Color }
 * }} data
 * @returns {number}
 */
const getFeetPrice = function(data){
    const feet = _PRICES['feet'].find(feet => 
        feet.color.getHex() === data.colors.frameColor.getHex()
    );

    
    const feetPrice = feet.price;

    const fullPrice = feetPrice * 4;

    return fullPrice;
}

/**
 * @param {{
 *    parameters: { width: number, height: number, depth: number, module: string, type: string },
 *    colors: { frameColor: THREE.Color, objectColor: THREE.Color }
 * }} data
 */
const getProfilesPrice = function(data) {
    const frameColor = data.colors.frameColor.getHex();

    const hProfile = _PRICES['profiles'].find(profile => 
        profile.color.getHex() === frameColor && profile.len === data.parameters.height
    );
    const wProfile = _PRICES['profiles'].find(profile => 
        profile.color.getHex() === frameColor && profile.len === data.parameters.width
    );
    const dProfile = _PRICES['profiles'].find(profile => 
        profile.color.getHex() === frameColor && profile.len === data.parameters.depth
    );

    const hPrice = hProfile.price;
    const wPrice = wProfile.price;
    const dPrice = dProfile.price;

    const fullPrice = (hPrice * 4) + (wPrice * 4) + (dPrice * 4);
    return {
        "fullPrice": fullPrice,
        "hPrice": hPrice,
        "wPrice": wPrice,
        "dPrice": dPrice
    };
};



const getBoxPrice = function(object){
    const data = getFullObjectData(object);

    // price calcs

    const drawerPrice = data['parameters']['module'] == 'module_' ? getDrawerPrice(data) : 0;
    const handlePrice = data['parameters']['module'] == 'module_' ? _PRICES.handle.price : 0;
    const feetPrice = data['parameters']['type'] == 'Legged' ? getFeetPrice(data) : 0;
    const profilesPrice = getProfilesPrice(data).fullPrice;
    const kneesPrice = getKneesPrice(object, data).fullPrice;
    const wallsPrice = getWallsPrice(data).fullPrice;

    const price = drawerPrice + feetPrice + profilesPrice + kneesPrice + handlePrice + wallsPrice;

    
    return price;
}


const getFullPrice = function(countDuplicates = false){
    var fullPrice = 0;
    for(const obj of meshGroup.children){
        
        fullPrice += getBoxPrice(obj);

        if(countDuplicates) continue;
        const posChecked = checkPosition(obj.position);
        const boxesAround = {
            "top": !posChecked[0],
            "bottom": getParametersFromModel(obj.name).type != "Legged",
            "left": !posChecked[1],
            "right": !posChecked[2]
        };
        const data = getFullObjectData(obj);
        const profilesPrice = getProfilesPrice(data);
        const kneesPrice = getKneesPrice(obj, data);
        const wallsPrice = getWallsPrice(data);

        if(boxesAround.bottom) fullPrice -= (profilesPrice.wPrice / 2) 
            + (kneesPrice.bottomLeftPrice + kneesPrice.bottomRightPrice) 
            + (wallsPrice.horizontalWallsAmount == 2 ? wallsPrice.horizontalWallsPrice / 2 : 0);

        if(boxesAround.left) fullPrice -= (profilesPrice.dPrice / 2) 
            + (profilesPrice.hPrice / 2) 
            + (kneesPrice.topLeftPrice) 
            + (wallsPrice.sideWallsAmount == 2 ? wallsPrice.sideWallsPrice / 2 : 0);


    };

    return fullPrice;
}

// -=-=-=-=-=-=-=-=-=-


importPrices();


window._PRICES = _PRICES;
window.getBoxPrice = getBoxPrice;
window.getFullPrice = getFullPrice;
window.getWallPrice = getWallPrice;