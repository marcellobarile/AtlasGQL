import root from 'app-root-path';

import CUSTOM_CONFS from '../serviceconfig.custom.json';
import CONFS from '../serviceconfig.json';

class Conf {
  static ServerKey: string;
  static ServerAddr: string;
  static ServerPort: string | number;
  static ServerEnv: string;
  static ServerEnvId: string | number;

  static AppVersion = '1.0.1';
  static AppName = CONFS.name || new Date().getTime().toString(16);
  static AppStartedAt: number = new Date().getTime();

  static DefaultAppPort = CONFS.defaults.port;
  static DefaultAppAddr = CONFS.defaults.addr;

  static AcceptedDomains = CONFS.cors.acceptedDomains;
  static AcceptedMethods = CONFS.cors.methods;
  static PreflightContinue = CONFS.cors.preflightContinue;
  static OptionsSuccessStatus = CONFS.cors.optionsSuccessStatus;

  static RestPath = CONFS.rest.path;
  static GraphQlPath = CONFS.graphql.path;

  static ViewsEngine = CONFS.views.engine;
  static ViewsSrcPath = String(CONFS.views.src).replace(
    '__root',
    root.toString()
  );

  static Remotes = CONFS.remotes;

  static Custom = CUSTOM_CONFS;
}

export { Conf };
