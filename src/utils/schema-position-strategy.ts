import { jsonLanguage } from '@codemirror/lang-json';

export type SyntaxNode = ReturnType<typeof jsonLanguage.parser.parse>['topNode'];

export interface SchemaPositionStrategy {
  mode: string;
  getKeyNodeFromProperty(propertyNode: SyntaxNode): SyntaxNode | null;
  getValueNodeFromProperty(propertyNode: SyntaxNode): SyntaxNode | null;
  findChildNode(containerNode: SyntaxNode, segment: string, documentText: string): SyntaxNode | null;
}
