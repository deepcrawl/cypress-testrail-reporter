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
class TestRail {
    constructor(options) {
        this.options = options;
        this.includeAll = true;
        this.caseIds = [];
        this.base = `${options.host}/index.php?/api/v2`;
    }
    getCases() {
        let url = `${this.base}/get_cases/${this.options.projectId}&suite_id=${this.options.suiteId}`;
        if (this.options.groupId) {
            url += `&section_id=${this.options.groupId}`;
        }
        if (this.options.filter) {
            url += `&filter=${this.options.filter}`;
        }
        return axios_1.default({
            method: 'get',
            url: url,
            headers: { 'Content-Type': 'application/json' },
            auth: {
                username: this.options.username,
                password: this.options.password
            }
        })
            .then(response => response.data.map(item => item.id))
            .catch(error => console.error(error));
    }
    createRun(name, description) {
        return __awaiter(this, void 0, void 0, function* () {
            if (this.options.includeAllInTestRun === false) {
                this.includeAll = false;
                this.caseIds = yield this.getCases();
            }
            console.log(chalk_1.default.magenta(`  _______        _   _____         _ `));
            console.log(chalk_1.default.magenta(` |__   __|      | | |  __ \\     (_) |`));
            console.log(chalk_1.default.magenta(`    | | ___  ___| |_| |__) |__ _ _| |`));
            console.log(chalk_1.default.magenta("    | |/ _ \\/ __| __|  _  /  _  | | |"));
            console.log(chalk_1.default.magenta(`    | |  __/\\__ \\ |_| | \\ \\ (_| | | |`));
            console.log(chalk_1.default.magenta(`    |_|\\___||___/\\__|_|  \\_\\__,_|_|_|`));
            axios_1.default({
                method: 'post',
                url: `${this.base}/add_run/${this.options.projectId}`,
                headers: { 'Content-Type': 'application/json' },
                auth: {
                    username: this.options.username,
                    password: this.options.password,
                },
                data: JSON.stringify({
                    suite_id: this.options.suiteId,
                    name,
                    description,
                    include_all: this.includeAll,
                    case_ids: this.caseIds
                }),
            })
                .then(response => {
                console.log(chalk_1.default.magenta.bold(`Testrail reporter: Run with id ${response.data.id} successfully created`));
                this.runId = response.data.id;
            })
                .catch(error => console.error(error));
        });
    }
    deleteRun() {
        return __awaiter(this, void 0, void 0, function* () {
            return axios_1.default({
                method: 'post',
                url: `${this.base}/delete_run/${this.runId}`,
                headers: { 'Content-Type': 'application/json' },
                auth: {
                    username: this.options.username,
                    password: this.options.password,
                },
            }).then(() => {
                console.log(chalk_1.default.magenta.bold(`Testrail reporter: Run successfully deleted`));
            }).catch(error => console.error(error));
        });
    }
    publishResults(results) {
        return axios_1.default({
            method: 'post',
            url: `${this.base}/add_results_for_cases/${this.runId}`,
            headers: { 'Content-Type': 'application/json' },
            auth: {
                username: this.options.username,
                password: this.options.password,
            },
            data: JSON.stringify({ results }),
        })
            .then(response => {
            console.log('\n', chalk_1.default.magenta.bold(`Testrail reporter: Outcome of following test cases saved in TestRail run with id:${this.runId}`));
            results.forEach(result => {
                console.log(chalk_1.default.magenta(`Test case ${result.case_id} with status id: ${result.status_id}`));
            });
            console.log('\n');
            return response;
        });
    }
    closeRun() {
        return axios_1.default({
            method: 'post',
            url: `${this.base}/close_run/${this.runId}`,
            headers: { 'Content-Type': 'application/json' },
            auth: {
                username: this.options.username,
                password: this.options.password,
            },
        })
            .then((response) => {
            console.log(chalk_1.default.magenta.bold(`Testrail reporter: Run with id ${this.runId} closed successfully`));
            return response;
        })
            .catch(error => console.error(error));
    }
}
exports.TestRail = TestRail;
//# sourceMappingURL=testrail.js.map