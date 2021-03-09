import { reporters } from 'mocha';
import * as moment from 'moment';
import { TestRail } from './testrail';
import { Status, TestRailOptions } from './testrail.interface';
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
  private options: TestRailOptions;

  constructor(runner: any, options: { reporterOptions: TestRailOptions}) {
    super(runner);

    this.options = this.overrideOptionsWithEnvironment(options.reporterOptions);

    this.testRail = new TestRail(this.options);
    this.validateOptions(this.options)

    runner.on(EVENT_RUN_BEGIN, async () => {
      const executionDateTime = moment().format('MMM Do YYYY, HH:mm (Z)');
      const name = `Automated test run ${executionDateTime}`;
      const description = 'For the Cypress run visit https://dashboard.cypress.io/#/projects/runs';
      fs.readFile(this.options.runIdFileLocation, (err, data) => {
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
      // plase see the readme.MD -> this is somehow broken right now because of the kill signal from mocha.
    });
  }


  private overrideOptionsWithEnvironment(options: TestRailOptions) {
    const newOptions: TestRailOptions = {
      host: process.env.CYPRESS_TESTRAIL_REPORTER_HOST ? process.env.CYPRESS_TESTRAIL_REPORTER_HOST : options.host,
      password: process.env.CYPRESS_TESTRAIL_REPORTER_PASSWORD ? process.env.CYPRESS_TESTRAIL_REPORTER_PASSWORD : options.password,
      username: process.env.CYPRESS_TESTRAIL_REPORTER_USERNAME ? process.env.CYPRESS_TESTRAIL_REPORTER_USERNAME : options.username,
      projectId: process.env.CYPRESS_TESTRAIL_REPORTER_PROJECT_ID ? Number(process.env.CYPRESS_TESTRAIL_REPORTER_PROJECT_ID) : options.projectId,
      runIdFileLocation: process.env.CYPRESS_TESTRAIL_REPORTER_RUN_ID_FILE_LOCATION ? process.env.CYPRESS_TESTRAIL_REPORTER_RUN_ID_FILE_LOCATION : options.runIdFileLocation,
      suiteId: process.env.CYPRESS_TESTRAIL_REPORTER_SUITE_ID ? Number(process.env.CYPRESS_TESTRAIL_REPORTER_SUITE_ID) : options.suiteId,
      filter: process.env.CYPRESS_TESTRAIL_REPORTER_FILTER ? process.env.CYPRESS_TESTRAIL_REPORTER_FILTER : options.filter,
      groupId: process.env.CYPRESS_TESTRAIL_REPORTER_GROUP_ID ? Number(process.env.CYPRESS_TESTRAIL_REPORTER_GROUP_ID) : options.groupId,
    };
    return options;
  }

  private async evaluateGlobalCommandsFromTitle(test: any) {
    containsCloseRunFlag(test.title) && await this.testRail.closeRun();
  }

  private validateOptions(reporterOptions: TestRailOptions) {
    this.validate(reporterOptions, 'host');
    this.validate(reporterOptions, 'username');
    this.validate(reporterOptions, 'password');
    this.validate(reporterOptions, 'projectId');
    this.validate(reporterOptions, 'suiteId');
    this.validate(reporterOptions, 'runIdFileLocation');
  }

  private validate(options, name: string) {
    if (options[name] == null) {
      throw new Error(`Missing ${name} value. Please update reporterOptions in cypress.json or add it to a environmental variables.`);
    }
  }
}
