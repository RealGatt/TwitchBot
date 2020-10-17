'use strict';
import {
	botMain,
	botConfig
} from "../index.js";
import ModuleBase from "./module-base.js";
import fs from "fs";

let actionQueue = new Map(); // [ActionID, Array]
let actionQueueRunning = new Map(); // [ActionID, Boolean]
let START_QUEUE_IMMEDIATELY = true;

export default class DiscordModule extends ModuleBase {
	constructor() {
		super();
		this.name = "QUEUE";
	}


	loadQueue() {
		// read current queue contents
		console.log("Loading the Redemption Queue");
		fs.readFile("./redemptionQueue.json", "utf8", (err, data) => {
			if (err !== null) console.log(err);

			// if theres data to be read, parse it through to the object
			if (data) {
				actionQueue = JSON.parse(data);
				console.log("Loaded actionQueue from JSON data");
				//console.log(actionQueue);
			} else {
				// otherwise make a new default map aobject
				actionQueue = new Map();
				console.log("Created new empty actionQueue");
				//console.log(actionQueue);
			}

			// debugging stuff

			this.saveQueue();

			if (START_QUEUE_IMMEDIATELY) this.parseQueue();
		});
	}

	saveQueue() {
		let stringData = JSON.stringify(actionQueue);
		fs.writeFileSync("./redemptionQueue.json", stringData, function (err) {
			console.log(err);
		});
	}

	parseQueue() {
		// grab the object keys and loop
		Object.keys(actionQueue).forEach((actionKey) => {
			this.doQueue(actionKey);
		});
	}

	addToQueue(redeemableKey, message) {
		// message.rewardName, message
		let queue = [];
		if (redeemableKey in actionQueue) queue = actionQueue[redeemableKey]; // get the current array

		console.log("Adding a " + redeemableKey);
		// Defining variables from the message thing so it parses through!!
		let superCoolMessage = {
			message: message.message,
			userName: message.userName,
			rewardName: message.rewardName,
			_data: message._data,
		};

		queue.push(superCoolMessage);

		actionQueue[redeemableKey] = queue;
		this.saveQueue();

		this.doQueue(redeemableKey);
	}

	addToQueue(redeemableKey, message, callback) {
		// message.rewardName, message
		let queue = [];
		if (redeemableKey in actionQueue) queue = actionQueue[redeemableKey]; // get the current array

		console.log("Adding a " + redeemableKey);
		// Defining variables from the message thing so it parses through!!
		let superCoolMessage = {
			message: message.message,
			userName: message.userName,
			rewardName: message.rewardName,
			_data: message._data,
			callback: callback
		};

		queue.push(superCoolMessage);

		actionQueue[redeemableKey] = queue;
		this.saveQueue();

		this.doQueue(redeemableKey);
	}

	finishRedeemable(redeemableKey) {
		setTimeout(function () {
			actionQueueRunning[redeemableKey] = false;
			this.doQueue(redeemableKey);
		}, 1000);
	}

	//queue function
	doQueue(redeemableKey) {
		if (redeemableKey == "default") return;


		if (!(redeemableKey in actionQueueRunning)) actionQueueRunning[redeemableKey] = false;

		if (actionQueueRunning[redeemableKey]) return; // don't bother

		actionQueueRunning[redeemableKey] = true;

		let queue = [];
		if (redeemableKey in actionQueue) queue = actionQueue[redeemableKey]; // get the current array


		let message = queue.shift();

		if (message === undefined) {
			actionQueueRunning[redeemableKey] = false;
			return;
		}

		actionQueue[redeemableKey] = queue;

		this.saveQueue();

		if (message.callback !== undefined){
			message.callback();
			return;
		}

		switch (redeemableKey) {
			case redeemableKey.startsWith("Sounds-") ? redeemableKey:
				"x" :
				var soundmessage = redeemableKey.replace("Sounds-", "");
				break;

			case redeemableKey.startsWith("Video-") ? redeemableKey:
				"x" :
				var videomessage = redeemableKey.replace("Video-", "");
				break;
		}
	}

	async bootModule() {
		console.log("Queue Module Booted");
		this.loadQueue();
	}

	async shutdownModule() {
		console.log("Queue Module Shutdown");
	}
}