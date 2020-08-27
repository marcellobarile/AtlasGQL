module.exports = {
  /**
   * Application configuration section
   * http://pm2.keymetrics.io/docs/usage/application-declaration/
   */
  apps : [
    {
      name                : 'MY-AWESOME-GQL-API',
      script              : 'build/compiled',
      instances           : 1,
      exec_mode           : "cluster",
      max_memory_restart  : "200M",
      env: {
        NODE_ENV          : 'development',
        NODE_TARGET_ENV   : 'development',
        NODE_ENV_ID       : '1',
      },
      env_production : {
        NODE_ENV          : 'production',
        NODE_TARGET_ENV   : 'production',
        NODE_ENV_ID       : '1',
      }
    },
  ],

  /**
   * Deployment section
   * http://pm2.keymetrics.io/docs/usage/deployment/
   */
  /*
  deploy : {
    production : {
      user : 'node',
      host : '212.83.163.1',
      ref  : 'origin/master',
      repo : 'git@github.com:repo.git',
      path : '/var/www/production',
      'post-deploy' : 'npm install && pm2 reload ecosystem.config.js --env production'
    }
  }
  */
};
