<?php


$prices_file = "pricesv3.csv";
$debug = "";
$_PRICES = [
    'drawers'  => [],
    'walls'    => [],
    'feet'     => [],
    'knees'    => [],
    'profiles' => [],
    'handle'   => ['price' => 0],
];
$fullData;

function loadFullData($json){
    global $fullData;
    $fullData = $json;
}


// -=-=-=-=-=-=-=-=-=-


function select($x_index = null, $y_index = null) {
    global $fullData;
  $ret = [];

  foreach($fullData as $el){
    $pdata = $el['data'];
    if ($x_index !== null && $y_index !== null && ($pdata['x_index'] == $x_index && $pdata['y_index'] == $y_index)) {
    $ret[] = $el; // x i y
    } elseif ($x_index !== null && $y_index === null && ($pdata['x_index'] == $x_index)) {
        $ret[] = $el; // x
    } elseif ($x_index === null && $y_index !== null && ($pdata['y_index'] == $y_index)) {
        $ret[] = $el; // y
    } elseif ($x_index === null && $y_index === null) {
        $ret[] = $el; // wszystkie
    }

  }

  return $ret;
};

function nameToColor($name) {
    if($name == 'gold') return 16766720;
    else if($name == '9005') return 2500134;
    else if($name == 'bronze') return 13467442;

    return 0;
}



// -=-=-=-=-=-=-=-=-=-



function importPrices() {
    global $prices_file, $_PRICES;
    $pricesText = @file_get_contents($prices_file);
    if ($pricesText === false) {
        return;
    };

    // Usuń BOM
    $pricesText = preg_replace('/^\xEF\xBB\xBF/', '', $pricesText);

    // Autodetekcja delimiter'a
    $firstLine = strtok($pricesText, "\n");
    $delim = (substr_count($firstLine, ';') > substr_count($firstLine, ',')) ? ';' : ',';

    $rows = [];
    foreach (explode("\n", $pricesText) as $i => $line) {
        $line = trim($line, "\r\n");
        if ($line === '') continue;
        $fields = str_getcsv($line, $delim);
        $rows[] = $fields;
    }

    foreach ($rows as $r) {
        if (count($r) < 10 || trim($r[0]) === "") continue;

        $firstNamePart = explode(" ", $r[0])[0];
        $compareName   = mb_strtolower($firstNamePart, 'UTF-8');

        $firstTypePart = explode(" ", $r[1])[0];
        $compareType   = mb_strtolower($firstTypePart, 'UTF-8');

        $priceStr = str_replace(["\xC2\xA0", '"'], "", trim($r[3]));
        $price = floatval($priceStr);

        if ($compareName === 'uchwyt') {
            $_PRICES['handle'] = ['price' => $price];
        } elseif ($compareType === 'foot') {
            $_PRICES['feet'][] = ['color' => nameToColor($r[2]), 'price' => $price];
        } elseif ($compareType === 'profil') {
            $parts = explode(" ", $r[1]);
            $_PRICES['profiles'][] = [
                'color' => nameToColor($r[2]),
                'price' => $price,
                'len'   => isset($parts[1]) ? (int)$parts[1] : 0
            ];
        } elseif ($compareType === 'kolano') {
            $parts = explode(" ", $r[1]);
            $_PRICES['knees'][] = [
                'color'    => nameToColor($r[2]),
                'price'    => $price,
                'connects' => isset($parts[1]) ? (int)$parts[1] : 0
            ];
        } elseif ($compareType === 'szuflada' && ($r[2] ?? null) === "PC mat") {
            $_PRICES['drawers'][] = [
                'height' => isset($r[6]) ? (int)$r[6] : 0,
                'width'  => isset($r[4]) ? (int)$r[4] : 0,
                'price'  => $price
            ];
        } elseif (in_array($compareType, ["ściana", "półka"], true) && ($r[2] ?? null) === "PC mat") {
            $_PRICES['walls'][] = [
                'width'  => isset($r[7]) ? (int)$r[7] : 0,
                'height' => isset($r[9]) ? (int)$r[9] : 0,
                'price'  => $price,
                'type'   => $compareType
            ];
        }
    }
}




// -=-=-=-=-=-=-=-=-=-

