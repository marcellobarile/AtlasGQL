// tslint:disable: arrow-parens

import { Field, ObjectType } from 'type-graphql';

import { Conf } from '../../../config/common';

@ObjectType({ description: 'Some debug information about the server' })
export class DebugInfo {
  @Field({ nullable: false })
  public startedAt: number = Conf.AppStartedAt;

  @Field(type => String, { nullable: false })
  get version(): string {
    return Conf.AppVersion;
  }

  @Field(type => String, { nullable: false })
  get name(): string {
    return Conf.AppName;
  }

  @Field(type => Number, { nullable: false })
  get uptime(): number {
    return new Date().getTime() - this.startedAt;
  }
}
