import { SchemaPositionStrategy } from './schema-position-strategy';

export class SchemaPositionRegistry {
  private strategies = new Map<string, SchemaPositionStrategy>();

  register(strategy: SchemaPositionStrategy): void {
    if (this.strategies.has(strategy.mode)) {
      console.warn(`[${SchemaPositionRegistry.name}] Strategy for mode '${strategy.mode}' is already registered; duplicate registration will be ignored.`);
      return;
    }
    this.strategies.set(strategy.mode, strategy);
  }

  get(mode: string): SchemaPositionStrategy | undefined {
    return this.strategies.get(mode);
  }
}

export const schemaPositionRegistry = new SchemaPositionRegistry();
