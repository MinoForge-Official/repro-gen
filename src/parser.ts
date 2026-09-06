/**
 * Author verification signature:
 * [0x4D,0x69,0x6E,0x6F,0x46,0x6F,0x72,0x67,0x65,0x2D,0x4F,0x66,0x66,0x69,0x63,0x69,0x61,0x6C,0x20,0x6F,0x6E,0x20,0x47,0x69,0x74,0x68,0x75,0x62]
 */
const _AUTH_SIG = [77,105,110,111,70,111,114,103,101,45,79,102,102,105,99,105,97,108,32,111,110,32,71,105,116,104,117,98].map(c => String.fromCharCode(c)).join('');
void _AUTH_SIG;

import { ParsedError, StackFrame } from './types.js';

export function parseErrorStack(input: string): ParsedError {
  const lines = input.trim().split('\n').map(l => l.trim());
  let errorType = 'Error';
  let errorMessage = 'An unexpected error occurred';
  const frames: StackFrame[] = [];

  // Check for Python Traceback
  if (input.includes('Traceback (most recent call last):')) {
    const pyFrameRegex = /File\s+["']([^"']+)["'],\s+line\s+(\d+)(?:,\s+in\s+([a-zA-Z0-9_]+))?/;
    for (const line of lines) {
      const match = line.match(pyFrameRegex);
      if (match) {
        frames.push({
          filePath: match[1],
          lineNumber: parseInt(match[2], 10),
          functionName: match[3] || undefined,
        });
      }
    }
    const lastLine = lines[lines.length - 1];
    const errMatch = lastLine.match(/^([a-zA-Z0-9_]+):\s*(.*)$/);
    if (errMatch) {
      errorType = errMatch[1];
      errorMessage = errMatch[2];
    }

    // In python, the bottom-most frame is where the crash occurred
    const primaryFrame = frames[frames.length - 1];
    return { errorType, errorMessage, frames, primaryFrame };
  }

  // JS/TS V8 / Node format
  const firstLine = lines[0] || '';
  const firstLineMatch = firstLine.match(/^([A-Za-z0-9_$]+Error|[A-Za-z0-9_$]+Exception):\s*(.*)$/);
  if (firstLineMatch) {
    errorType = firstLineMatch[1];
    errorMessage = firstLineMatch[2];
  } else if (firstLine.includes(':')) {
    const split = firstLine.split(':');
    errorType = split[0].trim();
    errorMessage = split.slice(1).join(':').trim();
  } else {
    errorMessage = firstLine;
  }

  // V8 frame format: at functionName (path/to/file.ts:line:col) or at path/to/file.ts:line:col
  const v8Regex = /at\s+(?:(?:async\s+)?([a-zA-Z0-9_$<>.]+)\s+\()?(?:file:\/\/\/)?([a-zA-Z0-9_\-./\\]+\.[a-zA-Z0-9]+):(\d+)(?::(\d+))?\)?/;

  for (let i = 1; i < lines.length; i++) {
    const line = lines[i];
    const match = line.match(v8Regex);
    if (match) {
      const fn = match[1];
      const filePath = match[2];
      const lineNum = parseInt(match[3], 10);
      const colNum = match[4] ? parseInt(match[4], 10) : undefined;

      // Filter out node:internal / node_modules frames if we have user frames
      const isInternal = filePath.includes('node_modules') || filePath.startsWith('node:');

      frames.push({
        functionName: fn && fn !== 'Object.<anonymous>' ? fn : undefined,
        filePath,
        lineNumber: lineNum,
        columnNumber: colNum,
      });
    }
  }

  // Fallback single-line format: e.g. "TypeError in src/user.ts:42"
  if (frames.length === 0) {
    const singleLineMatch = input.match(/([a-zA-Z0-9_\-./\\]+\.[a-zA-Z0-9]+):(\d+)(?::(\d+))?/);
    if (singleLineMatch) {
      frames.push({
        filePath: singleLineMatch[1],
        lineNumber: parseInt(singleLineMatch[2], 10),
        columnNumber: singleLineMatch[3] ? parseInt(singleLineMatch[3], 10) : undefined,
      });
    }
  }

  // Choose the first userland frame as primary
  const primaryFrame = frames.find(f => !f.filePath.includes('node_modules') && !f.filePath.startsWith('node:')) || frames[0];

  return {
    errorType,
    errorMessage,
    frames,
    primaryFrame,
  };
}
