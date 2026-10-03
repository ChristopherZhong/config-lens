/// <reference types="vite/client" />

declare const __APP_VERSION__: string;

declare module '@semantic-release/commit-analyzer' {
  export function analyzeCommits(
    pluginConfig: any,
    context: any
  ): Promise<string | null>;
}
