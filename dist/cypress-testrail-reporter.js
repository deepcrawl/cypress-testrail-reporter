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
const testrail_interface_1 = require("./testrail.interface");
const utils_1 = require("./utils");
const Mocha = require('mocha');
var fs = require('fs');
// for more states please see https://mochajs.org/api/runner.js.html
const { EVENT_RUN_BEGIN, EVENT_RUN_END, EVENT_TEST_PENDING, EVENT_TEST_FAIL, EVENT_TEST_PASS, EVENT_TEST_BEGIN } = Mocha.Runner.constants;
class CypressTestRailReporter extends mocha_1.reporters.Spec {
    constructor(runner, options) {
        super(runner);
        let reporterOptions = options.reporterOptions;
        if (process.env.CYPRESS_TESTRAIL_REPORTER_PASSWORD) {
            reporterOptions.password = process.env.CYPRESS_TESTRAIL_REPORTER_PASSWORD;
        }
        this.testRail = new testrail_1.TestRail(reporterOptions);
        this.validateOptions(reporterOptions);
        runner.on(EVENT_RUN_BEGIN, () => __awaiter(this, void 0, void 0, function* () {
            const executionDateTime = moment().format('MMM Do YYYY, HH:mm (Z)');
            const name = `Automated test run ${executionDateTime}`;
            const description = 'For the Cypress run visit https://dashboard.cypress.io/#/projects/runs';
            fs.readFile(reporterOptions.runIdFileLocation, (err, data) => {
                if (data) {
                    this.testRail.saveRunId(data);
                }
                else {
                    return this.testRail.createRun(name, description);
                }
            });
        }));
        runner.on(EVENT_TEST_PASS, (test) => __awaiter(this, void 0, void 0, function* () {
            return this.testRail.publishResult(utils_1.getTestTitle(test.title, test.parent), {
                status_id: testrail_interface_1.Status.Passed,
                comment: `Execution time: ${test.duration}ms`,
                elapsed: `${test.duration / 1000}s`
            });
        }));
        runner.on(EVENT_TEST_PENDING, (test) => __awaiter(this, void 0, void 0, function* () {
            return this.testRail.publishResult(utils_1.getTestTitle(test.title, test.parent), {
                status_id: testrail_interface_1.Status.Untested,
                comment: `Execution time: ${test.duration}ms`,
                elapsed: `${test.duration / 1000}s`
            });
        }));
        runner.on(EVENT_TEST_BEGIN, (test) => __awaiter(this, void 0, void 0, function* () {
            yield this.evaluateGlobalCommandsFromTitle(test);
        }));
        runner.on(EVENT_TEST_FAIL, (test) => __awaiter(this, void 0, void 0, function* () {
            return this.testRail.publishResult(utils_1.getTestTitle(test.title, test.parent), {
                status_id: testrail_interface_1.Status.Failed,
                comment: `${test.err.message}`,
                elapsed: `${test.duration / 1000}s`
            });
        }));
        runner.on(EVENT_RUN_END, () => __awaiter(this, void 0, void 0, function* () {
            // await this.testRail.closeRun(); // do we want to close runs?
        }));
    }
    evaluateGlobalCommandsFromTitle(test) {
        return __awaiter(this, void 0, void 0, function* () {
            utils_1.containsCloseRunFlag(test.title) && (yield this.testRail.closeRun());
        });
    }
    validateOptions(reporterOptions) {
        this.validate(reporterOptions, 'host');
        this.validate(reporterOptions, 'username');
        this.validate(reporterOptions, 'password');
        this.validate(reporterOptions, 'projectId');
        this.validate(reporterOptions, 'suiteId');
        this.validate(reporterOptions, 'runIdFileLocation');
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