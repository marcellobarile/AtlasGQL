import { spawn } from 'child_process';

class CommonHelpers {
  /**
   *  Executes a given NPM script
   * @param {string} scriptName The name of the NPM script to be executed
   */
  public static executeNpmScript(
    scriptName: string,
    useExplore: boolean = false
  ) {
    const npmCmd = /^win/.test(process.platform) ? `npm.cmd` : `npm`;
    const child = spawn(
      npmCmd,
      useExplore
        ? ['explore', 'atlasgql', '--', npmCmd, 'run', scriptName]
        : ['run', scriptName],
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
