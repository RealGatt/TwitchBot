'use strict';

import {
    JSONStorage
} from "node-localstorage";
import fs, {
    promises as afs
} from "fs";
import obs from "obs-websocket-js";
import websocket from "websocket";
import ModuleManager from "./bot_modules/module-manager.js";

export const botMain = this;
export const botConfig = JSON.parse(fs.readFileSync("./config.json"));
export const localStorage = new JSONStorage("./localStorage");
export const moduleManager = new ModuleManager();

console.log("Booting " + botConfig.version + " using Node " + process.version);
// add modules here

fs.readdir("./bot_modules", (err, files) => {
    if (err) console.log(err);
    for (const subDir of files) {
        if (subDir.endsWith("-module.js")) {
            import(`./bot_modules/${subDir}`).then((module) => {
                const moduleInstance = new module.default();
                moduleManager.registerModule(moduleInstance);
                moduleManager.getModuleByName(moduleInstance.name).bootModule();
                sleep(1000);
            });
        }
    }
});

/*
const dir = await afs.readdir("./bot_modules");
for (const file of dir) {
    console.log(file);
    if (file.endsWith("-module.js")) {
        console.log(file);
        const mod = await import("./bot_modules/"+ file);
        console.log(file);
        const moduleInstance = new mod.default();
        console.log(file);
        moduleManager.registerModule(moduleInstance);
        moduleManager.getModuleByName(moduleInstance.name).bootModule()
    }
}
*/


/*

. 　　　。　　　　•　 　ﾟ　　。 　　.

　　　.　　　 　　.　　　　　。　　 。　. 　

.　　 。　　　　　 ඞ 。 . 　　 • 　　　　•

　　ﾟ　　 Gatt was not An Impostor.　 。　.

　　'　　　 1 Impostor remains 　 　　。

　　ﾟ　　　.　　　. ,　　　　.　 .

*/


function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}


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

process.on('unhandledRejection', (reason, p) => {
    console.log('Unhandled Rejection at: Promise', p, 'reason:', reason);
    // application specific logging, throwing an error, or other logic here
  });