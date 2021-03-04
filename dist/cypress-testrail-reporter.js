"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CypressTestRailReporter = void 0;
const mocha_1 = require("mocha");
const moment = require("moment");
const testrail_1 = require("./testrail");
const shared_1 = require("./shared");
const testrail_interface_1 = require("./testrail.interface");
class CypressTestRailReporter extends mocha_1.reporters.Spec {
    constructor(runner, options) {
        super(runner);
        this.resultsPushPromises = [];
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
        runner.on('start', () => {
            const executionDateTime = moment().format('MMM Do YYYY, HH:mm (Z)');
            const name = `${reporterOptions.runName || 'Automated test run'} ${executionDateTime}`;
            const description = 'For the Cypress run visit https://dashboard.cypress.io/#/projects/runs';
            this.testRail.createRun(name, description);
        });
        runner.on('pass', test => {
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
                this.resultsPushPromises.push(this.testRail.publishResults(results));
                ;
            }
        });
        runner.on('fail', test => {
            const caseIds = shared_1.titleToCaseIds(test.title);
            if (caseIds.length > 0) {
                const results = caseIds.map(caseId => {
                    return {
                        case_id: caseId,
                        status_id: testrail_interface_1.Status.Failed,
                        comment: `${test.err.message}`,
                    };
                });
                this.resultsPushPromises.push(this.testRail.publishResults(results));
                ;
            }
        });
        runner.on('end', () => {
            // highly unoptimal :D but sync :D
            function wait(ms) {
                var start = Date.now(), now = start;
                while (now - start < ms) {
                    now = Date.now();
                }
            }
            console.log('\n', 'Synchro started');
            Promise.all(this.resultsPushPromises).then(() => {
                console.log('all saved correctly');
            }, (errors) => {
                console.log('errors form test rail sync:', JSON.stringify(errors));
            });
            wait(1000);
            console.log('\n', '.');
            wait(1000);
            console.log('\n', '.');
            wait(1000);
            console.log('\n', '.');
            wait(1000);
            this.testRail.closeRun();
            console.log('\n', '.');
            wait(1000);
            console.log('\n', 'Synchro Finished');
            // NO NEED as we are progressively update the results
            // if (this.results.length == 0) {
            //   console.log('\n', chalk.magenta.underline.bold('(TestRail Reporter)'));
            //   console.warn(
            //     '\n',
            //     'No testcases were matched. Ensure that your tests are declared correctly and matches Cxxx',
            //     '\n'
            //   );
            //   this.testRail.deleteRun();
            //   return;
            // }
            // // publish test cases results & close the run
            // this.testRail.publishResults(this.results)
            //   .then(() => this.testRail.closeRun());
        });
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