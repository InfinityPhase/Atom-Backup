"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// To allow using dependency injection, but avoid having to type a lot of boilerplate, we have the
// individual command files register themselves in the below map. When the package is initializing,
// the constructors are passed the deps and return the actual commands handlers.
const commands = [];
function addCommand(selector, command, desc) {
    commands.push({ selector, command, desc });
}
exports.addCommand = addCommand;
function getCommands() {
    return commands;
}
exports.getCommands = getCommands;
//# sourceMappingURL=registry.js.map