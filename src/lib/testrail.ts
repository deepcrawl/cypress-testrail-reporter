import axios from 'axios';
import chalk from 'chalk';
import { TestRailOptions, TestRailResult , TestRailCase, TestRailSection} from './testrail.interface';
import { printCoolAscii } from './utils';
var fs = require('fs');

export class TestRail {
  private base: String;
  private runId: Number;
  private cases: TestRailCase[] = [];
  private sections: TestRailSection[] = [];

  public async saveRunId(id:number) {
    this.runId = id;
    await this.loadAllTestCases();
    await this.loadAllSections();
  }

  private getRequestHeader() {
    return { 'Content-Type': 'application/json' };
  }

  private getRequestAuth() {
    return {
      username: this.options.username,
      password: this.options.password,
    }
  }

  constructor(private options: TestRailOptions) {
    this.base = `${options.host}/index.php?/api/v2`;
  }

  private async makeAxiosRequest(method: 'get' | 'post', url: string, data?: string) {
    return axios({
      method: method,
      url: url,
      headers: this.getRequestHeader(), 
      auth: this.getRequestAuth(),
      data: data
    });
  }

  private async getSections() {
    return this.makeAxiosRequest('get', `${this.base}/get_sections/${this.options.projectId}&suite_id=${this.options.suiteId}`)
      .then((response) => response.data)
      .catch(error => console.error(error));
  }

  private async loadAllSections() {
    this.sections = await this.getSections();
  }

  public async getCases () {
    let url = `${this.base}/get_cases/${this.options.projectId}&suite_id=${this.options.suiteId}`
    
    if (this.options.groupId) {
      url += `&section_id=${this.options.groupId}`
    }

    if (this.options.filter) {
      url += `&filter=${this.options.filter}`
    }

    return this.makeAxiosRequest('get', url)
      .then((response) => response.data)
      .catch(error => console.error(error));
  }

  private async loadAllTestCases() { 
    this.cases = await this.getCases();
  }

  public async createRun(name: string, description: string) {

    await this.loadAllTestCases();
    await this.loadAllSections();

    printCoolAscii();

    return this.makeAxiosRequest('post', `${this.base}/add_run/${this.options.projectId}`, JSON.stringify({
      suite_id: this.options.suiteId,
      name,
      description,
    }))
      .then(response => {
        this.runId = response.data.id;
        fs.writeFile(this.options.runIdFileLocation, this.runId, function (err) {
          if (err) throw err;
          console.log('Saved!');
        });
        console.log(chalk.magenta.bold(`Testrail reporter: Run with id ${this.runId} successfully created`));
      })
      .catch(error => console.error(error));
  }

  public async deleteRun() {
    return this.makeAxiosRequest(
      'post',
    `${this.base}/delete_run/${this.runId}`
    )
      .then(() => {
        console.log(chalk.magenta.bold(`Testrail reporter: Run successfully deleted`));
      })
      .catch(error => console.error(error));
  }

  private async createNewTestCase(title: string){
    return this.makeAxiosRequest(
      'post', 
      `${this.base}/add_case/${this.sections[0].id}`, 
      JSON.stringify({ title, custom_automation_type: 0 })
    )
      .then((res) => res.data)
      .catch(error => console.error(error));
  }

  public async publishResult(testTitle: string, result: TestRailResult){

    const testAlreadyHasTestCase = this.cases.filter((c) => {
      c.title === testTitle;
    })

    let newCase: TestRailCase;
    if (testAlreadyHasTestCase.length <= 0) {
      newCase = await this.createNewTestCase(testTitle);
      console.log('\n', chalk.magenta.bold(`Testrail reporter: Created a new test case: ${testTitle} with case id: ${newCase.id}`));
    }

    const caseId:number = testAlreadyHasTestCase.length > 0 ? testAlreadyHasTestCase[0].id : newCase.id;

    return this.makeAxiosRequest(
      'post',
      `${this.base}/add_result_for_case/${this.runId}/${caseId}`,
      JSON.stringify({ ...result})
    )
      .then(response => {
        console.log('\n', chalk.magenta.bold(`Testrail reporter: Outcome of following test cases saved in TestRail run with id:${this.runId}`));
        console.log(chalk.magenta(`Test case ${caseId} with status id: ${result.status_id}`))
        console.log('\n');
        return response;
      });
  }

  public closeRun() {
    return this.makeAxiosRequest(
      'post', 
      `${this.base}/close_run/${this.runId}`
    )
      .then((response) => { 
        console.log(chalk.magenta.bold(`Testrail reporter: Run with id ${this.runId} closed successfully`))
        return response;
      })
      .catch(error => console.error(error));
  }
}
