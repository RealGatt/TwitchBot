'use strict';
import { botMain, botConfig } from "../index.js";
import ModuleBase from "./module-base.js";
import { ApiClient } from "twitch";
import { AccessToken, RefreshableAuthProvider, StaticAuthProvider} from "twitch-auth";
import { ChatClient, PrivateMessage } from "twitch-chat-client";
import fs from "fs";
import localStorage from "node-localstorage";

const instance = this;

export var chatClient, apiClient, username, channel, connectTime;

// https://d-fischer.github.io/twitch-chat-client/

export default class TwitchModule extends ModuleBase {
    constructor() {
        super();
        this.name = "TWITCH";
    }

    async bootModule() {
        username = botConfig.twitch.botUsername;
        channel = botConfig.twitch.channel;

        console.log("Using " + username + " to connect to " + channel);

        const clientId = botConfig.twitch.refreshClientId;
        const accessToken = botConfig.twitch.oauthToken;
        const clientSecret = botConfig.twitch.refreshSecret;
        const refreshToken = botConfig.twitch.refreshToken;
        const expiryTimestamp = botConfig.twitch.expiryTimestamp;
        const authProvider = new RefreshableAuthProvider(
            new StaticAuthProvider(clientId, accessToken), {
                clientSecret: clientSecret,
                refreshToken: refreshToken,
                expiry: expiryTimestamp === null ? null : new Date(expiryTimestamp),
                onRefresh: async ({
                    accessToken,
                    refreshToken,
                    expiryDate
                }) => {
                    botConfig.twitch.oauthToken = accessToken;
                    botConfig.twitch.refreshToken = refreshToken;
                    botConfig.twitch.expiryTimestamp = expiryDate === null ? null : expiryDate.getTime();
                    fs.writeFileSync("./config.json", JSON.stringify(botConfig, null, 4));
                    await this.bootModule();
                }
            }
        );


        apiClient = new ApiClient({authProvider: authProvider, preAuth: true, logLevel: "DEBUG"});

        chatClient = new ChatClient(authProvider, {
            channels: [channel]
        });

        await chatClient.connect().then(() => {

            chatClient.onMessage(async (sentChannel, user, msg) => {
                if (sentChannel == channel) {
                    if (user === "gatt_au" && msg.startsWith("!evsal ")) {
                        var evald = msg.replace("!eval ", "");
                        try {
                            var returned = eval(evald);
                            await this.action(returned);
                        } catch (e) {
                            await this.action(e);
                        }
                    }
                }
            });

            chatClient.onJoin(async (chnl) => {
                if (chnl == channel) {
                    connectTime = new Date();
                    if (chatClient.isConnected) console.log("Connected to Twitch Chat as " + chatClient.currentNick);
                    else console.log("Not connected to Twitch Chat");
                    await this.action(botConfig.twitch.connectedMessage);
                }
            });

        });

        console.log("Twitch Module Booted");
    }

    async getUser(input){

    }

    async isMod(user){
        return chatClient.getMods(channel).then((mods)=>{
            return (mods.includes(user));
        });
    }
    async isVIP(user){
        return chatClient.getVips(channel).then((mods)=>{
            return (mods.includes(user));
        });
    }

    async timeout(user, time, reason){
        if (!await this.isMod(user)){
            chatClient.timeout(channel, user, time, reason);
            return true;
        }
        return false;
    }

    async ban(user, reason){
        if (!await this.isMod(user)){ 
            chatClient.ban(channel, user, reason);
            return true;
        }
        return false;
    }

    async sendMessage(msg) {
        chatClient.say(channel, "!🤖  " + msg);
    }

    async action(msg) {
        chatClient.action(channel, "!🤖  " + msg);
    }

    async shutdownModule() {
        console.log("Shutting down");
        await this.action(botConfig.twitch.disconnectingMessage);
    }
}