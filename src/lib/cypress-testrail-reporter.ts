import { reporters } from 'mocha';
import * as moment from 'moment';
import { TestRail } from './testrail';
import { titleToCaseIds } from './shared';
import { Status } from './testrail.interface';
import { AxiosResponse } from 'axios';

export class CypressTestRailReporter extends reporters.Spec {
  private resultsPushPromises: Promise<AxiosResponse<any>>[] = [];
  private testRail: TestRail;

  constructor(runner: any, options: any) {
    super(runner);

    let reporterOptions = options.reporterOptions;

    if (process.env.CYPRESS_TESTRAIL_REPORTER_PASSWORD) {
      reporterOptions.password = process.env.CYPRESS_TESTRAIL_REPORTER_PASSWORD;
    }

    this.testRail = new TestRail(reporterOptions);
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
      const caseIds = titleToCaseIds(test.title);
      console.log('Publishing:', test.title, ' / ', caseIds);
      
      if (caseIds.length > 0) {
        const results = caseIds.map(caseId => {
          return {
            case_id: caseId,
            status_id: Status.Passed,
            comment: `Execution time: ${test.duration}ms`,
            elapsed: `${test.duration/1000}s`
          };
        });
        this.resultsPushPromises.push(this.testRail.publishResults(results));
      }
    });

    runner.on('fail', test => {
      const caseIds = titleToCaseIds(test.title);
      if (caseIds.length > 0) {
        const results = caseIds.map(caseId => {
          return {
            case_id: caseId,
            status_id: Status.Failed,
            comment: `${test.err.message}`,
            elapsed: `${test.duration/1000}s`
          };
        });
        this.resultsPushPromises.push(this.testRail.publishResults(results));
        
        
      }
    });

    runner.on('end', async () => {
    
      // highly unoptimal :D but sync :D
      function wait(ms) {
        var start = Date.now(),
            now = start;
        while (now - start < ms) {
          now = Date.now();
        }
      }

      console.log('\n','Synchro started');

      console.log('total cases to synchronise', this.resultsPushPromises.length);

      this.resultsPushPromises.forEach(async (p, i) => {
        console.log(`Awaiting for ${i}`)
        const a = await p;
        console.log(`Outcome for ${i}:`, a);
      })

      Promise.all(this.resultsPushPromises).then(() => {
        console.log('all saved correctly');
      }, (errors) => {
        console.log('errors form test rail sync:', JSON.stringify(errors));
      })

      wait(1000);
      console.log('\n','.');
      wait(1000);
      console.log('\n','.');
      wait(1000);
      console.log('\n','.');
      wait(1000);

      this.testRail.closeRun();
     
      console.log('\n','.');
      wait(1000);
      console.log('\n','Synchro Finished');

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

  private validate(options, name: string) {
    if (options == null) {
      throw new Error('Missing reporterOptions in cypress.json');
    }
    if (options[name] == null) {
      throw new Error(`Missing ${name} value. Please update reporterOptions in cypress.json`);
    }
  }
}
