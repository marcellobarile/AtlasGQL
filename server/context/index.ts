import { Context } from '..';

const defaultContext = ({ req, res }) => ({
  cookie: req.headers.cookie,
});

const compose = (context: Context) => {
  return (args: { req: unknown; res: unknown }) => ({
    ...defaultContext(args),
    ...context(args),
  });
};

export default defaultContext;
export { compose };
