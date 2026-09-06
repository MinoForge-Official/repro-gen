export type TestFramework = 'vitest' | 'jest' | 'node:test' | 'mocha' | 'pytest';

export interface StackFrame {
  functionName?: string;
  filePath: string;
  lineNumber: number;
  columnNumber?: number;
}

export interface ParsedError {
  errorType: string;
  errorMessage: string;
  frames: StackFrame[];
  primaryFrame?: StackFrame;
}

export interface ScaffoldOptions {
  cwd?: string;
  outputPath?: string;
  framework?: TestFramework;
  dryRun?: boolean;
}

export interface ScaffoldResult {
  filePath: string;
  code: string;
  framework: TestFramework;
  written: boolean;
}
