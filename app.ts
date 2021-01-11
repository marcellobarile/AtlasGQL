import bodyParser from 'body-parser';
import compression from 'compression';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import express from 'express';
import logger from 'morgan';
import multer from 'multer';
import request from 'request-promise-native';

import { Conf } from './config/common';
import { GraphQlServer } from './server';
import { Common } from './server/helpers/common';
import restRoutes from './server/routes/rest';

// Store some confs
Conf.ServerAddr = process.env.ADDR || Conf.DefaultAppAddr;
Conf.ServerPort = process.env.PORT || String(Conf.DefaultAppPort);
Conf.ServerEnv = process.env.NODE_TARGET_ENV || Common.constants.ENV_DEV;
Conf.ServerEnvId = process.env.NODE_ENV_ID || 1;
Conf.ServerKey = `${Conf.AppName}:${Conf.ServerEnv}-${Conf.ServerEnvId}`;

const isDev =
  Conf.ServerEnv === Common.constants.ENV_DEV ||
  Conf.ServerEnv === Common.constants.ENV_TEST;

const app = express();

// CORS options
// TODO: Use a flag to enable/disable CORS
const corsOptions = {
  origin: Conf.AcceptedDomains,
  methods: Conf.AcceptedMethods,
  preflightContinue: Conf.PreflightContinue,
  optionsSuccessStatus: Conf.OptionsSuccessStatus,
  credentials: true,
};

// Support pre-flight for all the requests
app.options(Conf.AcceptedDomains, cors(corsOptions));

// -------------------
//  Apollo Server
// -------------------
GraphQlServer.createServer(Conf.GraphQlPath, app, corsOptions, isDev);

if (isDev) {
  // Enabling Request module debug
  request.debug = true;
}

// Configure multer to accept multiple files (.any())
// or a single file (.single('file'))
app.use(
  multer({
    storage: multer.memoryStorage(),
  }).any()
);

// ------------------------
// REST
// ------------------------
app.use(Conf.RestPath, cors(corsOptions), restRoutes);

// ------------------------
// MISC.
// ------------------------
// view engine setup
app.set('views', Conf.ViewsSrcPath);
app.set('view engine', Conf.ViewsEngine);

app.use(logger('dev'));
app.use(compression());
app.use(bodyParser.json());
app.use(
  bodyParser.urlencoded({
    extended: false,
  })
);
app.use(cookieParser());

export { app };
