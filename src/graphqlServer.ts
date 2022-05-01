import { PossibleSchemaInput } from '@gql2ts/util';
import {
  ApolloServerPluginLandingPageDisabled,
  GraphQLRequestContext,
  GraphQLResponse
} from 'apollo-server-core';
import { ApolloServer, CorsOptions } from 'apollo-server-express';
import express from 'express';
import {
  GraphQLError,
  GraphQLFormattedError,
  ValidationContext
} from 'graphql';
import { Server } from 'http';
import pathUtils from 'path';
import 'reflect-metadata';
import { SubscriptionServer } from 'subscriptions-transport-ws';
import { buildSchema } from 'type-graphql';
import context, { compose as composeContext } from './context';
import { InterfacesAutomation } from './interfaces/automation';
import middlewares, { Middlewares } from './middlewares';
import resolvers from './models';
import { CustomRoute } from './routes/rest';

export interface GraphQlServerOptions {
  customContext?: Context;
  validationRules?: ((context: ValidationContext) => any)[];
  formatResponse?: (
    response: GraphQLResponse,
    requestContext: GraphQLRequestContext<Record<string, any>>
  ) => GraphQLResponse | null;
  formatError?: (error: GraphQLError) => GraphQLFormattedError;
  hooks?: {
    preInit?: () => void;
    postInit?: () => void;
  };
  middlewares?: Middlewares;
  restRoutes?: CustomRoute[];
  resolvers?: any[];
}

export type Context = ({
  req,
  res,
}: {
  req: any;
  res: any;
}) => Record<string, unknown>;

class GraphQlServer {
  public static server: ApolloServer;
  public static subscriptionServer: SubscriptionServer;
  public static httpServer: Server;

  public static async createServer(
    path: string,
    app: express.Express,
    corsOpts: CorsOptions | boolean,
    developmentMode: boolean,
    serverOpts: GraphQlServerOptions
  ): Promise<void> {
    app.disable('x-powered-by');

    if (serverOpts.middlewares?.global?.length) {
      app.use(serverOpts.middlewares.global);
    }

    const combinedResolvers = [...resolvers, ...(serverOpts.resolvers || [])];

    const schema = await buildSchema({
      resolvers: combinedResolvers as any,
      emitSchemaFile: pathUtils.resolve(process.cwd(), 'schema.graphql'),
    });

    let beforeApolloMiddlewares: any[] = [...middlewares.beforeApollo];

    if (
      serverOpts.middlewares?.beforeApollo &&
      serverOpts.middlewares.beforeApollo.length > 0
    ) {
      beforeApolloMiddlewares = [
        ...serverOpts.middlewares?.beforeApollo,
        ...beforeApolloMiddlewares,
      ];
    }

    // Registering dev middlewares before Apollo
    if (beforeApolloMiddlewares.length > 0) {
      app.use(path, beforeApolloMiddlewares);
    }

    let devMiddlewares: any[] = [...middlewares.beforeApolloDev];

    if (
      serverOpts.middlewares?.beforeApolloDev &&
      serverOpts.middlewares.beforeApolloDev.length > 0
    ) {
      devMiddlewares = [
        ...serverOpts.middlewares?.beforeApolloDev,
        ...devMiddlewares,
      ];
    }

    if (devMiddlewares.length > 0) {
      app.use(path, devMiddlewares);
    }

    this.server = new ApolloServer({
      schema,
      context: serverOpts.customContext
        ? composeContext(serverOpts.customContext)
        : context,
      formatResponse: serverOpts.formatResponse as any,
      formatError: serverOpts.formatError,
      validationRules: serverOpts.validationRules,
      introspection: developmentMode,
      debug: developmentMode,
      plugins: !developmentMode
        ? [ApolloServerPluginLandingPageDisabled()]
        : undefined,
    });

    await this.server.start();

    InterfacesAutomation.generate(schema as PossibleSchemaInput);

    this.server.applyMiddleware({
      app,
      path,
      cors: corsOpts,
    });

    // this.createSubscriptionServer(schema);
  }

  /**
   * Registers the subscription server for GraphQL subscriptions.
   */
  // TODO: Commented out due to an incompatibility between apollo server and graphql versions
  // private static createSubscriptionServer(schema: GraphQLSchema): void {
  //   this.subscriptionServer = SubscriptionServer.create(
  //     {
  //       schema,
  //       execute,
  //       subscribe,
  //     },
  //     {
  //       server: this.httpServer,
  //       path: this.server.graphqlPath,
  //     }
  //   );

  //   ['SIGINT', 'SIGTERM'].forEach((signal) => {
  //     process.on(signal, () => this.subscriptionServer.close());
  //   });
  // }
}

export { GraphQlServer };
