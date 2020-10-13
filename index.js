'use strict'
const index = this;
index.toString = function() {
    return "index";
}
const config = require("./config.json");

const localStorage = require("node-localstorage");
const fs = require("fs");
const obs = require("obs-websocket-js");
const websocket = require("websocket");
const ModuleManager = require("./bot_modules/ModuleManager.js");

console.log("Booting " + config.version);

// add modules here

const moduleManager = new ModuleManager();

module.exports = {
    localStorage,
    fs,
    obs,
    websocket,
    config,
    moduleManager
};

const TwitchModule = require("./bot_modules/twitch-module.js");
const DiscordModule = require("./bot_modules/discord-module.js");

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