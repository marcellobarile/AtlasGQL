import { GraphQLRequestContext, GraphQLResponse } from "apollo-server-types";
import express, { NextFunction, Request, Response } from "express";
import {
  GraphQLError,
  GraphQLFormattedError,
  ValidationContext
} from "graphql";
import { CustomRoute, ENV, EVENTS, Middlewares, Server } from "../src";
// or import { CustomRoute, ENV, EVENTS, Middlewares, Server } from "atlasgql";
import { PerformancesResolver } from "./models/perf/perf.resolver";
import DefaultConfs from "./serviceconfig.json";

const customContext = ({ req, res }) => ({
  requestHash: Math.random().toString(16),
});

const formatResponse = (
  response: GraphQLResponse,
  _requestContext: GraphQLRequestContext<Record<string, any>>
) => ({
  ...response,
  extensions: {
    ...response.extensions,
    executedAt: new Date().getTime(),
  },
});

const formatError = (error: GraphQLError): GraphQLFormattedError => ({
  ...error,
  extensions: {
    ...error.extensions,
    failedAt: new Date().getTime(),
  },
});

const preInitHook = () => {
  console.log("[Hook] The server is starting.");
};

const postInitHook = () => {
  console.log("[Hook] The server has been started.");
};

const middlewares: Middlewares = {
  beforeApollo: [
    (_req: express.Request, _res: express.Response, next: () => void) => {
      // This will run before Apollo
      return next();
    },
  ],
  beforeApolloDev: [
    (_req: express.Request, _res: express.Response, next: () => void) => {
      // This will run before Apollo but only on a DEV instance
      return next();
    },
  ],
};

const restRoutes: CustomRoute[] = [
  {
    path: "hello",
    handler: (_req: Request, res: Response, _next: NextFunction) => {
      res.send("Hello :-)");
    },
  },
];

const resolvers = [PerformancesResolver];

// See: https://github.com/graphql/graphql-js/tree/main/src/validation/rules
const validationRules: ((context: ValidationContext) => any)[] = [];

const env = ENV.DEV;
const envId = 1;

const server = new Server(env, envId, {
  serverOpts: {
    customContext,
    middlewares,
    hooks: {
      preInit: preInitHook,
      postInit: postInitHook,
    },
    formatResponse,
    formatError,
    validationRules,
    restRoutes,
    resolvers,
  },
  defaultConfs: DefaultConfs,
});

server.events.once(EVENTS.APOLLO_READY, () => {
  console.log("[Event] Apollo is ready");
});
server.events.once(EVENTS.GRAPHQL_LISTENING, () => {
  console.log("[Event] GraphQL is ready");
});
server.events.once(EVENTS.WEB_INTERFACE_READY, () => {
  console.log("[Event] The web interface is ready");
});
server.events.on(EVENTS.ERROR, (error: NodeJS.ErrnoException) => {
  console.warn("[Event]", error.message, error.stack);
});
server.events.once(EVENTS.EXIT, () => {
  console.log("[Event] Bye!");
});

server.start();
