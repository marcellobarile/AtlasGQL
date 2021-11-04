![AtlasGQL](https://i.imgur.com/T0pZSju.jpeg)

### **GraphQL schema and resolvers self-composition (Code-first approach)**

Thanks to [type-graphql](https://typegraphql.com), **AtlasGQL** is capable of generating the GraphQL schema at- run-time during the bootstrap.

This means that you don't need to know GraphQL for using it, you can write your own resolvers in TypeScript; go [here](https://typegraphql.com/docs/introduction.html) for further information.

If you feel confident already, you can jump straight to the "example" folder where there is a ready-to-run demo of a server implementing AtlasGQL.

---

### **Tech. stack:**

1. TypeScript 3
2. Apollo Server 3
3. Express 4 + ejs
4. GraphQL 15

---

### **Easily configurable**

The library can be configured following the JSON oject below. That's all you need to do before having it running.

```json
{
  "version": "1.1.0",
  "id": "eu-server-foobar",
  "name": "FooBar Server",
  "defaults": {
    "port": 3000,
    "addr": "localhost"
  },
  "graphql": {
    "path": "/graphql"
  },
  "rest": {
    "path": "/static"
  },
  "views": {
    "src": "__root/server/views/",
    "engine": "ejs"
  },
  "cors": {
    "origin": ["*", "https://studio.apollographql.com"],
    "methods": ["GET", "HEAD", "PUT", "PATCH", "POST", "DELETE"],
    "enabled": true,
    "preflightContinue": false,
    "optionsSuccessStatus": 200
  }
}
```

### **Extending the GraphQL context**

In the GraphQL world, a context is an object (or a function) that returns an object which will be shared across all the resolvers.

### **Shaping and expanding the GraphQL response**

The GraphQL response can be re-shaped or expanded using a custom function that will return the new response.

### **Adding GraphQL middlewares**

For the Express framework, middlewares are functions that have access to the request object (req), the response object (res), and the next middleware function in the application’s request-response cycle. The next middleware function is commonly denoted by a variable named "next".

### **Working with custom validation rules**

The so called "validation rules" are additional GraphQL validations that get applied to client-specified queries.

For further information: (default rules already applied [https://github.com/graphql/graphql-js/tree/master/src/validation/rules](https://github.com/graphql/graphql-js/tree/master/src/validation/rules))

### **About auto-generated TypeScript definitions**

The application generates a types definition file and exposes it by accessing the (`{rest_endpoint}/types`) endpoint.

### **Setup**

```
npm i typescript@4.x @types/express@4.x apollo-server-types@3.x graphql@15.x --also=dev
npm i atlasgql type-graphql@1.x class-validator@0.x
```

### **A quick example of a consumer app (take your time to go through it)**

```ts
import { GraphQLRequestContext, GraphQLResponse } from 'apollo-server-types';
import { CustomRoute, ENV, EVENTS, Middlewares, Server } from 'atlasgql';
import express, { NextFunction, Request, Response } from 'express';
import {
  GraphQLError,
  GraphQLFormattedError,
  ValidationContext,
} from 'graphql';
import { PerformancesResolver } from './models/perf/perf.resolver';
import DefaultConfs from './serviceconfig.json';

// A list of your own resolvers (see below for an example)
const resolvers = [PerformancesResolver];

/**
 * Extends the GraphQL context
 */
const customContext = ({ req, res }) => ({
  requestHash: Math.random().toString(16),
});

/**
 * Extends or re-shape the response
 */
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

/**
 *  Extends or re-shape the error response
 */
const formatError = (error: GraphQLError): GraphQLFormattedError => ({
  ...error,
  extensions: {
    ...error.extensions,
    failedAt: new Date().getTime(),
  },
});

/**
 * Gets executed before the Apollo server is initialized
 */
const preInitHook = () => {
  console.log('[Hook] The server is starting.');
};

/**
 * Gets executed after the Apollo server has been initialized
 */
const postInitHook = () => {
  console.log('[Hook] The server has been started.');
};

/**
 * A list of Express middlewares
 */
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

// A list of custom routes
const restRoutes: CustomRoute[] = [
  {
    // Accessible at "://addr:port/static/hello"
    path: 'hello',
    handler: (_req: Request, res: Response, _next: NextFunction) => {
      res.send('Hello :-)');
    },
  },
];

// See: https://github.com/graphql/graphql-js/tree/main/src/validation/rules
const validationRules: ((context: ValidationContext) => any)[] = [];

// Note: the Apolo Studio will be disabled on production instances
const env = ENV.DEV;

// Note: an identifier that can be useful in case of multiple envs
const envId = 1;

// Finally, the server instance
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

// Registering the events
server.events.once(EVENTS.APOLLO_READY, () => {
  console.log('[Event] Apollo is ready');
});
server.events.once(EVENTS.GRAPHQL_LISTENING, () => {
  console.log('[Event] GraphQL is ready');
});
server.events.once(EVENTS.WEB_INTERFACE_READY, () => {
  console.log('[Event] The web interface is ready');
});
server.events.on(EVENTS.ERROR, (error: NodeJS.ErrnoException) => {
  console.warn('[Event]', error.message, error.stack);
});
server.events.once(EVENTS.EXIT, () => {
  console.log('[Event] Bye!');
});

// Good to go
server.start();
```

**models/perf/perf.resolver.ts**

```ts
import { Query, Resolver } from 'type-graphql';
import { Performances } from './perf.type';

@Resolver((of) => Performances)
export class PerformancesResolver {
  @Query((returns) => Performances, {
    description: 'Returns performances information about the server',
  })
  public async performances(): Promise<Performances> {
    return new Performances();
  }
}
```

**models/perf/perf.type.ts**

```ts
import { freemem, totalmem } from 'os';
import { Field, ObjectType } from 'type-graphql';

@ObjectType({ description: 'Some performances information about the server' })
export class Performances {
  @Field({ nullable: false })
  public memory: string = `Tot: ${totalmem()}, Free: ${freemem()}`;
}
```

---

# Contributing

## Our Pledge

We as members, contributors, and leaders pledge to make participation in our
community a harassment-free experience for everyone, regardless of age, body
size, visible or invisible disability, ethnicity, sex characteristics, gender
identity and expression, level of experience, education, socio-economic status,
nationality, personal appearance, race, caste, color, religion, or sexual identity
and orientation.

We pledge to act and interact in ways that contribute to an open, welcoming,
diverse, inclusive, and healthy community.

## Our Standards

Examples of behavior that contributes to a positive environment for our
community include:

- Demonstrating empathy and kindness toward other people
- Being respectful of differing opinions, viewpoints, and experiences
- Giving and gracefully accepting constructive feedback
- Accepting responsibility and apologizing to those affected by our mistakes,
  and learning from the experience
- Focusing on what is best not just for us as individuals, but for the
  overall community

Examples of unacceptable behavior include:

- The use of sexualized language or imagery, and sexual attention or
  advances of any kind
- Trolling, insulting or derogatory comments, and personal or political attacks
- Public or private harassment
- Publishing others' private information, such as a physical or email
  address, without their explicit permission
- Other conduct which could reasonably be considered inappropriate in a
  professional setting

## Enforcement Responsibilities

Community leaders are responsible for clarifying and enforcing our standards of
acceptable behavior and will take appropriate and fair corrective action in
response to any behavior that they deem inappropriate, threatening, offensive,
or harmful.

Community leaders have the right and responsibility to remove, edit, or reject
comments, commits, code, wiki edits, issues, and other contributions that are
not aligned to this Code of Conduct, and will communicate reasons for moderation
decisions when appropriate.

## Scope

This Code of Conduct applies within all community spaces, and also applies when
an individual is officially representing the community in public spaces.
Examples of representing our community include using an official e-mail address,
posting via an official social media account, or acting as an appointed
representative at an online or offline event.

## Enforcement

Instances of abusive, harassing, or otherwise unacceptable behavior may be
reported to the community leaders responsible for enforcement at
[INSERT CONTACT METHOD].
All complaints will be reviewed and investigated promptly and fairly.

All community leaders are obligated to respect the privacy and security of the
reporter of any incident.

## Enforcement Guidelines

Community leaders will follow these Community Impact Guidelines in determining
the consequences for any action they deem in violation of this Code of Conduct:

### 1. Correction

**Community Impact**: Use of inappropriate language or other behavior deemed
unprofessional or unwelcome in the community.

**Consequence**: A private, written warning from community leaders, providing
clarity around the nature of the violation and an explanation of why the
behavior was inappropriate. A public apology may be requested.

### 2. Warning

**Community Impact**: A violation through a single incident or series
of actions.

**Consequence**: A warning with consequences for continued behavior. No
interaction with the people involved, including unsolicited interaction with
those enforcing the Code of Conduct, for a specified period of time. This
includes avoiding interactions in community spaces as well as external channels
like social media. Violating these terms may lead to a temporary or
permanent ban.

### 3. Temporary Ban

**Community Impact**: A serious violation of community standards, including
sustained inappropriate behavior.

**Consequence**: A temporary ban from any sort of interaction or public
communication with the community for a specified period of time. No public or
private interaction with the people involved, including unsolicited interaction
with those enforcing the Code of Conduct, is allowed during this period.
Violating these terms may lead to a permanent ban.

### 4. Permanent Ban

**Community Impact**: Demonstrating a pattern of violation of community
standards, including sustained inappropriate behavior, harassment of an
individual, or aggression toward or disparagement of classes of individuals.

**Consequence**: A permanent ban from any sort of public interaction within
the community.

## Attribution

This Code of Conduct is adapted from the [Contributor Covenant][homepage],
version 2.1, available at
[https://www.contributor-covenant.org/version/2/1/code_of_conduct.html][v2.1].

Community Impact Guidelines were inspired by
[Mozilla's code of conduct enforcement ladder][mozilla coc].

For answers to common questions about this code of conduct, see the FAQ at
[https://www.contributor-covenant.org/faq][faq]. Translations are available
at [https://www.contributor-covenant.org/translations][translations].

[homepage]: https://www.contributor-covenant.org
[v2.1]: https://www.contributor-covenant.org/version/2/1/code_of_conduct.html
[mozilla coc]: https://github.com/mozilla/diversity
[faq]: https://www.contributor-covenant.org/faq
[translations]: https://www.contributor-covenant.org/translations
