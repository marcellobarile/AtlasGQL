import root from 'app-root-path';
import { ENV } from './helpers/constants';

class Configurations {
  public static ServerKey: string;
  public static ServerAddr: string;
  public static ServerPort: string | number;
  public static ServerEnv: string;
  public static ServerEnvId: string | number;

  public static AppVersion: string;
  public static AppId: string;
  public static AppName: string;
  public static AppStartedAt: number = new Date().getTime();

  public static DefaultAppPort: number;
  public static DefaultAppAddr: string;

  public static CORSEnabled: boolean;
  public static Origin: string[];
  public static AcceptedMethods: string[];
  public static PreflightContinue: boolean;
  public static OptionsSuccessStatus: number;

  public static RestPath: string;
  public static GraphQlPath: string;

  public static ViewsEngine: string;
  public static ViewsSrcPath: string;

  private static sessionHash = new Date().getTime().toString(16);

  public static load(env: ENV, envId: number, confs: Record<string, any>) {
    Configurations.AppVersion = confs.version;
    Configurations.AppId = confs.id || Configurations.sessionHash;
    Configurations.AppName = confs.name || Configurations.sessionHash;
    Configurations.DefaultAppAddr = confs.defaults.addr;
    Configurations.DefaultAppPort = confs.defaults.port;
    Configurations.CORSEnabled = confs.cors.enabled;
    Configurations.Origin = confs.cors.origin;
    Configurations.AcceptedMethods = confs.cors.methods;
    Configurations.PreflightContinue = confs.cors.preflightContinue;
    Configurations.OptionsSuccessStatus = confs.cors.optionsSuccessStatus;
    Configurations.RestPath = confs.rest.path;
    Configurations.GraphQlPath = confs.graphql.path;
    Configurations.ViewsEngine = confs.views.engine;
    Configurations.ViewsSrcPath = String(confs.views.src).replace(
      '__root',
      root.toString()
    );

    Configurations.ServerAddr = Configurations.DefaultAppAddr;
    Configurations.ServerPort = String(Configurations.DefaultAppPort);
    Configurations.ServerEnv = env;
    Configurations.ServerEnvId = envId;
    Configurations.ServerKey = `${Configurations.AppName}:${Configurations.ServerEnv}-${Configurations.ServerEnvId}`;
  }
}

export { Configurations };
