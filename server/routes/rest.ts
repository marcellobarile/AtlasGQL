import root from 'app-root-path';
import { NextFunction, Request, Response, Router } from 'express';
import { Configurations } from '../configurations';

const router = Router();

export interface CustomRoute {
  path: string;
  handler: (req: Request, res: Response, next: NextFunction) => void;
}

router.get('/types', (_req: Request, res: Response, _next: NextFunction) => {
  res.download(
    `${root}/server/interfaces/graphql.d.ts`,
    `${Configurations.AppName}-types.ts`
  );
});

const normalizeRoutePath = (path: string): string => {
  return path[0] !== '/' ? (path = `/${path}`) : path;
};

// TODO: Support other methods
const registerCustomRoutes = (routes: CustomRoute[]) => {
  routes.forEach((route: CustomRoute) => {
    router.get(normalizeRoutePath(route.path), route.handler);
  });
};

export { registerCustomRoutes };

export default router;
