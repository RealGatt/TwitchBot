'use strict';
import {
    botMain,
    botConfig
} from "../index.js";
import ModuleBase from "./module-base.js";
import DiscordJS from "discord.js";

export default class DiscordModule extends ModuleBase {
    constructor() {
        super();
        this.name = "DISCORD";
    }

    async bootModule() {
        console.log("Discord Module Booted");
    }

    async shutdownModule() {
        console.log("Discord Module Shutdown");
    }
}