function getDrawerPrice($data){
    global $_PRICES;

    if($data['parameters']['module'] != 'module_') return 0;
    $drawer = null;
    foreach ($_PRICES['drawers'] as $d) {
        if ($d['width'] == $data['parameters']['width'] && $d['height'] == $data['parameters']['height']) {
            $drawer = $d;
            break;
        }
    }


    $drawerPrice = $drawer['price'];

    return $drawerPrice;
}

function getWallPrice($width, $height, $type){
    global $_PRICES;

    $wall = null;
    foreach($_PRICES['walls'] as $w) {
        if(($w['width'] == $width && $w['height'] == $height || $w['height'] == $width && $w['width'] == $height) && $w['type'] == $type){
            $wall = $w;
            break;
        }
    }

    if($wall == null) return;

    $wallPrice = $wall['price'];

    return $wallPrice;
}


function getWallsPrice($data){

    $ml = str_replace("module_", "", $data['parameters']['module']);

    $horizontalWallsAmount = (strpos($ml, 'TB') !== false) ? 0 : 2;
    $frontBackWallsAmount = ((strpos($ml, 'F') !== false || $ml === "") ? 0 : 1) + ((strpos($ml, 'B') !== false) ? 0 : 1);
    $sideWallsAmount = ((strpos($ml, 'L') !== false) ? 0 : 1) + ((strpos($ml, 'R') !== false) ? 0 : 1);


    $bAround = $data['boxesAround'];
    $pdata = $data['data'];


    $topBlock = select($pdata['x_index'], $pdata['y_index'] + 1)[0] ?? null;
    $topBlockML = $topBlock ? str_replace("module_", "", $topBlock['parameters']['module']) : "TB";
    $horizontalWallsAmount -= $bAround['top'] ? ((strpos($topBlockML, "TB") !== false) ? 0 : 1) : 0;

    $leftBlock = select($pdata['x_index'] - 1, $pdata['y_index'])[0] ?? null;
    $leftBlockML = $leftBlock ? str_replace("module_", "", $leftBlock['parameters']['module']) : "L";
    $sideWallsAmount -= $bAround['left'] ? ((strpos($leftBlockML, "L") !== false) ? 0 : 1) : 0;


    // -- shelf
    $horizontalWallsUnitPrice = getWallPrice($data['parameters']['width'], $data['parameters']['depth'], "półka");
    $horizontalWallsPrice = $horizontalWallsUnitPrice * $horizontalWallsAmount;

    // -- wall
    $frontBackWallsUnitPrice = getWallPrice($data['parameters']['width'], $data['parameters']['height'], "ściana");
    $frontBackWallsPrice = $frontBackWallsUnitPrice * $frontBackWallsAmount;

    $sideWallsUnitPrice = getWallPrice($data['parameters']['depth'], $data['parameters']['height'], "ściana");
    $sideWallsPrice = $sideWallsUnitPrice * $sideWallsAmount;

    $fullPrice = $frontBackWallsPrice + $horizontalWallsPrice + $sideWallsPrice;

    return [
        'fullPrice' => $fullPrice,
        'frontBackWallsPrice' => $frontBackWallsPrice,
        'frontBackWallsAmount' => $frontBackWallsAmount,
        'sideWallsPrice' => $sideWallsPrice,
        'sideWallsAmount' => $sideWallsAmount,
        'horizontalWallsPrice' => $horizontalWallsPrice,
        'horizontalWallsAmount' => $horizontalWallsAmount,
    ];
};


function getKneesPrice($data) {
    global $_PRICES;

    $connections = $data['connections'];
    $bAround = $data['boxesAround'];

    $topLeftCount = $bottomLeftCount = $topRightCount = $bottomRightCount = 2;

    $topLeftCount = !$bAround['top'] ? 2 : 0;
    $topRightCount = !$bAround['right'] ? 2 : 0;
    $bottomRightCount = (!$bAround['bottom'] && !$bAround['right']) ? 2 : 0;

    $topLeftPrice = $bottomLeftPrice = $topRightPrice = $bottomRightPrice = 0;

    foreach($_PRICES['knees'] as $knee){
        if($knee['color'] != $data['material']['frameColor']) continue;
        if($knee['connects'] == $connections['leftTopSides']) $topLeftPrice = $knee['price'];
        if($knee['connects'] == $connections['leftBottomSides']) $bottomLeftPrice = $knee['price'];
        if($knee['connects'] == $connections['rightTopSides']) $topRightPrice= $knee['price'];
        if($knee['connects'] == $connections['rightBottomSides']) $bottomRightPrice = $knee['price'];
    }

    $fullPrice = 
        ($topLeftPrice * $topLeftCount) +
        ($bottomLeftPrice * $bottomLeftCount) +
        ($topRightPrice * $topRightCount) +
        ($bottomRightPrice * $bottomRightCount);

    return [
        'fullPrice' => $fullPrice,
        'topLeftPrice' => $topLeftPrice * $topLeftCount,
        'bottomLeftPrice' => $bottomLeftPrice * $bottomLeftCount,
        'topRightPrice' => $topRightPrice * $topRightCount,
        'bottomRightPrice' => $bottomRightPrice * $bottomRightCount,
        'topLeftCount' => $topLeftCount,
        'bottomLeftCount' => $bottomLeftCount,
        'topRightCount' => $topRightCount,
        'bottomRightCount' => $bottomRightCount
    ];
};



