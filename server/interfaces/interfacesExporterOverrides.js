module.exports = {
  generateInterfaceName: (name) =>
    capitalizeFirstLetter(name).replace(/_/gm, ''),
  interfaceBuilder: (name, body) => `export interface ${name} ${body}`,
  typeBuilder: (name, body) => `export type ${name} = ${body}`,
  enumTypeBuilder: (name, values) => `export const enum ${name} ${values}`,
  generateNamespace: (_namespaceName, interfaces) => `// tslint:disable
  // graphql typescript definitions
  ${interfaces.replace(/__typename\:/gm, '__typename?:')}
  // tslint:enable
  `,
};

function capitalizeFirstLetter(string) {
  return string.charAt(0).toUpperCase() + string.slice(1);
}
