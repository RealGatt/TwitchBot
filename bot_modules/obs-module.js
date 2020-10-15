'use strict';
import { botMain, botConfig } from "../index.js";
import ModuleBase from "./module-base.js";
import OBSWebSocket from "obs-websocket-js";

export var obs = new OBSWebSocket();

export default class OBSModule extends ModuleBase {
    constructor() {
        super();
        this.name = "OBS";
    }

    async hideItem(scene, source){
        obs.send('SetSceneItemRender', {
            'scene-name': scene,
            source: source,
            render: false
        });
    }
    async showItem(scene, source){
        obs.send('SetSceneItemRender', {
            'scene-name': scene,
            source: source,
            render: true
        });
    }

    async bootModule() {
        console.log("OBS Module Booted");
        obs.connect({ address: botConfig.obsWebSocket.address + ":" + botConfig.obsWebSocket.port, password: botConfig.obsWebSocket.password })
        .then(()=>{
            console.log("Connected to OBS");
            obs.send('SetTextGDIPlusProperties', 
                {
                    'scene-name': "-- Alert Box Overlay", 
                    source: "BOT CONNECTION", 
                    text: "CONNECTED"
                }
            ).then(()=>this.hideItem("-- Alert Box Overlay", "BOT CONNECTION")).catch((e)=>console.log(e.error));
        });
    }

    async shutdownModule() {
        console.log("OBS Module Shutdown");
        obs.send('SetTextGDIPlusProperties', 
            {
                'scene-name': "-- Alert Box Overlay", 
                source: "BOT CONNECTION", 
                text: "BOT DISCONNECTED"
            }
        );this.showItem("-- Alert Box Overlay", "BOT CONNECTION")
    }
}