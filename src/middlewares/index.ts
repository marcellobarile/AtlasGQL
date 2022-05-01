import { RequestHandler } from 'express';

// TODO: Define a priority for middlewares (eg, the 404 should be always at the bottom of the chain)
// TODO: Define the path

// Note:
// Apollo Server calls res.end after sending the execution results of your GraphQL request.
// This finalizes the response, so no other middleware will be called afterward.
// If you need to format the response, you can utilize the formatResponse or formatErrors options

export interface Middlewares {
  global?: RequestHandler[];
  beforeApollo?: RequestHandler[];
  beforeApolloDev?: RequestHandler[];
}

export default {
  global: [],
  beforeApollo: [],
  beforeApolloDev: [],
};
