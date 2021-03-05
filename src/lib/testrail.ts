import axios, { Method } from 'axios';
import chalk from 'chalk';
import { TestRailOptions, TestRailResult , TestRailCase, TestRailSection, Status} from './testrail.interface';
import { containesNoReportFlag, printCoolAscii } from './utils';
var fs = require('fs');

export class TestRail {
  private base: String;
  private runId: Number;
  private cases: TestRailCase[] = [];
  private sections: TestRailSection[] = [];

  constructor(private options: TestRailOptions) {
    this.base = `${options.host}/index.php?/api/v2`;
  }

  private async initialize() {
    await this.loadAllTestCases();
    await this.loadAllSections();
  }

  public async saveRunId(id:number) {
    this.runId = id;
    await this.initialize();
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

  private async makeAxiosRequest(method: Method, url: string, data?: string) {
    return axios({
      method: method,
      url: url,
      headers: this.getRequestHeader(), 
      auth: this.getRequestAuth(),
      data: data
    });
  }

  private async getSections() {
    try {
      const response = await this.makeAxiosRequest('get', `${this.base}/get_sections/${this.options.projectId}&suite_id=${this.options.suiteId}`)
      return response.data;
    } catch (e) {
      console.error(e);
    }
  }

  private async loadAllSections() {
    this.sections = await this.getSections();
  }

  public async getCases () {
    let url = `${this.base}/get_cases/${this.options.projectId}&suite_id=${this.options.suiteId}`
    url = this.options.groupId ? url + `&section_id=${this.options.groupId}` : url;
    url = this.options.filter ? url + `&filter=${this.options.filter}` : url;

    try {
      const response = await this.makeAxiosRequest('get', url);
      return response.data;
    } catch (e) {
      console.error(e);
    }
  }

  private async loadAllTestCases() { 
    this.cases = await this.getCases();
  }

  public async createRun(name: string, description: string) {

    await this.initialize();
    printCoolAscii();

    try {
      const response = await this.makeAxiosRequest(
        'post', 
        `${this.base}/add_run/${this.options.projectId}`, 
        JSON.stringify({
          suite_id: this.options.suiteId,
          name,
          description,
        })
      )
      this.runId = response.data.id;
      fs.writeFile(this.options.runIdFileLocation, this.runId, (err) => {
        if (err) throw err;
        console.log(chalk.magenta.bold(`Testrail reporter: File ${this.options.runIdFileLocation} created with id: ${this.runId}`));
      });
      console.log(chalk.magenta.bold(`Testrail reporter: Run with id ${this.runId} successfully created`));
    } catch (e) {
      console.error(e)
    }
  }

  public async deleteRun() {
    try {
      await this.makeAxiosRequest(
        'post',
      `${this.base}/delete_run/${this.runId}`
      )
    } catch (e) {
      console.error(e)
    }
    console.log(chalk.magenta.bold(`Testrail reporter: Run successfully deleted`));
  }

  private async createNewTestCase(title: string){
    try {
      const res = await this.makeAxiosRequest(
        'post', 
        `${this.base}/add_case/${this.sections[0].id}`, 
        JSON.stringify({ title, custom_automation_type: 0 })
      )
      return res.data;
    } catch (e) {
      console.error(e)
    }
  }

  public async publishResult(testTitle: string, result: TestRailResult){

    if (containesNoReportFlag(testTitle)) return;

    const testAlreadyHasTestCase = this.cases.filter((c) => c.title === testTitle)

    let newCase: TestRailCase;
    if (testAlreadyHasTestCase.length <= 0) {
      newCase = await this.createNewTestCase(testTitle);
      console.log('\n', chalk.magenta.bold(`Testrail reporter: Created a new test case: ${testTitle} with case id: ${newCase.id}`));
    }

    const caseId:number = testAlreadyHasTestCase.length > 0 ? testAlreadyHasTestCase[0].id : newCase.id;

    try {
      // no need to push untested result as it is a default status.
      if (result.status_id !== Status.Untested) {
        const response = await this.makeAxiosRequest(
          'post',
          `${this.base}/add_result_for_case/${this.runId}/${caseId}`,
          JSON.stringify({ ...result})
        )
        console.log('\n', chalk.magenta.bold(`Testrail reporter: Outcome of following test cases saved in TestRail run with id:${this.runId}`));
        console.log(chalk.magenta(`Test case ${caseId} with status id: ${result.status_id}`))
        console.log('\n');
        return response;
      }
    } catch (e) {
      console.error(e)
    }
  }

  public async closeRun() {
    console.log(chalk.magenta.bold(`Testrail reporter: Run with id ${this.runId} will be closed`))
    try {
      const response = await this.makeAxiosRequest(
        'post', 
        `${this.base}/close_run/${this.runId}`
      )
      console.log(chalk.magenta.bold(`Testrail reporter: Run with id ${this.runId} closed successfully`))
      return response;
    } catch (e) {
      console.error(e);
    }
  }

  
}
