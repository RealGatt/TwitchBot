'use strict';
import {
	botMain,
	botConfig,
	moduleManager
} from "../index.js";
import ModuleBase from "./module-base.js";
import {
	chatClient,
	apiClient,
	username,
	channel,
	connectTime
} from "./twitch-module.js";
import {
	PrivateMessage
} from "twitch-chat-client";
import {
	obs
} from "./obs-module.js";
import fs from "fs";
import asyncEval from "async-eval";

const instance = this;
var twitchModuleInstance, obsModuleInstance, queueModuleInstance;
var commands;

export default class TwitchCommandModule extends ModuleBase {
	constructor() {
		super();
		this.name = "TWITCHCOMMANDS";
	}

	parseString(channel, user, message) {
		message = message.replace("$USER", user);
		message = message.replace("$CHANNEL", channel);
		return message;
	}

	loadCommands() {
		commands = JSON.parse(fs.readFileSync("./twitchCommands.json")).commands;
		console.log("Loaded " + commands.length + " commands.");
	}

	secondsToDuration(seconds) {
		var numyears = Math.floor(seconds / 31536000);
		var numdays = Math.floor((seconds % 31536000) / 86400);
		var numhours = Math.floor(((seconds % 31536000) % 86400) / 3600);
		var numminutes = Math.floor((((seconds % 31536000) % 86400) % 3600) / 60);
		var numseconds = (((seconds % 31536000) % 86400) % 3600) % 60;
		return ((numyears > 0) ? Math.round(numyears) + " years, " : "") + ((numdays > 0) ? Math.round(numdays) + " days, " : "" )+ Math.round(numhours) + " hours, " + Math.round(numminutes) + " minutes and " + Math.round(numseconds) + " seconds!";

	}

	async bootModule() {
		if (chatClient === undefined || !chatClient.isConnected || !chatClient.currentNick) {
			console.log("ChatClient isn't connected. Trying again in 1 second");
			const thisInstance = this;
			setTimeout(async function () {
				await thisInstance.bootModule();
			}, 1000);
		} else {
			twitchModuleInstance = moduleManager.getModuleByName("TWITCH");
			obsModuleInstance = moduleManager.getModuleByName("OBS");
			queueModuleInstance = moduleManager.getModuleByName("QUEUE");
			console.log("ChatClient is connected as " + chatClient.currentNick);
			this.loadCommands();

			//await twitchModuleInstance.action("Command Handler is ready to go.");
			chatClient.onMessage(async (sentChannel, user, msg, msgTPM) => {
				var userId = msgTPM.userInfo.userId;
				var channelId = msgTPM.channelId;
				var isCheer = msgTPM.isCheer;
				var bits = msgTPM.totalBits;
				if (sentChannel === channel) {
					if (msg.startsWith(botConfig.twitch.commandPrefix)) {
						var potentialCommand = commands.filter(cmd => msg.startsWith(botConfig.twitch.commandPrefix + cmd.command))[0];
						if (potentialCommand === undefined || potentialCommand === null) return;
						if (potentialCommand.modOnly && user !== "gatt_au") return;
						if (potentialCommand.gattOnly && user !== "gatt_au") return;
						switch (potentialCommand.responseType) {
							case "eval":
								var evalD = eval(potentialCommand.response);
								if (evalD === "nothing") return;
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
		//await twitchModuleInstance.action("Test");
	}
}