import { boxesAround, checkConnections, getFrameColor, getFullObjectData, getObjectColor, getParametersFromModel, nameToColor } from "./helpers";
import { checkPosition, checkSides, meshGroup } from "./main"
import * as THREE from 'three';
import pricesText from '/src/pricesv2new.csv?raw';


/**
 * @type {{
 *  drawers: [{width: number, height: number, price: number}],
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
        rows[i] = rows[i].split(";");
    }

    
    for(const r of rows){
        if(r.length < 6) continue;       

        const compareName = r[0].split(" ")[0].toLowerCase();
        const compareType = r[1].split(" ")[0].toLowerCase();
        r[3] = r[3].replace(" ", "");

        if(compareName == 'uchwyt') _PRICES.handle = {'price':parseFloat(r[3])};
        else if(compareType == 'foot') _PRICES.feet.push({'color':nameToColor(r[2]), 'price':parseFloat(r[3])});
        else if(compareType == 'profil') _PRICES.profiles.push({'color':nameToColor(r[2]), 'price':parseFloat(r[3]), 'len':parseInt(r[1].split(" ")[1])});
        else if(compareType == 'kolano') _PRICES.knees.push({'color':nameToColor(r[2]), 'price':parseFloat(r[3]), 'connects': parseInt(r[1].split(" ")[1])});
        else if(compareType == 'szuflada') _PRICES.drawers.push({'height':parseInt(r[7]), 'width':parseInt(r[6]), 'price':parseFloat(r[3])});
        else if(["ściana", "półka"].includes(compareType) && r[2] == "PC mat") _PRICES.walls.push({'width':parseInt(r[4]), 'height':parseInt(r[5]), 'price':parseFloat(r[3]), 'type': compareType});
    };
    
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
    if(data['parameters']['module'] != 'module_') return 0;
    const drawer = _PRICES['drawers'].find(drawer =>
        drawer.width == data.parameters.width && drawer.height == data.parameters.height
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
const getWallPrice = function(width, height, type, debug = false){
    const wall = _PRICES['walls'].find(wall => 
        (wall.width == width && wall.height == height || wall.height == width && wall.width == height) && wall.type == type
    );
    if(!wall){
        console.error(`${type} o wymiarach ${width}x${height} nie została znaleziona!`);
        return;
    }

    const wallPrice = wall.price;
    if(debug){
        console.log(`${width}x${height} -> ${type}`);
        console.log(wallPrice, wall.type);
    }

    return wallPrice;
}


/**
 * @param {{
 *    parameters: { width: number, height: number, depth: number, module: string, type: string },
 *    colors: { frameColor: THREE.Color, objectColor: THREE.Color }
 * }} data
 */
const getWallsPrice = function(data, debug = false){
    const ml = data.parameters.module.replace("module_", "");

    const horizontalWallsAmount = (ml.includes('TB') ? 0 : 2); // poziome 
    const frontBackWallsAmount = (ml.includes('F') || ml == "" ? 0 : 1) + (ml.includes('B') ? 0 : 1); // pionowe Front Back 
    const sideWallsAmount = (ml.includes('L') ? 0 : 1) + (ml.includes('R') ? 0 : 1); // pionowe Left Right 

    // -- shelf
    const horizontalWallsUnitPrice = getWallPrice(data.parameters.width, data.parameters.depth, "półka", debug);
    const horizontalWallsPrice = horizontalWallsUnitPrice * horizontalWallsAmount;

    // -- wall
    const frontBackWallsUnitPrice = getWallPrice(data.parameters.width, data.parameters.height, "ściana", debug);
    const frontBackWallsPrice = frontBackWallsUnitPrice * frontBackWallsAmount;

    const sideWallsUnitPrice = getWallPrice(data.parameters.depth, data.parameters.height, "ściana", debug);
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
    if(data['parameters']['type'] != 'Legged') return 0;
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

const getHandlePrice = function(data){
    if(data['parameters']['module'] != 'module_') return 0;

    return _PRICES.handle.price;
}


const getBoxPrice = function(object, countDuplicates = false){
    const data = getFullObjectData(object);

    // price calcs

    const drawerPrice = getDrawerPrice(data);
    const handlePrice =  getHandlePrice(data);
    const feetPrice = getFeetPrice(data);
    const profilesPrice = getProfilesPrice(data);
    const kneesPrice = getKneesPrice(object, data);
    const wallsPrice = getWallsPrice(data);

    let price = drawerPrice + feetPrice + profilesPrice.fullPrice + kneesPrice.fullPrice + handlePrice + wallsPrice.fullPrice;

    if(countDuplicates) return price;
    const bAround = boxesAround(object);

    if(bAround.bottom) price -= (profilesPrice.wPrice / 2) 
        + (kneesPrice.bottomLeftPrice + kneesPrice.bottomRightPrice) 
        + (wallsPrice.horizontalWallsAmount == 2 ? wallsPrice.horizontalWallsPrice / 2 : 0);
    if(bAround.left) price -= (profilesPrice.dPrice / 2) 
        + (profilesPrice.hPrice / 2) 
        + (kneesPrice.topLeftPrice) 
        + (wallsPrice.sideWallsAmount == 2 ? wallsPrice.sideWallsPrice / 2 : 0);
    
    return price;
}



export const getFullPrice = function(countDuplicates = false, debug = false){
    var fullPrice = 0;
    for(const obj of meshGroup.children){
        fullPrice += getBoxPrice(obj, countDuplicates);
        
        if(debug) priceDebug(obj, countDuplicates);
    };

    return fullPrice;
}


const priceDebug = function(object = meshGroup.children[0], countDuplicates = false){
    const data = getFullObjectData(object);
    const price = getBoxPrice(object, countDuplicates);
    const profilesPrice = getProfilesPrice(data).fullPrice;
    const kneesPrice = getKneesPrice(object, data).fullPrice;
    const wallsPrice = getWallsPrice(data, true).fullPrice;
    const drawerPrice = getDrawerPrice(data);
    const feetPrice = getFeetPrice(data);
    console.log("data: ",data);
    console.log("-=-=-=-=-=-");
    console.log('price: ', price);
    console.log('profiles: ', profilesPrice);
    console.log('knees: ', kneesPrice);
    console.log('walls: ', wallsPrice);
    console.log('drawer: ', drawerPrice);
    console.log('feet: ', feetPrice);
    console.log("-=-=-=-=-=-");
}


// -=-=-=-=-=-=-=-=-=-


importPrices();


window._PRICES = _PRICES;
window.getBoxPrice = getBoxPrice;
window.getFullPrice = getFullPrice;
window.getWallPrice = getWallPrice;
window.priceDebug = priceDebug;