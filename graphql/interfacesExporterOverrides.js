module.exports = {
  interfaceBuilder: (name, body) => `export interface ${name} ${body}`,
  typeBuilder: (name, body) => `export type ${name} = ${body}`,
  enumTypeBuilder: (name, values) => `export const enum ${name} ${values}`,
  generateNamespace: (namespaceName, interfaces) => `// tslint:disable
  // graphql typescript definitions
  ${interfaces.replace(/__typename\:/gm, '__typename?:')}
  // tslint:enable
  `,
};
