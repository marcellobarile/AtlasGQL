// tslint:disable: arrow-parens

import { Field, ObjectType } from 'type-graphql';
import { Configurations } from '../../configurations';

@ObjectType({ description: 'Some debug information about the server' })
export class DebugInfo {
  @Field({ nullable: false })
  public startedAt: number = Configurations.AppStartedAt;

  @Field((type) => String, { nullable: false })
  get version(): string {
    return Configurations.AppVersion;
  }

  @Field((type) => String, { nullable: false })
  get name(): string {
    return Configurations.AppName;
  }

  @Field((type) => Number, { nullable: false })
  get uptime(): number {
    return new Date().getTime() - this.startedAt;
  }
}
