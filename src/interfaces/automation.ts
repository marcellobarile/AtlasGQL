import {
  generateNamespace,
  ISchemaToInterfaceOptions,
} from '@gql2ts/from-schema';
import { IFromQueryOptions } from '@gql2ts/types';
import { PossibleSchemaInput } from '@gql2ts/util';

export class InterfacesAutomation {
  // The blob that will contain the interfaces definition. Can be written to a file or sent via a HTTP route.
  public static blob = '';

  public static generate(schema: PossibleSchemaInput) {
    const options: Partial<ISchemaToInterfaceOptions> = {
      ignoredTypes: ['BadGraphType'],
    };

    const overrides: Partial<IFromQueryOptions> = {
      generateInterfaceName: (name) =>
        this.capitalizeFirstLetter(name).replace(/_/gm, ''),
      interfaceBuilder: (name, body) => `export interface ${name} ${body}`,
      typeBuilder: (name, body) => `export type ${name} = ${body}`,
      enumTypeBuilder: (name, values) => `export const enum ${name} ${values}`,
      generateNamespace: (_namespaceName, interfaces) => `// tslint:disable
  // graphql typescript definitions
  ${interfaces.replace(/__typename\:/gm, '__typename?:')}
  // tslint:enable
  `,
    };

    this.blob = generateNamespace('AtlasGQLNS', schema, options, overrides);
  }

  private static capitalizeFirstLetter(str: string) {
    return str.charAt(0).toUpperCase() + str.slice(1);
  }
}
