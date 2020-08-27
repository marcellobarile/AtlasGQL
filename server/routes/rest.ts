import root from 'app-root-path';
import * as express from 'express';

import { Conf } from '../../config/common';

const router = express.Router();

router.get(
  '/types',
  (_req: express.Request, res: express.Response, _next: express.NextFunction) => {
    res.download(
      `${root}/server/interfaces/graphql.d.ts`,
      `${Conf.AppName}-types.ts`
    );
  }
);

router.get(
  '/fragments',
  (_req: express.Request, res: express.Response, _next: express.NextFunction) => {
    res.download(
      `${root}/graphql/static/service.fragments.js`,
      `${Conf.AppName}-fragments.ts`
    );
  }
);

export = router;
