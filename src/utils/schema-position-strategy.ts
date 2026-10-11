import { jsonLanguage } from '@codemirror/lang-json';

export type Tree = ReturnType<typeof jsonLanguage.parser.parse>;
export type SyntaxNode = Tree['topNode'];

export interface SchemaPositionStrategy {
  mode: string;
  getKeyNodeFromProperty(propertyNode: SyntaxNode): SyntaxNode | null;
  getValueNodeFromProperty(propertyNode: SyntaxNode): SyntaxNode | null;
  findChildNode(containerNode: SyntaxNode, segment: string, documentText: string): SyntaxNode | null;
}
