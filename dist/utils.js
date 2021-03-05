"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.printCoolAscii = void 0;
const chalk_1 = require("chalk");
function printCoolAscii() {
    console.log(chalk_1.default.magenta(`  _______        _   _____         _ `));
    console.log(chalk_1.default.magenta(` |__   __|      | | |  __ \\     (_) |`));
    console.log(chalk_1.default.magenta(`    | | ___  ___| |_| |__) |__ _ _| |`));
    console.log(chalk_1.default.magenta("    | |/ _ \\/ __| __|  _  /  _  | | |"));
    console.log(chalk_1.default.magenta(`    | |  __/\\__ \\ |_| | \\ \\ (_| | | |`));
    console.log(chalk_1.default.magenta(`    |_|\\___||___/\\__|_|  \\_\\__,_|_|_|`));
}
exports.printCoolAscii = printCoolAscii;
//# sourceMappingURL=utils.js.map