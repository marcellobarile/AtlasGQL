import root from 'app-root-path';
import CUSTOM_CONFS from '../serviceconfig.custom.json';
import CONFS from '../serviceconfig.json';

class Conf {
  public static ServerKey: string;
  public static ServerAddr: string;
  public static ServerPort: string | number;
  public static ServerEnv: string;
  public static ServerEnvId: string | number;

  public static AppVersion = '1.1.0';
  public static AppName = CONFS.name || new Date().getTime().toString(16);
  public static AppStartedAt: number = new Date().getTime();

  public static DefaultAppPort = CONFS.defaults.port;
  public static DefaultAppAddr = CONFS.defaults.addr;

  public static CORSEnabled = CONFS.cors.enabled;
  public static Origin: string[] = CONFS.cors.origin;
  public static AcceptedMethods = CONFS.cors.methods;
  public static PreflightContinue = CONFS.cors.preflightContinue;
  public static OptionsSuccessStatus = CONFS.cors.optionsSuccessStatus;

  public static RestPath = CONFS.rest.path;
  public static GraphQlPath = CONFS.graphql.path;

  public static ViewsEngine = CONFS.views.engine;
  public static ViewsSrcPath = String(CONFS.views.src).replace(
    '__root',
    root.toString()
  );

  public static Remotes: Record<string, string> = CONFS.remotes;

  public static Custom: Record<string, string> = CUSTOM_CONFS;
}

export { Conf };
