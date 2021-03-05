"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.containsCloseRunFlag = exports.containesNoReportFlag = exports.printCoolAscii = void 0;
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
function containesNoReportFlag(title) {
    const noReportRegex = /#COMMAND:noReport#/g;
    const a = noReportRegex.exec(title);
    console.log('title:', title, 'Found norRep:', a);
    return a;
}
exports.containesNoReportFlag = containesNoReportFlag;
function containsCloseRunFlag(title) {
    const closeRunRegex = /#COMMAND:closeRun#/g;
    const a = closeRunRegex.exec(title);
    console.log('title:', title, 'Found closeRun:', a);
    return a;
}
exports.containsCloseRunFlag = containsCloseRunFlag;
//# sourceMappingURL=utils.js.map