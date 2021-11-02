import { CommonHelpers } from '../helpers/common';

export default () => {
  /* This runs as soon as the service is listening */

  // Let's create GQL assets (schema, interfaces, TS defs)
  CommonHelpers.executeNpmScript('prepare-graphql');
};
