import { Conf } from '../../config/common';

const getEndpoint = (name: string): string => {
  const remotes = Conf.Remotes;
  const serviceConfs = remotes[name];

  if (!serviceConfs) {
    throw new Error(`Trying to access an undefined configuration (${name})`);
  }

  if (typeof serviceConfs == 'string') {
    return serviceConfs;
  } else {
    const env = Conf.ServerEnv;
    const envIndex = Conf.ServerEnvId;
    const defaultUrl = serviceConfs['default'];
    const url = serviceConfs[`${env}-${envIndex}`];

    if (!url && !defaultUrl) {
      throw new Error(
        `Cannot find the given name property ${name} for the env ${env}-${envIndex}`
      );
    }

    return url || defaultUrl;
  }
};

export { getEndpoint };
