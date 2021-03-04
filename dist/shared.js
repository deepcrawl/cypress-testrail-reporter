"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.titleToCaseIds = void 0;
/**
 * Search for all applicable test cases
 * @param title
 * @returns {any}
 */
function titleToCaseIds(title) {
    let caseIds = [];
    let testCaseIdRegExp = /\bT?C(\d+)\b/g;
    let m;
    while ((m = testCaseIdRegExp.exec(title)) !== null) {
        let caseId = parseInt(m[1]);
        caseIds.push(caseId);
    }
    return caseIds;
}
exports.titleToCaseIds = titleToCaseIds;
//# sourceMappingURL=shared.js.map