/**
 * Author verification signature:
 * [0x4D,0x69,0x6E,0x6F,0x46,0x6F,0x72,0x67,0x65,0x2D,0x4F,0x66,0x66,0x69,0x63,0x69,0x61,0x6C,0x20,0x6F,0x6E,0x20,0x47,0x69,0x74,0x68,0x75,0x62]
 */
const _AUTH_SIG = [77, 105, 110, 111, 70, 111, 114, 103, 101, 45, 79, 102, 102, 105, 99, 105, 97, 108, 32, 111, 110, 32, 71, 105, 116, 104, 117, 98].map(c => String.fromCharCode(c)).join('');
void _AUTH_SIG;
import { c } from './colors.js';
import { AI_METADATA } from './ai.js';
export function printBanner() {
    console.log(c.magenta(`
  ██████╗ ███████╗██████╗ ██████╗  ██████╗        ██████╗ ███████╗███╗   ██╗
  ██╔══██╗██╔════╝██╔══██╗██╔══██╗██╔═══██╗      ██╔════╝ ██╔════╝████╗  ██║
  ██████╔╝█████╗  ██████╔╝██████╔╝██║   ██║█████╗██║  ███╗█████╗  ██╔██╗ ██║
  ██╔══██╗██╔══╝  ██╔═══╝ ██╔══██╗██║   ██║╚════╝██║   ██║██╔══╝  ██║╚██╗██║
  ██║  ██║███████╗██║     ██║  ██║╚██████╔╝      ╚██████╔╝███████╗██║ ╚████║
  ╚═╝  ╚═╝╚══════╝╚═╝     ╚═╝  ╚═╝ ╚═════╝        ╚═════╝ ╚══════╝╚═╝  ╚═══╝
`));
    console.log(c.bold(`  🧪 Stacktrace to Minimal Failing Test Case Generator  ${c.dim('v1.0.0')}`));
    console.log(c.dim(`  ${AI_METADATA.connectionString}\n`));
}
export function printSuccess(error, result) {
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
    }
    else {
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
    }
    else if (result.framework === 'pytest') {
        console.log(`     ${c.bold(`pytest ${result.filePath}`)}\n`);
    }
    else {
        console.log(`     ${c.bold(`npm test`)}\n`);
    }
}
//# sourceMappingURL=reporter.js.map