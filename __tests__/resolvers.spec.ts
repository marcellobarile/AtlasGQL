import { Common } from '../server/helpers/common';
import { BaseConnector as MockBaseConnector } from '../server/connectors/rest/__mocks__/base';

// Mocked base service
import { BaseConnector } from '../server/connectors/rest/base';
jest.mock('../server/connectors/rest/base');

it('should return an empty array', () => {
  return expect(
    []
  )
  .toHaveLength(0);
});
