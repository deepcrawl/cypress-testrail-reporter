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
    return noReportRegex.exec(title);
}

export function containsCloseRunFlag(title: string) {
    const closeRunRegex: RegExp = /#COMMAND:closeRun#/g;
    return closeRunRegex.exec(title);
}

export function getTestTitle(title, parent) {
    let newTitle = parent?.title ? parent.title + ' > ' : '';
    // max title is 240 characters
    newTitle = newTitle + title;
    newTitle = newTitle.substring(newTitle.length - 240, newTitle.length)
    return newTitle;
}