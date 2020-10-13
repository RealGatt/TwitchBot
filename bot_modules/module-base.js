'use strict';

export class ModuleBase {
    constructor(name) {
        this.name = name;
    }
    async bootModule() {
        console.log("Something has called bootModule");
    }
    async shutdownModule() {
        console.log("Something has called shutdownModule");
    }
}