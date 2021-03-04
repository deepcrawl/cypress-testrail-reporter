const axios = require('axios');
const chalk = require('chalk');
import { TestRailOptions, TestRailResult } from './testrail.interface';

export class TestRail {
  private base: String;
  private runId: Number;
  private includeAll: Boolean = true;
  private caseIds: Number[] = [];

  constructor(private options: TestRailOptions) {
    this.base = `${options.host}/index.php?/api/v2`;
  }

  public getCases () {
    let url = `${this.base}/get_cases/${this.options.projectId}&suite_id=${this.options.suiteId}`
    if (this.options.groupId) {
      url += `&section_id=${this.options.groupId}`
    }
    if (this.options.filter) {
      url += `&filter=${this.options.filter}`
    }
    return axios({
      method:'get',
      url: url,
      headers: { 'Content-Type': 'application/json' }, 
      auth: {
          username: this.options.username,
          password: this.options.password
      } 
    })
      .then(response => response.data.map(item =>item.id))
      .catch(error => console.error(error));
  }

  public async createRun (name: string, description: string) {
    if (this.options.includeAllInTestRun === false){
      this.includeAll = false;
      this.caseIds =  await this.getCases();
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
        console.log(chalk.magenta(`  _______        _   _____         _ `));
        console.log(chalk.magenta(` |__   __|      | | |  __ \\     (_) |`));
        console.log(chalk.magenta(`    | | ___  ___| |_| |__) |__ _ _| |`));
        console.log(chalk.magenta("    | |/ _ \\/ __| __|  _  /  _  | | |"));
        console.log(chalk.magenta(`    | |  __/\\__ \\ |_| | \\ \\ (_| | | |`));
        console.log(chalk.magenta(`    |_|\\___||___/\\__|_|  \\_\\__,_|_|_|`));

        console.log(chalk.magenta.bold(`Testrail reporter: Run with id ${response.data.id} successfully created`))
        this.runId = response.data.id;
      })
      .catch(error => console.error(error));
  }

  public deleteRun() {
    axios({
      method: 'post',
      url: `${this.base}/delete_run/${this.runId}`,
      headers: { 'Content-Type': 'application/json' },
      auth: {
        username: this.options.username,
        password: this.options.password,
      },
    }).then(() => {
      console.log(chalk.magenta.bold(`Testrail reporter: Run successfully deleted`));
    }).catch(error => console.error(error));
  }

  public async publishResults(results: TestRailResult[]) {
    try {
      await axios({
        method: 'post',
        url: `${this.base}/add_results_for_cases/${this.runId}`,
        headers: { 'Content-Type': 'application/json' },
        auth: {
          username: this.options.username,
          password: this.options.password,
        },
        data: JSON.stringify({ results }),
      })
      console.log('\n', chalk.magenta.bold(`Testrail reporter: Outcome of following test cases saved in TestRail run with id:${this.runId}`));
      results.forEach(result => { 
        console.log(chalk.magenta(`Test case ${result.case_id} with status id: ${result.status_id}`))
      });
      console.log('\n');
    } catch (e){
      console.error(e)
    }
  }

  public closeRun() {
    axios({
      method: 'post',
      url: `${this.base}/close_run/${this.runId}`,
      headers: { 'Content-Type': 'application/json' },
      auth: {
        username: this.options.username,
        password: this.options.password,
      },
    })
      .then(() => console.log(chalk.magenta.bold(`Testrail reporter: Run with id ${this.runId} closed successfully`)))
      .catch(error => console.error(error));
  }
}
