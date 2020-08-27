import express from 'express';

// TODO: Define a priority for middlewares (eg, the 404 should be always at the bottom of the chain)
// TODO: Define the path

export default {
  // Runs right before the instantiation of the Apollo server
  beforeApollo: [
    // e.g. (req: express.Request, res: express.Response, next: () => void) => next(),
  ],

  // Runs right after the instantiation of the Apollo server
  afterApollo: [
    // catches a 404 and forward to error handler
    (
      req: express.Request,
      res: express.Response,
      next: express.NextFunction
    ) => {
      const err: any = new Error('Not Found');
      err.status = 404;
      next(err);
    },
    // catches a 500 and renders it as an error
    (
      err: any,
      req: express.Request,
      res: express.Response,
      next: express.NextFunction
    ) => {
      res.status(err.status || 500);
      res.render('error', {
        message: err.message,
        error: {}
      });
    }
  ],

  // Runs right after the instantiation of the Apollo server and *only* on DEV instances
  dev: [
    // catches a 500 and renders it as an error plus the stacktrace
    (
      err: any,
      req: express.Request,
      res: express.Response,
      next: express.NextFunction
    ) => {
      res.status(err.status || 500);
      res.render('error', {
        message: err.message,
        error: err
      });
    }
  ]
};
