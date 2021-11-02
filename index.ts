import chalk from 'chalk';
import compression from 'compression';
import cookieParser from 'cookie-parser';
import cors, { CorsOptions } from 'cors';
import debug from 'debug';
import { EventEmitter } from 'events';
import express from 'express';
import fs from 'fs';
import http from 'http';
import logger from 'morgan';
import multer from 'multer';
import request from 'request-promise-native';
import { Configurations } from './config';
import { GraphQlServer, GraphQlServerOptions } from './server';
import { CommonHelpers } from './server/helpers/common';
import Constants from './server/helpers/constants';
import { PostInitHook, PreInitHook } from './server/hooks';
import restRoutes, { registerCustomRoutes } from './server/routes/rest';

export enum EVENTS {
  APOLLO_READY = 'onApolloReady',
  WEB_INTERFACE_READY = 'onWebInterfaceReady',
  GRAPHQL_LISTENING = 'onGraphQLListening',
  EXIT = 'onExit',
  ERROR = 'onError',
}

class Server {
  public events: EventEmitter = new EventEmitter();

  constructor(
    private confs: {
      serverOpts?: GraphQlServerOptions;
      defaultConfs: Record<string, any>;
      customConfs: Record<string, any>;
    }
  ) {
    Configurations.load(confs.defaultConfs, confs.customConfs);

    this.debug.log = console.log.bind(console);

    this.isDev =
      Configurations.ServerEnv === Constants.ENV_DEV ||
      Configurations.ServerEnv === Constants.ENV_TEST;

    if (this.isDev) {
      request.debug = true;
    }
  }

  private isDev = false;
  private express = express();
  private corsOptions: boolean | CorsOptions = false;

  private debug = debug('modern-express:server');

  public start() {
    this.configureCors();
    this.initApolloServer(this.confs.serverOpts);
    this.configureRestRoutes();
    this.configureMiscExpressMIddlewares();
    this.createWebInterface();
  }

  private initApolloServer(options?: GraphQlServerOptions) {
    const validationRules = options?.validationRules || [];
    const formatResponse = options?.formatResponse;
    const formatError = options?.formatError;
    const customContext = options?.customContext;
    const middlewares = options?.middlewares;
    const resolvers = options?.resolvers;

    GraphQlServer.createServer(
      Configurations.GraphQlPath,
      this.express,
      this.corsOptions,
      this.isDev,
      {
        validationRules,
        formatResponse,
        formatError,
        customContext,
        middlewares,
        resolvers,
      }
    );

    this.events.emit(EVENTS.APOLLO_READY);
  }

  private configureCors() {
    if (Configurations.CORSEnabled) {
      this.corsOptions = {
        origin: (origin, callback) => {
          if (
            !origin ||
            (origin && Configurations.Origin.indexOf(origin) !== -1)
          ) {
            callback(null, true);
          } else {
            callback(new Error('Not allowed by CORS'));
          }
        },
        methods: Configurations.AcceptedMethods,
        preflightContinue: Configurations.PreflightContinue,
        optionsSuccessStatus: Configurations.OptionsSuccessStatus,
        credentials: true,
      };

      // Use pre-flight for all the requests
      this.express.options(
        Configurations.Origin,
        cors(this.corsOptions) as express.RequestHandler
      );
    }
  }

  private configureRestRoutes() {
    if (this.confs.serverOpts?.restRoutes) {
      registerCustomRoutes(this.confs.serverOpts.restRoutes);
    }

    if (typeof this.corsOptions === 'object') {
      this.express.use(
        Configurations.RestPath,
        cors(this.corsOptions),
        restRoutes
      );
    } else {
      this.express.use(Configurations.RestPath, restRoutes);
    }
  }

  private configureMiscExpressMIddlewares() {
    // Configure multer to accept multiple files (.any())
    // or a single file (.single('file'))
    this.express.use(
      multer({
        storage: multer.memoryStorage(),
      }).any()
    );

    this.express.set('views', Configurations.ViewsSrcPath);
    this.express.set('view engine', Configurations.ViewsEngine);

    this.express.use(logger('dev'));
    this.express.use(compression());
    this.express.use(express.json());
    this.express.use(express.urlencoded());
    this.express.use(cookieParser());
  }

