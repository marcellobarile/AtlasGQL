// tslint:disable: arrow-parens

import { Query, Resolver } from 'type-graphql';
import { Performances } from './perf.type';

@Resolver((of) => Performances)
export class PerformancesResolver {
  @Query((returns) => Performances, {
    description: 'Returns performances information about the server',
  })
  public async performances(): Promise<Performances> {
    return new Performances();
  }
}
