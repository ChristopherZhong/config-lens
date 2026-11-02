import { SyntaxNode } from '@lezer/common';

export interface SchemaPositionStrategy {
  mode: string;
  getKeyNodeFromProperty(propertyNode: SyntaxNode): SyntaxNode | null;
  getValueNodeFromProperty(propertyNode: SyntaxNode): SyntaxNode | null;
  findChildNode(containerNode: SyntaxNode, segment: string, documentText: string): SyntaxNode | null;
}
