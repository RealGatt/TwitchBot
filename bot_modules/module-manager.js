const modules = [];

export default class ModuleManager {

    registerModule(module) {
        modules.push(module);
        console.log("Registered module " + module.name.toUpperCase());
    }

    getModuleByName(name) {
        return modules.filter((mod) => mod.name.toUpperCase() === name.toUpperCase())[0]
    }

    getModules() {
        return modules;
    }

}