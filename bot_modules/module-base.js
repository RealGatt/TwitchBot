'use strict';

export default class ModuleBase {
    constructor() {
        this.name = "SETME";
    }
    async bootModule() {
        console.log("Something has called bootModule");
    }
    async shutdownModule() {
        console.log("Something has called shutdownModule");
    }
}