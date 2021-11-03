// tslint:disable: arrow-parens

import { Query, Resolver } from 'type-graphql';

import { DebugInfo } from './debug.type';

@Resolver(of => DebugInfo)
export class DebugInfoResolver {
  @Query(returns => DebugInfo, {
    description: 'Returns debug information from the server'
  })
  public async info(): Promise<DebugInfo> {
    return new DebugInfo();
  }
}
