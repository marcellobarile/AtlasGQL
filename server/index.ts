import 'reflect-metadata';

import { ApolloServer } from 'apollo-server-express';
import { Server } from 'http';
import pathUtils from 'path';
import { buildSchema } from 'type-graphql';

import context from './context';
import formatError from './errors';
import formatResponse from './extensions';
import middlewares from './middlewares';
import resolvers from './models';
import validationRules from './validationRules';

class GraphQlServer {
  public static server: ApolloServer;
  public static httpServer: Server;

  public static async createServer(
    path: string,
    app: any,
    corsOpts: any,
    developmentMode: boolean
  ): Promise<void> {
    const schema = await buildSchema({
      resolvers: resolvers as any,
      emitSchemaFile: pathUtils.resolve(process.cwd(), 'schema.graphql'),
    });

    // Registering middlewares before Apollo
    if (middlewares.beforeApollo.length > 0) {
      app.use(path, [...middlewares.beforeApollo]);
    }

    this.server = new ApolloServer({
      schema,
      context,
      formatResponse: formatResponse as any,
      formatError,
      validationRules,
      introspection: true,
      playground: developmentMode,
    });

    this.server.applyMiddleware({
      app,
      path,
      cors: corsOpts,
    });

    // Registering middlewares after Apollo
    if (middlewares.afterApollo.length > 0) {
      app.use(path, [...middlewares.afterApollo]);
    }

    if (developmentMode && middlewares.dev.length > 0) {
      app.use(path, [...middlewares.dev]);
    }

    this.server.installSubscriptionHandlers(GraphQlServer.httpServer);
  }
}

export { GraphQlServer };
