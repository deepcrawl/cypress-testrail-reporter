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
const axios = require('axios');
const chalk = require('chalk');
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
        return axios({
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
            axios({
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
                console.log(`Testrail run id ${response.data.id} successfully created.`);
                this.runId = response.data.id;
            })
                .catch(error => console.error(error));
        });
    }
    deleteRun() {
        axios({
            method: 'post',
            url: `${this.base}/delete_run/${this.runId}`,
            headers: { 'Content-Type': 'application/json' },
            auth: {
                username: this.options.username,
                password: this.options.password,
            },
        }).then(() => {
            console.log(`Testrail run successfully deleted.`);
        }).catch(error => console.error(error));
    }
    publishResults(results) {
        return axios({
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
            const consoleMessages = results.map(result => `${result.case_id} with status id: ${result.status_id}`);
            console.log('\n', chalk.magenta.underline.bold(`TestRail Reporter wrote outcome for:`), consoleMessages.join('\n'), '\n');
        })
            .catch(error => console.error(error));
    }
    closeRun() {
        axios({
            method: 'post',
            url: `${this.base}/close_run/${this.runId}`,
            headers: { 'Content-Type': 'application/json' },
            auth: {
                username: this.options.username,
                password: this.options.password,
            },
        })
            .then(() => console.log('- Test run closed successfully'))
            .catch(error => console.error(error));
    }
}
exports.TestRail = TestRail;
//# sourceMappingURL=testrail.js.map