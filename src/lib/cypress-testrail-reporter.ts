import { reporters } from 'mocha';
import * as moment from 'moment';
import { TestRail } from './testrail';
import { titleToCaseIds } from './shared';
import { Status } from './testrail.interface';
var fs = require('fs');

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

    runner.on('start', async () => {
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

    runner.on('pass', async (test) => {
      return this.testRail.publishResult(test.title, {
        status_id: Status.Passed,
        comment: `Execution time: ${test.duration}ms`,
        elapsed: `${test.duration/1000}s`
      });
    });

    runner.on('pending', async (test) => {
      // const caseIds = titleToCaseIds(test.title);
      // if (caseIds.length > 0) {
      //   const results = caseIds.map(caseId => {
      //     return {
      //       case_id: caseId,
      //       status_id: Status.Untested,
      //       comment: `Execution time: ${test.duration}ms`,
      //       elapsed: `${test.duration/1000}s`
      //     };
      //   });
      //   return this.testRail.publishResults(results);
      // }
    });

    runner.on('fail', async (test) => {
      // const caseIds = titleToCaseIds(test.title);
      // if (caseIds.length > 0) {
      //   const results = caseIds.map(caseId => {
      //     return {
      //       case_id: caseId,
      //       status_id: Status.Failed,
      //       comment: `${test.err.message}`,
      //       elapsed: `${test.duration/1000}s`
      //     };
      //   });
      //   return this.testRail.publishResults(results);
      // }
    });

    runner.on('end', async () => {

      

      // await this.testRail.closeRun(); // do we want to close runs?
    });
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
