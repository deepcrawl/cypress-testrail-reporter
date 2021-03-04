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
exports.CypressTestRailReporter = void 0;
const mocha_1 = require("mocha");
const moment = require("moment");
const testrail_1 = require("./testrail");
const shared_1 = require("./shared");
const testrail_interface_1 = require("./testrail.interface");
var fs = require("fs");
class CypressTestRailReporter extends mocha_1.reporters.Spec {
    constructor(runner, options) {
        super(runner);
        let reporterOptions = options.reporterOptions;
        if (process.env.CYPRESS_TESTRAIL_REPORTER_PASSWORD) {
            reporterOptions.password = process.env.CYPRESS_TESTRAIL_REPORTER_PASSWORD;
        }
        this.testRail = new testrail_1.TestRail(reporterOptions);
        this.validate(reporterOptions, 'host');
        this.validate(reporterOptions, 'username');
        this.validate(reporterOptions, 'password');
        this.validate(reporterOptions, 'projectId');
        this.validate(reporterOptions, 'suiteId');
        function writeRunId(data) {
            fs.writeFile("runId.txt", data, (err) => {
                if (err)
                    console.log(err);
                console.log("Successfully Written to File.");
            });
        }
        function manageRunId() {
            return __awaiter(this, void 0, void 0, function* () {
                fs.readFile("temp.txt", "utf-8", (err, data) => {
                    if (data) {
                        this.testRail.writeRunId(Number(data));
                    }
                    if (err) {
                        const executionDateTime = moment().format('MMM Do YYYY, HH:mm (Z)');
                        const name = `${reporterOptions.runName || 'Automated test run'} ${executionDateTime}`;
                        const description = 'For the Cypress run visit https://dashboard.cypress.io/#/projects/runs';
                        this.testRail.createRun(name, description);
                    }
                });
            });
        }
        runner.on('start', () => __awaiter(this, void 0, void 0, function* () {
            // const executionDateTime = moment().format('MMM Do YYYY, HH:mm (Z)');
            // const name = `${reporterOptions.runName || 'Automated test run'} ${executionDateTime}`;
            // const description = 'For the Cypress run visit https://dashboard.cypress.io/#/projects/runs';
            // return this.testRail.createRun(name, description);
            manageRunId();
        }));
        runner.on('pass', (test) => __awaiter(this, void 0, void 0, function* () {
            const caseIds = shared_1.titleToCaseIds(test.title);
            if (caseIds.length > 0) {
                const results = caseIds.map(caseId => {
                    return {
                        case_id: caseId,
                        status_id: testrail_interface_1.Status.Passed,
                        comment: `Execution time: ${test.duration}ms`,
                        elapsed: `${test.duration / 1000}s`
                    };
                });
                return this.testRail.publishResults(results);
            }
        }));
        runner.on('pending', (test) => __awaiter(this, void 0, void 0, function* () {
            const caseIds = shared_1.titleToCaseIds(test.title);
            if (caseIds.length > 0) {
                const results = caseIds.map(caseId => {
                    return {
                        case_id: caseId,
                        status_id: testrail_interface_1.Status.Untested,
                        comment: `Execution time: ${test.duration}ms`,
                        elapsed: `${test.duration / 1000}s`
                    };
                });
                return this.testRail.publishResults(results);
            }
        }));
        runner.on('fail', (test) => __awaiter(this, void 0, void 0, function* () {
            const caseIds = shared_1.titleToCaseIds(test.title);
            if (caseIds.length > 0) {
                const results = caseIds.map(caseId => {
                    return {
                        case_id: caseId,
                        status_id: testrail_interface_1.Status.Failed,
                        comment: `${test.err.message}`,
                        elapsed: `${test.duration / 1000}s`
                    };
                });
                return this.testRail.publishResults(results);
            }
        }));
        runner.on('end', () => __awaiter(this, void 0, void 0, function* () {
            // await this.testRail.closeRun(); // do we want to close runs? 
        }));
    }
    validate(options, name) {
        if (options == null) {
            throw new Error('Missing reporterOptions in cypress.json');
        }
        if (options[name] == null) {
            throw new Error(`Missing ${name} value. Please update reporterOptions in cypress.json`);
        }
    }
}
exports.CypressTestRailReporter = CypressTestRailReporter;
//# sourceMappingURL=cypress-testrail-reporter.js.map