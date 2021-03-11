# TestRail Reporter for Cypress

Publishes [Cypress](https://www.cypress.io/) runs on TestRail.

## TODO
* Solve the problem of the last test not beeing send as mocha evaluates process.exit without waiting for async calls to finish :(
  * Currently solved as adding one test on the end of the test suite that will contain commands: `#COMMAND:closeRun#` and `#COMMAND:noReport#`

## Install

```shell
$ npm install deepcrawl/cypress-testrail-reporter --save-dev
```

```shell
$ yarn add deepcrawl/cypress-testrail-reporter --dev
```

## Usage

Add reporter to your `cypress.json`:

```json
...
"reporter": "@deepcrawl/cypress-testrail-reporter",
"reporterOptions": {
  "host": "https://yourdomain.testrail.com",
  "username": "username",
  "password": "password",
  "projectId": 1,
  "suiteId": 1,
  "runIdFileLocation": "myFile.txt",
  "environmentName": <string>,
  "cypressProjectId": <string>
}
```

This reporter automatically looks for a test case with same name and if there is one it uploads the results. If there is no such test case it will make new one and then upload the results.

### COMMANDS

#### `#COMMAND:closeRun#`

This command notifies the reporter  that at <b>AT THE BEGINNING</b> of the test execution the reporter should call test rail to close the run.

```
describe("Test Rail synchronization test", function () {
  it("this test will call for closing the run #COMMAND:closeRun#", async function () {
    await cy.wait(10000);
    expect(1).equal(1);
  });
});
```

#### `#COMMAND:noReport#`

This command notifies the reporter that this test should not be reported.

```
describe("Test Rail synchronization test", function () {
  it("this test will call for closing the run #COMMAND:noReport#", async function () {
    await cy.wait(10000);
    expect(1).equal(1);
  });
});
```

## Reporter Options

**host**: _string_ host of your TestRail instance (e.g. for a hosted instance _https://instance.testrail.com_).

**username**: _string_ email of the user under which the test run will be created.

**password**: _string_ password or the API key for the aforementioned user.

**projectId**: _number_ project with which the tests are associated in Test Rail.

**runIdFileLocation**: _string_ name of the file from where the runId should be taken as a priority. If no such file exists than new run will be created and this file will be overrided and the content of the file will be just id of the run. ( This is a solution for cypress to not to create run for each test suite file. )

**suiteId**: _number_ suite with which the tests are associated.

## TestRail Settings

To increase security, the TestRail team suggests using an API key instead of a password. You can see how to generate an API key [here](http://docs.gurock.com/testrail-api2/accessing#username_and_api_key).

If you maintain your own TestRail instance on your own server, it is recommended to [enable HTTPS for your TestRail installation](http://docs.gurock.com/testrail-admin/admin-securing#using_https).

For TestRail hosted accounts maintained by [Gurock](http://www.gurock.com/), all accounts will automatically use HTTPS.

You can read the whole TestRail documentation [here](http://docs.gurock.com/).

## Author

Deepcrawl internal copy!

## License

This project is licensed under the [MIT license](/LICENSE.md).

## Acknowledgments

* [Web & Mobile development company](https://github.com/Vivify-Ideas), owner of the [mocha-testrail-reporter](https://github.com/Vivify-Ideas/cypress-testrail-reporter) repository that was forked.

