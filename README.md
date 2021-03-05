# TestRail Reporter for Cypress

Publishes [Cypress](https://www.cypress.io/) runs on TestRail.

## TODO
* Before posting the test result check if it is in the list of the test cases.
* Solve the problem of the last test not beeing send as mocha evaluates process.exit without waiting for async calls to finish :(
* It would be good to be able to create a test case automatically without need to make them first in the testrail manually -> This just means more maintanance. ( Not that hard actally ) all you need to do is get the tests from the test suite and verify that the name of the test is there. If not call the endpoint to make a new test and then after it returns call the update results for it :)

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
"reporter": "cypress-testrail-reporter",
"reporterOptions": {
  "host": "https://yourdomain.testrail.com",
  "username": "username",
  "password": "password",
  "projectId": 1,
  "suiteId": 1,
}
```

Your Cypress tests should include the ID of your TestRail test case. Make sure your test case IDs are distinct from your test titles:

```Javascript
// Good:
it("C123 C124 Can authenticate a valid user", ...
it("Can authenticate a valid user C321", ...

// Bad:
it("C123Can authenticate a valid user", ...
it("Can authenticate a valid userC123", ...
```

## Reporter Options

**host**: _string_ host of your TestRail instance (e.g. for a hosted instance _https://instance.testrail.com_).

**username**: _string_ email of the user under which the test run will be created.

**password**: _string_ password or the API key for the aforementioned user. When you set `CYPRESS_TESTRAIL_REPORTER_PASSWORD` in runtime environment variables, this option would be overwritten with it.

**projectId**: _number_ project with which the tests are associated.

**suiteId**: _number_ suite with which the tests are associated.

**runName**: _string_ (optional) name of the Testrail run.

**groupId**: _string_ (optional: needs "includeAllInTestRun": false ) The ID of the section/group

**filter**: _string_ (optional: needs "includeAllInTestRun": false) Only return cases with matching filter string in the case title

## TestRail Settings

To increase security, the TestRail team suggests using an API key instead of a password. You can see how to generate an API key [here](http://docs.gurock.com/testrail-api2/accessing#username_and_api_key).

If you maintain your own TestRail instance on your own server, it is recommended to [enable HTTPS for your TestRail installation](http://docs.gurock.com/testrail-admin/admin-securing#using_https).

For TestRail hosted accounts maintained by [Gurock](http://www.gurock.com/), all accounts will automatically use HTTPS.

You can read the whole TestRail documentation [here](http://docs.gurock.com/).

## Author

Milutin Savovic - [github](https://github.com/mickosav)
Deepcrawl internal copy!

## License

This project is licensed under the [MIT license](/LICENSE.md).

## Acknowledgments

* [Web & Mobile development company](https://github.com/Vivify-Ideas), owner of the [mocha-testrail-reporter](https://github.com/Vivify-Ideas/cypress-testrail-reporter) repository that was forked.

