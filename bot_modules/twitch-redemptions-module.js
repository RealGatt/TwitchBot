'use strict';
import { botMain, botConfig, moduleManager } from "../index.js";
import ModuleBase from "./module-base.js";
import {chatClient, username, channel, connectTime} from "./twitch-module.js";
import { obs } from "./obs-module.js";
import fs from "fs";
import asyncEval from "async-eval";

const instance = this;
var twitchModuleInstance, obsModuleInstance, queueModuleInstance;
var redemptions;


export default class DiscordModule extends ModuleBase {
    constructor() {
        super();
        this.name = "TWITCHREDEMPTIONS";
	}
	
	loadRedemptions(){
		redemptions = JSON.parse(fs.readFileSync("./twitchRedemptions.json")).redemptions;
		console.log("Loaded " + redemptions.length + " redemptions.");
	}

    async bootModule() {

		if (chatClient === undefined || !chatClient.isConnected || !chatClient.currentNick){
			const thisInstance = this;
			setTimeout(async function (){
				await thisInstance.bootModule();
			}, 1000);
		}else{
			twitchModuleInstance = moduleManager.getModuleByName("TWITCH");
			obsModuleInstance = moduleManager.getModuleByName("OBS");
			queueModuleInstance = moduleManager.getModuleByName("QUEUE");
			this.loadRedemptions();
			console.log("Twitch Redemptions Module Booted");
			
			//await twitchModuleInstance.action("Command Handler is ready to go.");
		}
    }

    async shutdownModule() {
        console.log("Twtich Redemptions Module Shutdown");
    }
}