import { GraphQLError } from 'graphql';

export default (error: GraphQLError): GraphQLError => {
  // The logic of your custom error formatter goes here
  return error;
};
