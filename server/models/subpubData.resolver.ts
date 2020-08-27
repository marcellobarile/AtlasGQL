import {
  Field,
  ID,
  ObjectType,
  Resolver,
  Root,
  Subscription
} from 'type-graphql';

import { PubSubManager } from '../connectors/pubsub';

@ObjectType()
export class Notification {
  @Field(type => ID)
  public id: string = '0';

  @Field({ nullable: true })
  public data?: string;
}

export interface NotificationPayload {
  id: number;
  data?: string;
}

@Resolver()
export class OnDataResolver {
  @Subscription({ topics: 'NOTIFICATIONS' })
  public onData(@Root()
  {
    id,
    data
  }: NotificationPayload): Notification {
    return PubSubManager.getInstance().pubsub.asyncIterator(
      PubSubManager.ON_DATA_MSG
    );
  }
}
