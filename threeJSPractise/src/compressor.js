import fs from 'fs';
import { exec } from 'child_process';
import { fileURLToPath } from 'url';
import path, { dirname } from 'path';


const widths = [229, 329, 374, 420, 479, 523, 729];
const depths = [329, 374];
const heights = [79, 154, 229, 329, 374, 420];

const modules = ['', 'F', 'FB', 'FBLR', 'FBLRTB']
const types = ['Normal', 'Legged'];




function compressModel(input, output) {
    return new Promise((resolve, reject) => {
        const cmd = `gltf-pipeline -i "${input}" -o "${output}" -d`;
        exec(cmd, (error, stdout, stderr) => {
            if (error) {
                console.error(`❌ Błąd kompresji: ${input}`);
                console.error(stderr);
                reject(error);
                return;
            }
            console.log(`✅ Skompresowano: ${input}`);
            resolve();
        });
    });
}

function ensureDirExists(dirPath) {
    if (!fs.existsSync(dirPath)) {
        fs.mkdirSync(dirPath, { recursive: true });
    }
}



// =-=-=-=-


const output_folder = "klagem_draco";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);



async function compressAll(){
    for (const mod of modules) {
        for (const type of types) {
            for (const w of widths) {
                for (const d of depths) {
                    for (const h of heights) {
                        const input_path = `${path.join(__dirname, "..")}/public/klagem/module_${mod}/${type}/${w}x${d}x${h}.glb`;
                        const output_path = `${path.join(__dirname, "..")}/public/${output_folder}/module_${mod}/${type}/${w}x${d}x${h}.glb`;
                        
                        if (fs.existsSync(input_path)) {
                            ensureDirExists(path.dirname(output_path));
                            try {
                                await compressModel(input_path, output_path);
                            } catch (e) {}
                        } else {
                            console.warn(`⛔ Brak pliku: ${input_path}`);
                        }
                    }
                }
            }
        }
    }
}


// EXECUTABLE

compressAll();