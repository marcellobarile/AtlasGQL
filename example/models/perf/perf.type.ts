// tslint:disable: arrow-parens
import { freemem, totalmem } from 'os';
import { Field, ObjectType } from 'type-graphql';

@ObjectType({ description: 'Some performances information about the server' })
export class Performances {
  @Field({ nullable: false })
  public memory: string = `Tot: ${totalmem()}, Free: ${freemem()}`;
}
