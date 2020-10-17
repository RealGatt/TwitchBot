'use strict';
import { botMain, botConfig, moduleManager } from "../index.js";
import ModuleBase from "./module-base.js";
import {chatClient, apiClient, username, channel, connectTime} from "./twitch-module.js";
import { PubSubClient } from 'twitch-pubsub-client';
import { obs } from "./obs-module.js";
import fs from "fs";
import asyncEval from "async-eval";

const instance = this;
var twitchModuleInstance, obsModuleInstance, queueModuleInstance;
var redemptions;

const pubSubClient = new PubSubClient();

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

			await pubSubClient.registerUserListener(apiClient);

			pubSubClient.onRedemption("23617040", async (redemptionMessage)=>{
				if (redemptionMessage.channelId === "23617040") {
					var redemptionName = redemptionMessage.rewardName;
					var msg = redemptionMessage.message;
					var splitMsg = [];
					if (msg) splitMsg = msg.split(" ");
					var user = redemptionMessage.userDisplayName;
					var potentialRedemption = redemptions.filter(redemption => redemptionName.toLowerCase() === redemption.redemptionName.toLowerCase())[0];
					if (potentialRedemption === undefined || potentialRedemption === null) return;
					switch(potentialRedemption.redemptionType){
						case "queue":
							console.log("Added " + redemptionName + " to queue");
							queueModuleInstance.addToQueue(redemptionName, redemptionMessage);	
							break;
						case "eval":
							eval(potentialRedemption.eval);
							break;
					}			
				}
			});

			console.log("Twitch Redemptions Module Booted");
		}
    }

    async shutdownModule() {
        console.log("Twtich Redemptions Module Shutdown");
    }
}