function getFeetPrice($data){
    global $_PRICES;

    if($data['parameters']['type'] != 'Legged') return ["amount" => 0, "fullPrice" => 0];
    $feet = null;
    foreach($_PRICES['feet'] as $f){
        if($f['color'] === $data['material']['frameColor']){
            $feet = $f;
            break;
        }
    }
    
    $feetPrice = $feet['price'];
    $bAround = $data['boxesAround'];
    $feetAmount = $bAround['left'] ? 2 : 4;
    $fullPrice = $feetPrice * $feetAmount;

    return [
        "fullPrice" => $fullPrice,
        "amount" => $feetAmount
    ];
}



function getProfilesPrice($data) {
    global $_PRICES;

    $frameColor = $data['material']['frameColor'];
    $bAround = $data['boxesAround'];

    $hPrice = $wPrice = $dPrice = 0;

    foreach($_PRICES['profiles'] as $profile){
        if($profile['color'] != $frameColor) continue;
        if($profile['len'] == $data['parameters']['height']) $hPrice = $profile['price'];
        if($profile['len'] == $data['parameters']['width']) $wPrice = $profile['price'];
        if($profile['len'] == $data['parameters']['depth']) $dPrice = $profile['price'];
    }


    // Domyślnie 4 każdego profilu
    $hCount = $wCount = $dCount = 4;

    if ($bAround['bottom']) $wCount -= 2;
    if ($bAround['left']) $hCount -= 2;
    $dCount = 1;
    if(!$bAround['top']) $dCount += 1;
    if(!$bAround['right']) $dCount += 1;
    if(!$bAround['bottom'] && !$bAround['right']) $dCount += 1;

    $fullPrice = ($hPrice * $hCount) + ($wPrice * $wCount) + ($dPrice * $dCount);

    return [
        'fullPrice' => $fullPrice,
        'hPrice' => $hPrice * $hCount,
        'wPrice' => $wPrice * $wCount,
        'dPrice' => $dPrice * $dCount,
        'hCount' => $hCount,
        'wCount' => $wCount,
        'dCount' => $dCount
    ];
};


function getHandlePrice($data){
    global $_PRICES;

    if($data['parameters']['module'] != 'module_') return 0;

    return $_PRICES['handle']['price'];
}


function getBoxPrice($data){
    // global $debug;
    $drawerPrice = getDrawerPrice($data);
    $handlePrice =  getHandlePrice($data);
    $feetPrice = getFeetPrice($data);
    $profilesPrice = getProfilesPrice($data);
    $kneesPrice = getKneesPrice($data);
    $wallsPrice = getWallsPrice($data);

    $price = $drawerPrice + $feetPrice['fullPrice'] + $profilesPrice['fullPrice'] + $kneesPrice['fullPrice'] + $handlePrice + $wallsPrice['fullPrice'];



    // $debug .= "Drawer: " . $drawerPrice;
    // $debug .= "\nHandle: " . $handlePrice;
    // $debug .= "\nFeet: " . $feetPrice['fullPrice'];
    // $debug .= "\nProfiles: " . $profilesPrice['fullPrice'];
    // $debug .= "\nKnees: " . $kneesPrice['fullPrice'];
    // $debug .= "\nWalls: " . $wallsPrice['fullPrice'];
    return $price;
}

function getFullPrice(){
    global $fullData;

    $fullPrice = 0;

    foreach($fullData as $data){
        $fullPrice += getBoxPrice($data);
    };

    return $fullPrice;
}
