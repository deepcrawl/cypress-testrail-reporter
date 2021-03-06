"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getTestTitle = exports.containsCloseRunFlag = exports.containesNoReportFlag = exports.printCoolAscii = void 0;
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
    return noReportRegex.exec(title);
}
exports.containesNoReportFlag = containesNoReportFlag;
function containsCloseRunFlag(title) {
    const closeRunRegex = /#COMMAND:closeRun#/g;
    return closeRunRegex.exec(title);
}
exports.containsCloseRunFlag = containsCloseRunFlag;
function getTestTitle(title, parent) {
    const titleToUse = title.substring(title.length - 140, title.length);
    const parentTitleToUse = (parent === null || parent === void 0 ? void 0 : parent.title) ? parent === null || parent === void 0 ? void 0 : parent.title.substring(title.length - 80, title.length) : '';
    return ((parent === null || parent === void 0 ? void 0 : parent.title) ? parentTitleToUse + ' > ' : '') + titleToUse;
}
exports.getTestTitle = getTestTitle;
//# sourceMappingURL=utils.js.map