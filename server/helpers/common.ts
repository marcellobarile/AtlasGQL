import { spawn } from 'child_process';

class CommonHelpers {
  /**
   *  Executes a given NPM script
   * @param {string} scriptName The name of the NPM script to be executed
   */
  public static executeNpmScript(scriptName: string) {
    const child = spawn(
      /^win/.test(process.platform) ? `npm.cmd` : `npm`,
      ['run', scriptName],
      { stdio: 'pipe' }
    );

    child.stdout.on('data', (data) => {
      process.stdout.write(data);
    });

    child.stderr.on('data', (data) => {
      process.stdout.write(data);
    });

    child.on('exit', () => {
      // do nothing
    });
  }
}

export { CommonHelpers };
