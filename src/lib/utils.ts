import chalk from 'chalk';
export function printCoolAscii() {
    console.log(chalk.magenta(`  _______        _   _____         _ `));
    console.log(chalk.magenta(` |__   __|      | | |  __ \\     (_) |`));
    console.log(chalk.magenta(`    | | ___  ___| |_| |__) |__ _ _| |`));
    console.log(chalk.magenta("    | |/ _ \\/ __| __|  _  /  _  | | |"));
    console.log(chalk.magenta(`    | |  __/\\__ \\ |_| | \\ \\ (_| | | |`));
    console.log(chalk.magenta(`    |_|\\___||___/\\__|_|  \\_\\__,_|_|_|`));
}

export function containesNoReportFlag(title: string) {
    const noReportRegex: RegExp = /#COMMAND:noReport#/g;
    const a = noReportRegex.exec(title);
    console.log('title:', title, 'Found norRep:', a)
    return a;
}

export function containsCloseRunFlag(title: string) {
    const closeRunRegex: RegExp = /#COMMAND:closeRun#/g;
    const a = closeRunRegex.exec(title);
    console.log('title:', title, 'Found closeRun:', a)
    return a;
  }