  private createWebInterface() {
    if (this.confs.serverOpts?.hooks?.preInit) {
      this.confs.serverOpts.hooks.preInit();
    }

    PreInitHook();

    this.initHttpServer();
    this.handleExit();
    this.registerHttpEvents();
    this.createLock();
    this.sayWelcome();

    this.events.emit(EVENTS.WEB_INTERFACE_READY);
  }

  private initHttpServer() {
    GraphQlServer.httpServer = http.createServer(this.express);

    GraphQlServer.httpServer.listen(
      Configurations.ServerPort,
      Configurations.ServerAddr as any
    );
  }

  private removeLock() {
    try {
      fs.unlinkSync('.pid.lock');
    } catch (err) {
      // do nothing
    }
  }

  private onExit() {
    this.events.emit(EVENTS.EXIT);

    this.removeLock();
    process.exit();
  }

  private createLock() {
    this.removeLock();
    fs.writeFileSync('.pid.lock', `${process.pid}`, { flag: 'wx' });
  }

  private registerHttpEvents() {
    if (!GraphQlServer.httpServer) {
      throw new Error('HTTP Server not initialized.');
    }

    GraphQlServer.httpServer.on('error', (error: NodeJS.ErrnoException) => {
      this.events.emit(EVENTS.ERROR, error);

      if (error.syscall !== 'listen') {
        throw error;
      }

      const bind =
        typeof Configurations.ServerPort === 'string'
          ? `Pipe ${Configurations.ServerPort}`
          : `Port ${Configurations.ServerPort}`;

      switch (error.code) {
        default:
          throw error;

        case 'EACCES':
          console.error(`${bind} requires elevated privileges`);
          process.exit(1);
          break;

        case 'EADDRINUSE':
          console.error(`${bind} is already in use`);
          process.exit(1);
          break;
      }
    });

    GraphQlServer.httpServer.on('listening', () => {
      const addr = GraphQlServer.httpServer.address();

      if (addr === null) {
        throw new Error('addr is null');
      }

      const bind =
        typeof addr === 'string' ? `pipe ${addr}` : `port ${addr.port}`;

      this.debug(`Listening on ${bind}`);

      this.events.emit(EVENTS.GRAPHQL_LISTENING);

      if (this.confs.serverOpts?.hooks?.postInit) {
        this.confs.serverOpts.hooks.postInit();
      }

      PostInitHook();
    });
  }

  private handleExit() {
    process.stdin.resume();
    process.on('uncaughtException', this.onExit);
    process.on('beforeExit', this.onExit);
    process.on('SIGINT', this.onExit);
    process.on('SIGTERM', this.onExit);
  }

  private sayWelcome() {
    const welcomeMessage = ` => Service up and running <= `;
    const serverAddressMessage = ` Listening on http://${Configurations.ServerAddr}:${Configurations.ServerPort} `;
    const serverKeyMessage = ` The Service ID is ${Configurations.ServerKey} `;
    console.log('\n');
    console.log(
      chalk.white.bgMagentaBright('                                          ')
    );
    console.log(
      chalk.white.bgMagentaBright.bold(`     ${welcomeMessage}       `)
    );
    console.log(
      chalk.white.bgMagentaBright('                                          ')
    );
    console.log(chalk.white.bgBlack(serverAddressMessage));
    console.log(chalk.white.bgBlack(serverKeyMessage));
    console.log('\n');

    if (Configurations.ServerEnv === Constants.ENV_DEV) {
      console.log(
        `If you want to quickly try the server, go to http://${Configurations.ServerAddr}:${Configurations.ServerPort}${Configurations.GraphQlPath} and try the following query:`
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
-------------------------`
      );
      console.log('\n');
    }
  }
}

export { Server };
