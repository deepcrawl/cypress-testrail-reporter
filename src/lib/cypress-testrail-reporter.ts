import { reporters } from 'mocha';
import * as moment from 'moment';
import { TestRail } from './testrail';
import { Status } from './testrail.interface';
import { containsCloseRunFlag, getTestTitle } from './utils';
const Mocha = require('mocha');
var fs = require('fs');

// for more states please see https://mochajs.org/api/runner.js.html
const {
  EVENT_RUN_BEGIN,
  EVENT_RUN_END,
  EVENT_TEST_PENDING,
  EVENT_TEST_FAIL,
  EVENT_TEST_PASS,
  EVENT_TEST_BEGIN
} = Mocha.Runner.constants;

export class CypressTestRailReporter extends reporters.Spec {
  private testRail: TestRail;

  constructor(runner: any, options: any) {
    super(runner);

    let reporterOptions = options.reporterOptions;

    if (process.env.CYPRESS_TESTRAIL_REPORTER_PASSWORD) {
      reporterOptions.password = process.env.CYPRESS_TESTRAIL_REPORTER_PASSWORD;
    }

    this.testRail = new TestRail(reporterOptions);
    this.validateOptions(reporterOptions)

    runner.on(EVENT_RUN_BEGIN, async () => {
      const executionDateTime = moment().format('MMM Do YYYY, HH:mm (Z)');
      const name = `Automated test run ${executionDateTime}`;
      const description = 'For the Cypress run visit https://dashboard.cypress.io/#/projects/runs';
      fs.readFile(reporterOptions.runIdFileLocation, (err, data) => {
       if (data) {
        this.testRail.saveRunId(data);
       } else {
        return this.testRail.createRun(name, description);
       }
      });
     
    });

    runner.on(EVENT_TEST_PASS, async (test) => {
      return this.testRail.publishResult(
        getTestTitle(test.title, test.parent), 
        {
          status_id: Status.Passed,
          comment: `Execution time: ${test.duration}ms`,
          elapsed: `${test.duration/1000}s`
        }
      );
    });

    runner.on(EVENT_TEST_PENDING, async (test) => {
      return this.testRail.publishResult(
        getTestTitle(test.title, test.parent), 
        {
          status_id: Status.Untested,
          comment: `Execution time: ${test.duration}ms`,
          elapsed: `${test.duration/1000}s`
        }
      );
    });

    runner.on(EVENT_TEST_BEGIN, async (test) => {
      await this.evaluateGlobalCommandsFromTitle(test) ;
    })

    runner.on(EVENT_TEST_FAIL, async (test) => {
      return this.testRail.publishResult(
        getTestTitle(test.title, test.parent), 
        {
          status_id: Status.Failed,
          comment: `${test.err.message}`,
          elapsed: `${test.duration/1000}s`
        }
      );
    });

    runner.on(EVENT_RUN_END, async () => {
      // await this.testRail.closeRun(); // do we want to close runs?
    });
  }

  private async evaluateGlobalCommandsFromTitle(test: any) {
    containsCloseRunFlag(test.title) && await this.testRail.closeRun();
  }

  private validateOptions(reporterOptions) {
    this.validate(reporterOptions, 'host');
    this.validate(reporterOptions, 'username');
    this.validate(reporterOptions, 'password');
    this.validate(reporterOptions, 'projectId');
    this.validate(reporterOptions, 'suiteId');
    this.validate(reporterOptions, 'runIdFileLocation');
  }

  private validate(options, name: string) {
    if (options == null) {
      throw new Error('Missing reporterOptions in cypress.json');
    }
    if (options[name] == null) {
      throw new Error(`Missing ${name} value. Please update reporterOptions in cypress.json`);
    }
  }
}
