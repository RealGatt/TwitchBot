'use strict';
export const botMain = this;

import localStorage from "node-localstorage";
import fs from "fs";
import obs from "obs-websocket-js";
import websocket from "websocket";

export const botConfig = JSON.parse(fs.readFileSync("./config.json"));

import ModuleManager from "./bot_modules/module-manager.js";

console.log("Booting " + botConfig.version + " using Node v " + process.version);


// add modules here

const moduleManager = new ModuleManager();

fs.readdir("./bot_modules", (err, files)=>{
    if (err) console.log(err);
    for (const subDir of files){
        if (subDir.endsWith("-module.js")) {
            import(`./bot_modules/${subDir}`).then((module)=>{
                const moduleInstance = new module.default();
                moduleManager.registerModule(moduleInstance);
                moduleInstance.bootModule();
            });
        } 
    }
});





/*

. 　　　。　　　　•　 　ﾟ　　。 　　.

　　　.　　　 　　.　　　　　。　　 。　. 　

.　　 。　　　　　 ඞ 。 . 　　 • 　　　　•

　　ﾟ　　 Gatt was not An Impostor.　 。　.

　　'　　　 1 Impostor remains 　 　　。

　　ﾟ　　　.　　　. ,　　　　.　 .

*/



function shutdownModules() {
    for (const moduleI of moduleManager.getModules()) moduleI.shutdownModule();
}

process.on('uncaughtException', function (err) {
    console.log('Caught exception: ' + err);
});

process.on('SIGINT', () => {
    shutdownModules();
});

process.on('exit', function (code) {
    shutdownModules();
});