"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.TestRail = void 0;
const axios_1 = require("axios");
const chalk_1 = require("chalk");
const testrail_interface_1 = require("./testrail.interface");
const utils_1 = require("./utils");
var fs = require('fs');
class TestRail {
    constructor(options) {
        this.options = options;
        this.cases = [];
        this.sections = [];
        this.statuses = [];
        this.base = `${options.host}/index.php?/api/v2`;
    }
    initialize() {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.loadAllTestCases();
            yield this.loadAllSections();
        });
    }
    saveRunId(id) {
        return __awaiter(this, void 0, void 0, function* () {
            this.runId = id;
            yield this.initialize();
        });
    }
    getStatuses() {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const response = yield this.makeAxiosRequest('get', `${this.base}/get_statuses`);
                return response.data;
            }
            catch (e) {
                console.error(e);
            }
        });
    }
    loadStatuses() {
        return __awaiter(this, void 0, void 0, function* () {
            this.statuses = yield this.getStatuses();
        });
    }
    getRequestHeader() {
        return { 'Content-Type': 'application/json' };
    }
    getRequestAuth() {
        return {
            username: this.options.username,
            password: this.options.password,
        };
    }
    makeAxiosRequest(method, url, data) {
        return __awaiter(this, void 0, void 0, function* () {
            return axios_1.default({
                method: method,
                url: url,
                headers: this.getRequestHeader(),
                auth: this.getRequestAuth(),
                data: data
            });
        });
    }
    getSections() {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const response = yield this.makeAxiosRequest('get', `${this.base}/get_sections/${this.options.projectId}&suite_id=${this.options.suiteId}`);
                return response.data;
            }
            catch (e) {
                console.error(e);
            }
        });
    }
    loadAllSections() {
        return __awaiter(this, void 0, void 0, function* () {
            this.sections = yield this.getSections();
        });
    }
    getCases() {
        return __awaiter(this, void 0, void 0, function* () {
            let url = `${this.base}/get_cases/${this.options.projectId}&suite_id=${this.options.suiteId}`;
            url = this.options.groupId ? url + `&section_id=${this.options.groupId}` : url;
            url = this.options.filter ? url + `&filter=${this.options.filter}` : url;
            try {
                const response = yield this.makeAxiosRequest('get', url);
                return response.data;
            }
            catch (e) {
                console.error(e);
            }
        });
    }
    loadAllTestCases() {
        return __awaiter(this, void 0, void 0, function* () {
            this.cases = yield this.getCases();
        });
    }
    createRun(name, description) {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.initialize();
            utils_1.printCoolAscii();
            try {
                const response = yield this.makeAxiosRequest('post', `${this.base}/add_run/${this.options.projectId}`, JSON.stringify({
                    suite_id: this.options.suiteId,
                    name,
                    description,
                }));
                this.runId = response.data.id;
                fs.writeFile(this.options.runIdFileLocation, this.runId, (err) => {
                    if (err)
                        throw err;
                    console.log(chalk_1.default.magenta.bold(`Testrail reporter: File ${this.options.runIdFileLocation} created with id: ${this.runId}`));
                });
                console.log(chalk_1.default.magenta.bold(`Testrail reporter: Run with id ${this.runId} successfully created`));
            }
            catch (e) {
                console.error(e);
            }
        });
    }
    deleteRun() {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                yield this.makeAxiosRequest('post', `${this.base}/delete_run/${this.runId}`);
            }
            catch (e) {
                console.error(e);
            }
            console.log(chalk_1.default.magenta.bold(`Testrail reporter: Run successfully deleted`));
        });
    }
    createNewTestCase(title) {
        return __awaiter(this, void 0, void 0, function* () {
            if (this.sections.length <= 0) {
                yield this.loadAllSections();
            }
            try {
                const res = yield this.makeAxiosRequest('post', `${this.base}/add_case/${this.sections[0].id}`, JSON.stringify({ title, custom_automation_type: 0 }));
                return res.data;
            }
            catch (e) {
                console.error(e);
            }
        });
    }
    publishResult(testTitle, result) {
        return __awaiter(this, void 0, void 0, function* () {
            const resultToPush = Object.assign({}, result);
            if (utils_1.containesNoReportFlag(testTitle))
                return;
            if (this.cases.length <= 0) {
                yield this.loadAllTestCases();
            }
            const testAlreadyHasTestCase = this.cases.filter((c) => c.title === testTitle);
            let newCase;
            if (testAlreadyHasTestCase.length <= 0) {
                newCase = yield this.createNewTestCase(testTitle);
                console.log('\n', chalk_1.default.magenta.bold(`Testrail reporter: Created a new test case: ${testTitle} with case id: ${newCase.id}`));
            }
            const caseId = testAlreadyHasTestCase.length > 0 ? testAlreadyHasTestCase[0].id : newCase.id;
            if (this.isStatusCustomStatus(resultToPush.status_id) && this.statuses.length <= 0) {
                yield this.loadStatuses();
                const customStatusId = this.getCustomStatus(resultToPush.status_id);
                if (customStatusId !== null) {
                    resultToPush.status_id = customStatusId;
                }
            }
            try {
                const response = yield this.makeAxiosRequest('post', `${this.base}/add_result_for_case/${this.runId}/${caseId}`, JSON.stringify(Object.assign({}, resultToPush)));
                console.log('\n', chalk_1.default.magenta.bold(`Testrail reporter: Outcome of following test cases saved in TestRail run with id:${this.runId}`));
                console.log(chalk_1.default.magenta(`Test case ${caseId} with status id: ${resultToPush.status_id}`));
                console.log('\n');
                return response;
            }
            catch (e) {
                console.error(e);
            }
        });
    }
    closeRun() {
        return __awaiter(this, void 0, void 0, function* () {
            console.log(chalk_1.default.magenta.bold(`Testrail reporter: Run with id ${this.runId} will be closed`));
            try {
                const response = yield this.makeAxiosRequest('post', `${this.base}/close_run/${this.runId}`);
                console.log(chalk_1.default.magenta.bold(`Testrail reporter: Run with id ${this.runId} closed successfully`));
                return response;
            }
            catch (e) {
                console.error(e);
            }
        });
    }
    isStatusCustomStatus(status) {
        return status === testrail_interface_1.CustomStatus.Skipped;
    }
    getCustomStatus(customStatus) {
        const possibleSkippedStatuses = this.statuses.filter((status) => {
            status.label === customStatus;
        });
        return possibleSkippedStatuses.length >= 0 ? possibleSkippedStatuses[0].id : null;
    }
}
exports.TestRail = TestRail;
//# sourceMappingURL=testrail.js.map