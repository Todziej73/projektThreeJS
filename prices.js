import { boxesAround, checkConnections, dataFromPositionVector, getConnectionsTypeByObject, getFullObjectData, nameToColor, select } from "./threeJSPractise/src/helpers.js";
import { cubesPositions, meshGroup } from "./threeJSPractise/src/main.js"
import * as THREE from 'three';
import pricesText from '/src/pricesv3.csv?raw';


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
export const _PRICES = {
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

    
    for(const r of rows){        
        if(r.length < 10 || r[0].trim() == "") continue;       

        const compareName = r[0].split(" ")[0].toLowerCase();
        const compareType = r[1].split(" ")[0].toLowerCase();
        const price = parseFloat(r[3].replace(" ", "").replace('"', "").trim());
        

        if(compareName == 'uchwyt') _PRICES.handle = {'price':price};
        else if(compareType == 'foot') _PRICES.feet.push({'color':nameToColor(r[2]), 'price':price});
        else if(compareType == 'profil') _PRICES.profiles.push({'color':nameToColor(r[2]), 'price':price, 'len':parseInt(r[1].split(" ")[1])});
        else if(compareType == 'kolano') _PRICES.knees.push({'color':nameToColor(r[2]), 'price':price, 'connects': parseInt(r[1].split(" ")[1])});
        else if(compareType == 'szuflada' && r[2] == "PC mat") _PRICES.drawers.push({'height':parseInt(r[6]), 'width':parseInt(r[4]), 'price':price});
        else if(["ściana", "półka"].includes(compareType) && r[2] == "PC mat") _PRICES.walls.push({'width':parseInt(r[7]), 'height':parseInt(r[9]), 'price':price, 'type': compareType});
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
const getWallsPrice = function(data, countDuplicates = false, debug = false){
    const object = data.object;
    const ml = data.parameters.module.replace("module_", "");

    let horizontalWallsAmount = (ml.includes('TB') ? 0 : 2); // poziome 
    const frontBackWallsAmount = (ml.includes('F') || ml == "" ? 0 : 1) + (ml.includes('B') ? 0 : 1); // pionowe Front Back 
    let sideWallsAmount = (ml.includes('L') ? 0 : 1) + (ml.includes('R') ? 0 : 1); // pionowe Left Right 

    if (!countDuplicates) {
        const bAround = boxesAround(object);
        const pdata = dataFromPositionVector(cubesPositions, object.position);

        const topBlock = select(cubesPositions, meshGroup, pdata.x_index, pdata.y_index + 1)?.[0] || null;
        const topBlockML = topBlock ? getFullObjectData(topBlock).parameters.module.replace("module_", "") : "TB";
        horizontalWallsAmount -= bAround.top ? (topBlockML.includes("TB") ? 0 : 1) : 0;

        const leftBlock = select(cubesPositions, meshGroup, pdata.x_index - 1, pdata.y_index)?.[0] || null;
        const leftBlockML = leftBlock ? getFullObjectData(leftBlock).parameters.module.replace("module_", "") : "L";
        sideWallsAmount -= bAround.left ? (leftBlockML.includes("L") ? 0 : 1) : 0;
    }

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
const getKneesPrice = function(data, countDuplicates = false) {
    const object = data.object;
    const connections = checkConnections(object);
    const bAround = boxesAround(object);

    let topLeftCount = 2;
    let bottomLeftCount = 2;
    let topRightCount = 2;
    let bottomRightCount = 2;

    if (!countDuplicates) {
        topLeftCount = !bAround.top ? 2 : 0;
        topRightCount = !bAround.right ? 2 : 0;
        bottomRightCount = (!bAround.bottom && !bAround.right) ? 2 : 0;
    }

    const topLeftPrice = _PRICES.knees.find(knee => 
        knee.color.getHex() === data.colors.frameColor.getHex() && knee.connects === connections.leftTopSides
    )?.price ?? 0;

    const bottomLeftPrice = _PRICES.knees.find(knee => 
        knee.color.getHex() === data.colors.frameColor.getHex() && knee.connects === connections.leftBottomSides
    )?.price ?? 0;

    const topRightPrice = _PRICES.knees.find(knee => 
        knee.color.getHex() === data.colors.frameColor.getHex() && knee.connects === connections.rightTopSides
    )?.price ?? 0;

    const bottomRightPrice = _PRICES.knees.find(knee => 
        knee.color.getHex() === data.colors.frameColor.getHex() && knee.connects === connections.rightBottomSides
    )?.price ?? 0;

    const fullPrice = 
        (topLeftPrice * topLeftCount) +
        (bottomLeftPrice * bottomLeftCount) +
        (topRightPrice * topRightCount) +
        (bottomRightPrice * bottomRightCount);

    return {
        fullPrice,
        topLeftPrice: topLeftPrice * topLeftCount,
        bottomLeftPrice: bottomLeftPrice * bottomLeftCount,
        topRightPrice: topRightPrice * topRightCount,
        bottomRightPrice: bottomRightPrice * bottomRightCount,
        topLeftCount: topLeftCount,
        bottomLeftCount: bottomLeftCount,
        topRightCount: topRightCount,
        bottomRightCount: bottomRightCount
    };
};


/**
 * @param {{
 *    parameters: { width: number, height: number, depth: number, module: string, type: string },
 *    colors: { frameColor: THREE.Color, objectColor: THREE.Color }
 * }} data
 */
const getFeetPrice = function(data, countDuplicates = false){
    const object = data.object;
    if(data['parameters']['type'] != 'Legged') return {"amount": 0, "fullPrice": 0};
    const feet = _PRICES['feet'].find(feet => 
        feet.color.getHex() === data.colors.frameColor.getHex()
    );

    
    const feetPrice = feet.price;
    const bAround = boxesAround(object);
    const feetAmount = !countDuplicates ? bAround.left ? 2 : 4 : 4;
    const fullPrice = feetPrice * feetAmount;

    return {
        "fullPrice": fullPrice,
        "amount": feetAmount
    };
}



/**
 * @param {{
 *    parameters: { width: number, height: number, depth: number, module: string, type: string },
 *    colors: { frameColor: THREE.Color, objectColor: THREE.Color }
 * }} data
 */
const getProfilesPrice = function(data, countDuplicates = false) {
    const object = data.object;
    const frameColor = data.colors.frameColor.getHex();
    const bAround = boxesAround(object);

    const hProfile = _PRICES.profiles.find(profile => 
        profile.color.getHex() === frameColor && profile.len === data.parameters.height
    );
    const wProfile = _PRICES.profiles.find(profile => 
        profile.color.getHex() === frameColor && profile.len === data.parameters.width
    );
    const dProfile = _PRICES.profiles.find(profile => 
        profile.color.getHex() === frameColor && profile.len === data.parameters.depth
    );

    const hPrice = hProfile?.price ?? 0;
    const wPrice = wProfile?.price ?? 0;
    const dPrice = dProfile?.price ?? 0;

    // Domyślnie 4 każdego profilu
    let hCount = 4, wCount = 4, dCount = 4;

    if (!countDuplicates) {
        if (bAround.bottom) wCount -= 2;
        if (bAround.left) hCount -= 2;
        dCount = 1;
        if(!bAround.top) dCount += 1;
        if(!bAround.right) dCount += 1;
        if(!bAround.bottom && !bAround.right) dCount += 1;
    }

    const fullPrice = (hPrice * hCount) + (wPrice * wCount) + (dPrice * dCount);

    return {
        fullPrice,
        hPrice: hPrice * hCount,
        wPrice: wPrice * wCount,
        dPrice: dPrice * dCount,
        hCount: hCount,
        wCount: wCount,
        dCount: dCount
    };
};


const getHandlePrice = function(data){
    if(data['parameters']['module'] != 'module_') return 0;

    return _PRICES.handle.price;
}


export const getBoxPrice = function(object, countDuplicates = false){
    const data = getFullObjectData(object);
    data.object = object;
    // price calcs

    const drawerPrice = getDrawerPrice(data);
    const handlePrice =  getHandlePrice(data);
    const feetPrice = getFeetPrice(data, countDuplicates);
    const profilesPrice = getProfilesPrice(data, countDuplicates);
    const kneesPrice = getKneesPrice(data, countDuplicates);
    const wallsPrice = getWallsPrice(data, countDuplicates);

    let price = drawerPrice + feetPrice.fullPrice + profilesPrice.fullPrice + kneesPrice.fullPrice + handlePrice + wallsPrice.fullPrice;

    return price;
}



export const getFullPrice = function(countDuplicates = false){
    let fullPrice = 0;

    for(const obj of meshGroup.children){
        fullPrice += getBoxPrice(obj, countDuplicates);
    };


    return fullPrice;
}


export const fullPriceDebug = function(countDuplicates = false){
    const debug = {
        totalPrice: 0,

        drawer: { count: 0, price: 0 },
        feet: { count: 0, price: 0 },
        handle: { count: 0, price: 0 },

        walls: {
            frontBack: { count: 0, price: 0 },
            side: { count: 0, price: 0 },
            horizontal: { count: 0, price: 0 },
            total: 0
        },

        profiles: {
            h: { count: 0, price: 0 },
            w: { count: 0, price: 0 },
            d: { count: 0, price: 0 },
            total: 0
        },

        knees: {
            topLeft: { count: 0, price: 0 },
            topRight: { count: 0, price: 0 },
            bottomLeft: { count: 0, price: 0 },
            bottomRight: { count: 0, price: 0 },
            total: 0
        }
    };

    for (const obj of meshGroup.children) {
        const data = getFullObjectData(obj);
        data.object = obj;
        const price = getBoxPrice(obj, countDuplicates);
        debug.totalPrice += price;

        // Szuflady
        const drawerPrice = getDrawerPrice(data);
        if (drawerPrice > 0) {
            debug.drawer.count++;
            debug.drawer.price += drawerPrice;
        }

        // Nóżki
        const feet = getFeetPrice(data, countDuplicates);
        debug.feet.count += feet.amount;
        debug.feet.price += feet.fullPrice;

        // Uchwyt
        const handlePrice = getHandlePrice(data);
        if (handlePrice > 0) {
            debug.handle.count++;
            debug.handle.price += handlePrice;
        }

        // Ściany
        const walls = getWallsPrice(data);
        debug.walls.frontBack.count += walls.frontBackWallsAmount;
        debug.walls.frontBack.price += walls.frontBackWallsPrice;

        debug.walls.side.count += walls.sideWallsAmount;
        debug.walls.side.price += walls.sideWallsPrice;

        debug.walls.horizontal.count += walls.horizontalWallsAmount;
        debug.walls.horizontal.price += walls.horizontalWallsPrice;

        debug.walls.total += walls.fullPrice;

        // Profile
        const profiles = getProfilesPrice(data, countDuplicates);
        debug.profiles.h.count += profiles.hCount;
        debug.profiles.h.price += profiles.hPrice;

        debug.profiles.w.count += profiles.wCount;
        debug.profiles.w.price += profiles.wPrice;

        debug.profiles.d.count += profiles.dCount;
        debug.profiles.d.price += profiles.dPrice;

        debug.profiles.total += profiles.fullPrice;

        // Kolanka
        const knees = getKneesPrice(data, countDuplicates);
        debug.knees.topLeft.count += knees.topLeftCount;
        debug.knees.topLeft.price += knees.topLeftPrice;

        debug.knees.topRight.count += knees.topRightCount;
        debug.knees.topRight.price += knees.topRightPrice;

        debug.knees.bottomLeft.count += knees.bottomLeftCount;
        debug.knees.bottomLeft.price += knees.bottomLeftPrice;

        debug.knees.bottomRight.count += knees.bottomRightCount;
        debug.knees.bottomRight.price += knees.bottomRightPrice;

        debug.knees.total += knees.fullPrice;
    }

    // Wypisz debug w konsoli
    console.log("Szczegółowa analiza ceny:");
    console.log(`- Szuflady: ${debug.drawer.count} szt. | ${debug.drawer.price.toFixed(2)} zł`);
    console.log(`- Uchwyt: ${debug.handle.count} szt. | ${debug.handle.price.toFixed(2)} zł`);
    console.log(`- Nóżki: ${debug.feet.count} szt. | ${debug.feet.price.toFixed(2)} zł`);

    console.log(`- Ściany poziome (półki): ${debug.walls.horizontal.count} szt. | ${debug.walls.horizontal.price.toFixed(2)} zł`);
    console.log(`- Ściany front/back: ${debug.walls.frontBack.count} szt. | ${debug.walls.frontBack.price.toFixed(2)} zł`);
    console.log(`- Ściany boczne: ${debug.walls.side.count} szt. | ${debug.walls.side.price.toFixed(2)} zł`);
    console.log(`  -> Łącznie ściany: ${debug.walls.total.toFixed(2)} zł`);

    console.log(`- Profile H: ${debug.profiles.h.count} szt. | ${debug.profiles.h.price.toFixed(2)} zł`);
    console.log(`- Profile W: ${debug.profiles.w.count} szt. | ${debug.profiles.w.price.toFixed(2)} zł`);
    console.log(`- Profile D: ${debug.profiles.d.count} szt. | ${debug.profiles.d.price.toFixed(2)} zł`);
    console.log(`  -> Łącznie profile: ${debug.profiles.total.toFixed(2)} zł`);

    console.log(`- Kolanka Top-Left: ${debug.knees.topLeft.count} szt. | ${debug.knees.topLeft.price.toFixed(2)} zł`);
    console.log(`- Kolanka Top-Right: ${debug.knees.topRight.count} szt. | ${debug.knees.topRight.price.toFixed(2)} zł`);
    console.log(`- Kolanka Bottom-Left: ${debug.knees.bottomLeft.count} szt. | ${debug.knees.bottomLeft.price.toFixed(2)} zł`);
    console.log(`- Kolanka Bottom-Right: ${debug.knees.bottomRight.count} szt. | ${debug.knees.bottomRight.price.toFixed(2)} zł`);
    console.log(`  -> Łącznie kolanka: ${debug.knees.total.toFixed(2)} zł`);

    console.log(`= SUMA CAŁKOWITA: ${debug.totalPrice.toFixed(2)} zł`);

    return debug;
}


export const priceDebug = function(object = meshGroup.children[0]){
    const data = getFullObjectData(object);
    const price = getBoxPrice(object, true);
    const profilesPrice = getProfilesPrice(data, true);
    const kneesPrice = getKneesPrice(object, data, true);
    const wallsPrice = getWallsPrice(data, true, false);
    const drawerPrice = getDrawerPrice(data);
    const feetPrice = getFeetPrice(data, true);

    return {
        "price": price,
        "profiles": profilesPrice,
        "knees": kneesPrice,
        "walls": wallsPrice,
        "drawer": drawerPrice,
        "feet": feetPrice
    }
}


// -=-=-=-=-=-=-=-=-=-


importPrices();

