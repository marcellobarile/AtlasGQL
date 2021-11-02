// NOTE: At least one query resolver should be present
// otherwise an error is thrown during the bootstrap

import { DebugInfoResolver } from './debug/debug.resolver';
// import { OnDataResolver } from './subpubData.resolver';

export default [
  DebugInfoResolver,
  // OnDataResolver,
];
