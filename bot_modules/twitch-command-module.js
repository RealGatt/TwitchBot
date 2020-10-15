'use strict';
import { botMain, botConfig, moduleManager } from "../index.js";
import ModuleBase from "./module-base.js";
import {chatClient, username, channel, connectTime} from "./twitch-module.js";
import fs from "fs";

const instance = this;
var twitchModuleInstance;
var commands;

export default class TwitchCommandModule extends ModuleBase {
    constructor() {
        super();
        this.name = "TWITCHCOMMANDS";
    }

	parseString(channel, user, message){
		message = message.replace("$USER", user);
		message = message.replace("$CHANNEL", channel);
		return message;
	}

	loadCommands(){
		commands = JSON.parse(fs.readFileSync("./twitchCommands.json")).commands;
		console.log("Loaded " + commands.length + " commands.");
	}

    async bootModule() {
		if (chatClient === undefined || !chatClient.isConnected || !chatClient.currentNick){
			console.log("ChatClient isn't connected. Trying again in 1 second");
			const thisInstance = this;
			setTimeout(async function (){
				await thisInstance.bootModule();
			}, 1000);
		}else{
			twitchModuleInstance = moduleManager.getModuleByName("TWITCH");
			console.log("ChatClient is connected as " + chatClient.currentNick);
			this.loadCommands();
			
			await twitchModuleInstance.action("Command Handler is ready to go.");
			chatClient.onMessage(async (sentChannel, user, msg) => {
				if (sentChannel === channel){
					if (msg.startsWith(botConfig.twitch.commandPrefix)){
						var potentialCommand = commands.filter(cmd=>msg.startsWith(botConfig.twitch.commandPrefix + cmd.command))[0];
						if (potentialCommand === undefined || potentialCommand === null) return;
						if (potentialCommand.modOnly && user !== "gatt_au") return;
						if (potentialCommand.gattOnly && user !== "gatt_au") return;
						switch (potentialCommand.responseType){
							case "eval":
								var evalD = eval(potentialCommand.response);
								await twitchModuleInstance.action(evalD);
								break;
							case "simple":
								var response = potentialCommand.response;
								await twitchModuleInstance.action(this.parseString(sentChannel, user, response));
								break;
						}
						if (potentialCommand.afterEval !== undefined) eval(potentialCommand.afterEval);						
					}
				}
			});
		}

    }

    async shutdownModule() {
		await twitchModuleInstance.action("Test");
    }
}