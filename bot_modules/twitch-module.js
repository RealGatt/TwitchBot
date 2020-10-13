'use strict';
const index = require("../index.js");
const ModuleBase = require("./ModuleBase.js");
const {
    ApiClient
} = require('twitch');
const {
    AccessToken,
    RefreshableAuthProvider,
    StaticAuthProvider
} = require('twitch-auth');
const {
    ChatClient
} = require('twitch-chat-client');

const instance = this;

var chatClient;
var username;
var channel;
var connectTime;

class TwitchModule extends ModuleBase {
    async bootModule() {
        username = index.config.twitch.botUsername;
        channel = index.config.twitch.channel;

        console.log("Using " + username + " to connect to " + channel);

        const clientId = index.config.twitch.refreshClientId;
        const accessToken = index.config.twitch.oauthToken;
        const clientSecret = index.config.twitch.refreshSecret;
        const refreshToken = index.config.twitch.refreshToken;
        const expiryTimestamp = index.config.twitch.expiryTimestamp;
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
                    index.config.twitch.oauthToken = accessToken;
                    index.config.twitch.refreshToken = refreshToken;
                    index.config.twitch.expiryTimestamp = expiryDate === null ? null : expiryDate.getTime();
                    index.fs.writeFileSync("./config.json", JSON.stringify(index.config, null, 4));
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
                    await this.action(index.config.twitch.connectedMessage);
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
        await this.action(index.config.twitch.disconnectingMessage);
    }
}

module.exports = TwitchModule;