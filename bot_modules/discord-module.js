'use strict';
const index = require("../index.js");
const ModuleBase = require("./ModuleBase.js");
const DiscordJS = require("discord.js");

class DiscordModule extends ModuleBase {
    async bootModule() {
        console.log("Discord Module Booted");
    }
}

module.exports = DiscordModule;