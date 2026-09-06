import { ParsedError, ScaffoldResult } from './types.js';
import { c } from './colors.js';

export function printBanner(): void {
  console.log(c.magenta(`
  ██████╗ ███████╗██████╗ ██████╗  ██████╗        ██████╗ ███████╗███╗   ██╗
  ██╔══██╗██╔════╝██╔══██╗██╔══██╗██╔═══██╗      ██╔════╝ ██╔════╝████╗  ██║
  ██████╔╝█████╗  ██████╔╝██████╔╝██║   ██║█████╗██║  ███╗█████╗  ██╔██╗ ██║
  ██╔══██╗██╔══╝  ██╔═══╝ ██╔══██╗██║   ██║╚════╝██║   ██║██╔══╝  ██║╚██╗██║
  ██║  ██║███████╗██║     ██║  ██║╚██████╔╝      ╚██████╔╝███████╗██║ ╚████║
  ╚═╝  ╚═╝╚══════╝╚═╝     ╚═╝  ╚═╝ ╚═════╝        ╚═════╝ ╚══════╝╚═╝  ╚═══╝
`));
  console.log(c.bold(`  🧪 Stacktrace to Minimal Failing Test Case Generator  ${c.dim('v1.0.0')}\n`));
}

export function printSuccess(error: ParsedError, result: ScaffoldResult): void {
  printBanner();

  const frame = error.primaryFrame;
  console.log(`  ${c.bgMagenta(c.bold(' PARSED BUG REPORT '))}`);
  console.log(`  Error:    ${c.red(c.bold(error.errorType))}: ${error.errorMessage}`);
  if (frame) {
    console.log(`  Origin:   ${c.yellow(`${frame.filePath}:${frame.lineNumber}`)} ${frame.functionName ? c.dim(`(${frame.functionName})`) : ''}`);
  }
  console.log(`  Runner:   ${c.cyan(result.framework)}\n`);

  if (result.written) {
    console.log(`  ${c.bgGreen(c.bold(' TEST GENERATED '))} ${c.green(`Saved to: ${result.filePath}`)}\n`);
  } else {
    console.log(`  ${c.bgBlue(c.bold(' TEST PREVIEW (dry-run) '))}\n`);
  }

  // Display code preview
  console.log(c.dim('  ' + '─'.repeat(65)));
  const lines = result.code.split('\n');
  for (let i = 0; i < lines.length; i++) {
    const num = String(i + 1).padStart(3, ' ');
    console.log(`  ${c.dim(num)} │ ${c.white(lines[i])}`);
  }
  console.log(c.dim('  ' + '─'.repeat(65)) + '\n');

  console.log(`  ${c.cyan('🚀 Next Step:')} Run your test to reproduce the bug:`);
  if (result.framework === 'vitest') {
    console.log(`     ${c.bold(`npx vitest ${result.filePath}`)}\n`);
  } else if (result.framework === 'pytest') {
    console.log(`     ${c.bold(`pytest ${result.filePath}`)}\n`);
  } else {
    console.log(`     ${c.bold(`npm test`)}\n`);
  }
}
