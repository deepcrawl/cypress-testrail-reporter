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
const utils_1 = require("./utils");
var fs = require('fs');
class TestRail {
    constructor(options) {
        this.options = options;
        this.cases = [];
        this.sections = [];
        this.base = `${options.host}/index.php?/api/v2`;
    }
    saveRunId(id) {
        this.runId = id;
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
            return this.makeAxiosRequest('get', `${this.base}/get_sections/${this.options.projectId}&suite_id=${this.options.suiteId}`)
                .then((response) => response.data)
                .catch(error => console.error(error));
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
            if (this.options.groupId) {
                url += `&section_id=${this.options.groupId}`;
            }
            if (this.options.filter) {
                url += `&filter=${this.options.filter}`;
            }
            return this.makeAxiosRequest('get', url)
                .then((response) => response.data)
                .catch(error => console.error(error));
        });
    }
    loadAllTestCases() {
        return __awaiter(this, void 0, void 0, function* () {
            this.cases = yield this.getCases();
        });
    }
    createRun(name, description) {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.loadAllTestCases();
            yield this.loadAllSections();
            utils_1.printCoolAscii();
            return this.makeAxiosRequest('post', `${this.base}/add_run/${this.options.projectId}`, JSON.stringify({
                suite_id: this.options.suiteId,
                name,
                description,
            }))
                .then(response => {
                this.runId = response.data.id;
                fs.writeFile(this.options.runIdFileLocation, this.runId, function (err) {
                    if (err)
                        throw err;
                    console.log('Saved!');
                });
                console.log(chalk_1.default.magenta.bold(`Testrail reporter: Run with id ${this.runId} successfully created`));
            })
                .catch(error => console.error(error));
        });
    }
    deleteRun() {
        return __awaiter(this, void 0, void 0, function* () {
            return this.makeAxiosRequest('post', `${this.base}/delete_run/${this.runId}`)
                .then(() => {
                console.log(chalk_1.default.magenta.bold(`Testrail reporter: Run successfully deleted`));
            })
                .catch(error => console.error(error));
        });
    }
    createNewTestCase(title) {
        return __awaiter(this, void 0, void 0, function* () {
            return this.makeAxiosRequest('post', `${this.base}/add_case/${this.sections[0].id}`, JSON.stringify({ title, custom_automation_type: 0 }))
                .then((res) => res.data)
                .catch(error => console.error(error));
        });
    }
    publishResult(testTitle, result) {
        return __awaiter(this, void 0, void 0, function* () {
            const testAlreadyHasTestCase = this.cases.filter((c) => {
                c.title === testTitle;
            });
            let newCase;
            if (testAlreadyHasTestCase.length <= 0) {
                newCase = yield this.createNewTestCase(testTitle);
            }
            const caseId = testAlreadyHasTestCase.length <= 0 ? testAlreadyHasTestCase[0].id : newCase.id;
            return this.makeAxiosRequest('post', `${this.base}/add_result_for_case/${this.runId}`, JSON.stringify(Object.assign(Object.assign({}, result), { caseId: caseId })))
                .then(response => {
                console.log('\n', chalk_1.default.magenta.bold(`Testrail reporter: Outcome of following test cases saved in TestRail run with id:${this.runId}`));
                console.log(chalk_1.default.magenta(`Test case ${caseId} with status id: ${result.status_id}`));
                console.log('\n');
                return response;
            });
        });
    }
    closeRun() {
        return this.makeAxiosRequest('post', `${this.base}/close_run/${this.runId}`)
            .then((response) => {
            console.log(chalk_1.default.magenta.bold(`Testrail reporter: Run with id ${this.runId} closed successfully`));
            return response;
        })
            .catch(error => console.error(error));
    }
}
exports.TestRail = TestRail;
//# sourceMappingURL=testrail.js.map