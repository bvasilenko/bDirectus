export type BinaryName = 'bground' | 'banchor' | 'bsmell' | 'bratch' | 'bwatch' | 'bspector';

export type BinaryStatus = 'directive' | 'failed';

export interface BinaryDirectiveResult {
  binary: BinaryName;
  status: BinaryStatus;
  stdout: string;
  exitCode: number | null;
  stderr?: string;
  errorCode?: string;
  durationMs: number;
  timedOut: boolean;
  truncated: boolean;
}

export interface DirectiveBundle {
  schema: 'bdirectus.directive-bundle.v1';
  generatedAt: string;
  markerStyle: 'sentinel' | 'json-tail';
  collection: string;
  results: BinaryDirectiveResult[];
}
