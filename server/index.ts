import { ApolloServer, CorsOptions } from 'apollo-server-express';
import { execute, GraphQLSchema, subscribe } from 'graphql';
import { Server } from 'http';
import pathUtils from 'path';
import 'reflect-metadata';
import { SubscriptionServer } from 'subscriptions-transport-ws';
import { buildSchema } from 'type-graphql';
import context from './context';
import formatError from './errors';
import formatResponse from './extensions';
import middlewares from './middlewares';
import resolvers from './models';
import validationRules from './validationRules';

class GraphQlServer {
  public static server: ApolloServer;
  public static subscriptionServer: SubscriptionServer;
  public static httpServer: Server;

  public static async createServer(
    path: string,
    app: any,
    corsOpts: CorsOptions | boolean,
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

    app.disable('x-powered-by');

    this.server = new ApolloServer({
      schema,
      context,
      formatResponse: formatResponse as any,
      formatError,
      validationRules,
      introspection: true,
    });

    await this.server.start();

    // Registering middlewares on Apollo
    this.server.applyMiddleware({
      app,
      path,
      cors: corsOpts,
    });

    // Registering middlewares after Apollo
    if (middlewares.afterApollo.length > 0) {
      app.use(path, [...middlewares.afterApollo]);
    }

    // Registering dev middlewares after Apollo
    if (developmentMode && middlewares.dev.length > 0) {
      app.use(path, [...middlewares.dev]);
    }

    this.createSubscriptionServer(schema);
  }

  /**
   * Registers the subscription server for GraphQL subscriptions.
   */
  private static createSubscriptionServer(schema: GraphQLSchema): void {
    this.subscriptionServer = SubscriptionServer.create(
      {
        schema,
        execute,
        subscribe,
      },
      {
        server: this.httpServer,
        path: this.server.graphqlPath,
      }
    );

    ['SIGINT', 'SIGTERM'].forEach((signal) => {
      process.on(signal, () => this.subscriptionServer.close());
    });
  }
}

export { GraphQlServer };
