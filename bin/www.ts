import chalk from 'chalk';
import debug from 'debug';
import fs from 'fs';
import http from 'http';

import { app } from '../app';
import { Conf } from '../config/common';
import { GraphQlServer } from '../server';
import { Common } from '../server/helpers/common';
import { PostInitHook, PreInitHook } from '../server/hooks';

// binding to console
let log = debug('modern-express:server');
log.log = console.log.bind(console);

PreInitHook();

const httpServer = (GraphQlServer.httpServer = http.createServer(app));
httpServer.listen(Conf.ServerPort, Conf.ServerAddr as any);

//
// EVENTS
//
httpServer.on('error', (error: any) => {
  /**
   * Event listener for HTTP server "error" event.
   */
  if (error.syscall !== 'listen') {
    throw error;
  }

  const bind =
    typeof Conf.ServerPort === 'string'
      ? `Pipe ${Conf.ServerPort}`
      : `Port ${Conf.ServerPort}`;

  // handle specific listen errors with friendly messages
  switch (error.code) {
    case 'EACCES':
      console.error(`${bind} requires elevated privileges`);
      process.exit(1);
      break;
    case 'EADDRINUSE':
      console.error(`${bind} is already in use`);
      process.exit(1);
      break;
    default:
      throw error;
  }
});

httpServer.on('listening', () => {
  /**
   * Event listener for HTTP server "listening" event.
   */
  const addr = httpServer.address();

  if (addr === null) {
    throw new Error('addr is null');
  }

  const bind = typeof addr === 'string' ? `pipe ${addr}` : `port ${addr.port}`;
  log(`Listening on ${bind}`);

  PostInitHook();
});

//
// UTILS
//
const onExit = () => {
  removeLock();
  process.exit();
};
const createLock = () => {
  removeLock();
  fs.writeFileSync('.pid.lock', `${process.pid}`, { flag: 'wx' });
};
const removeLock = () => {
  try {
    fs.unlinkSync('.pid.lock');
  } catch (err) {}
};

//
// BOOTSTRAP
//
const welcomeMessage = ` => Service up and running <= `;
const serverAddressMessage = ` Listening on http://${Conf.ServerAddr}:${Conf.ServerPort} `;
const serverKeyMessage = ` The Service ID is ${Conf.ServerKey} `;
console.log('\n');
console.log(
  chalk.white.bgMagentaBright('                                          ')
);
console.log(chalk.white.bgMagentaBright.bold(`     ${welcomeMessage}       `));
console.log(
  chalk.white.bgMagentaBright('                                          ')
);
console.log(chalk.white.bgBlack(serverAddressMessage));
console.log(chalk.white.bgBlack(serverKeyMessage));
console.log('\n');

if (Conf.ServerEnv === Common.constants.ENV_DEV) {
  console.log(
    `If you want to quickly try the server, go to http://${Conf.ServerAddr}:${Conf.ServerPort}${Conf.GraphQlPath} and try the following query:`
  );
  console.log(
`-------------------------
query demo {
  info {
    startedAt
    name
    version
    uptime
  }
}
-------------------------`);
  console.log('\n');
}

createLock();

// Handle graceful exit
process.stdin.resume();
process.on('uncaughtException', onExit);
process.on('beforeExit', onExit);
process.on('SIGINT', onExit);
process.on('SIGTERM', onExit);
