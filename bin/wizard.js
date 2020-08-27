'use strict';

const fs = require('fs');
const inquirer = require('inquirer');
const chalk = require('chalk');
const spawn = require('child_process').spawn;

// Welcome message
const welcomeMessage = "Hi! I'm here to help you";
console.log('\n');
console.log(chalk.bgGreen('                                          '));
console.log(chalk.bgGreen.bold(`        ${welcomeMessage}          `));
console.log(chalk.bgGreen('                                          '));
console.log('\n');

// List of possible actions, indexes are used to match them
// after a selection
const actions = [
  '1) Run a *dev* instance',
  '2) Run a *train* instance',
  '3) Run a *production* instance',
  '4) Generate GraphQL schema, fragments and TS interfaces',
  '5) Execute linting on code',
  '6) Execute tests',
  '7) Generate the documentation',
  '8) Check the NPM vulnerabilities',
  '[X] Abort',
  new inquirer.Separator(),
];

// Questions to be asked before taking an action
const actionsQuestion = [
  {
    type: 'list',
    name: 'action',
    message: 'What do you want to do?',
    choices: actions
  },
];

// Questions to be asked after a "run instance" selection
const envQuestion = [
  {
    type: 'input',
    name: 'envId',
    message: "Please select an environment ID (1,2,3)",
    validate: function(value) {
      var pass = value >= 1 && value <= 3;
      if (pass) {
        return true;
      }
      return 'You can choose between 1, 2 or 3. Thanks.';
    }
  }
];

/**
 * Output a given message applying some style
 * @param {string} message The message to be output
 * @param {string} theme The theme to be used
 */
const say = (message, theme) => {
  console.log('\n');
  if (theme == 'highlight') {
    console.log(chalk.bgWhite(message));
  } else if (theme == 'alert') {
    console.log(chalk.bgRed(message));
  } else {
    console.log(chalk.blue(message));
  }
  console.log('\n');
};

/**
 *  Executes a given NPM script
 * @param {string} scriptName The name of the NPM script to be executed
 */
const executeNpmScript = (scriptName) => {
  const child = spawn(
    /^win/.test(process.platform) ? `npm.cmd` : `npm`,
    ['run', scriptName],
    { stdio: 'pipe' }
  );

  child.stdout.on('data', function (data) {
    process.stdout.write(data);
  });
  child.stderr.on('data', function (data) {
    process.stdout.write(data);
  });
  child.on('exit', function (data) {
    // do nothing
  });
}

/**
 *
 * @param {string} cmd
 */
const executeShellCmd = (cmd, args) => {
  const child = spawn(cmd, args, { stdio: 'pipe' });
  return new Promise((resolve, reject) => {
    child.stdout.on('data', function (data) {
      process.stdout.write(data);
    });
    child.stderr.on('data', function (data) {
      process.stdout.write(data);
    });
    child.on('exit', function (data) {
      resolve(data);
    });
  });
}

//
//
// Here we go...
inquirer.prompt(actionsQuestion).then(answers => {
  const actionIndex = actions.indexOf(answers.action);

  if (actionIndex == 0 || actionIndex == 1 || actionIndex == 2) {
    // Run instance command
    let env = '';
    let npmScriptPrefix = '';
    switch(actionIndex) {
      case 0: env = 'development'; npmScriptPrefix = 'dev';    break;
      case 1: env = 'stage';       npmScriptPrefix = 'stage';   break;
      case 2: env = 'production';  npmScriptPrefix = 'prod';   break;
    }

    inquirer.prompt(envQuestion).then(answers => {
      say(`Ok! I'll run ${env}-${answers.envId}`);
      executeNpmScript(`${npmScriptPrefix}${answers.envId}`);
    });
  } else if (actionIndex == 3) {

    // Prepare GraphQL command
    say("Alright, I'll prepare the GraphQL resources for you...");

    if (!fs.existsSync('.pid.lock')) {
      say("Please, run locally the server before executing this command.", "alert");
    } else {
      executeNpmScript('prepare-graphql');
    }

  } else if (actionIndex == 4) {

    // Run linter
    say("Got it, lint is coming...");
    executeNpmScript('lint');

  } else if (actionIndex == 5) {

    // Run tests
    say("Ok, fine. I'll run them right away");
    executeNpmScript('test');

  } else if (actionIndex == 6) {

    // Generate documentation
    say("I'll generate the documentation immediately");
    executeNpmScript('docs');

  } else if (actionIndex == 7) {

    // Check NPM vuln.
    say("NPM dependencies are going to be analyzed right now...");
    executeNpmScript('audit');

  } else {

    // Abort selection
    process.exit();
  }

});
