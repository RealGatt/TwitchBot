'use strict';
export const botMain = this;

import localStorage from "node-localstorage";
import fs from "fs";
import obs from "obs-websocket-js";
import websocket from "websocket";

export const botConfig = JSON.parse(fs.readFileSync("./config.json"));

import ModuleManager from "./bot_modules/module-manager.js";
import TwitchModule from "./bot_modules/twitch-module.js";
import DiscordModule from "./bot_modules/discord-module.js";


console.log("Booting " + botConfig.version);

// add modules here

const moduleManager = new ModuleManager();


moduleManager.registerModule(new TwitchModule("Twitch"));
moduleManager.registerModule(new DiscordModule("Discord"));

for (const moduleI of moduleManager.getModules()) moduleI.bootModule();








function shutdownModules() {
    for (const moduleI of moduleManager.getModules()) moduleI.shutdownModule();
}

process.on('uncaughtException', function(err) {
    console.log('Caught exception: ' + err);
});

process.on('SIGINT', () => {
    shutdownModules();
});

process.on('exit', function(code) {
    shutdownModules();
});