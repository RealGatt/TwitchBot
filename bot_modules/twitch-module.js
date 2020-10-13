'use strict';
import { botMain, botConfig } from "../index.js";
import { ModuleBase } from "./module-base.js";

import { ApiClient } from "twitch";
import {
    AccessToken,
    RefreshableAuthProvider,
    StaticAuthProvider
} from "twitch-auth";
import { ChatClient } from "twitch-chat-client";

const instance = this;

var chatClient;
var username;
var channel;
var connectTime;

export class TwitchModule extends ModuleBase {
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
                onRefresh: async({
                    accessToken,
                    refreshToken,
                    expiryDate
                }) => {
                    // do things with the new token data, e.g. save them in your database
                    botConfig.twitch.oauthToken = accessToken;
                    botConfig.twitch.refreshToken = refreshToken;
                    botConfig.twitch.expiryTimestamp = expiryDate === null ? null : expiryDate.getTime();
                    botMain.fs.writeFileSync("./config.json", JSON.stringify(botConfig, null, 4));
                    await this.bootModule();
                }
            }
        );

        chatClient = new ChatClient(authProvider, {
            channels: [channel]
        });
        await chatClient.connect().then(() => {

            if (chatClient.isConnected) console.log("Connected to Twitch Chat as " + chatClient.currentNick);
            else console.log("Not connected to Twitch Chat");

            chatClient.onMessage(async(sentChannel, user, msg) => {
                if (sentChannel == channel) {
                    if (msg.startsWith("!ping")) {
                        await this.action("Pong! @" + user);
                    }
                }
            });

            chatClient.onJoin(async(chnl) => {
                if (chnl == channel) {
                    connectTime = new Date();
                    await this.action(botConfig.twitch.connectedMessage);
                }
            });

        });

        console.log("Twitch Module Booted");
    }

    async sendMessage(msg) {
        chatClient.say(channel, "🤖  " + msg);
    }
    async action(msg) {
        chatClient.action(channel, "🤖  " + msg);
    }

    async shutdownModule() {
        console.log("Shutting down");
        await this.action(botConfig.twitch.disconnectingMessage);
    }
}