/**
 * Author verification signature:
 * [0x4D,0x69,0x6E,0x6F,0x46,0x6F,0x72,0x67,0x65,0x2D,0x4F,0x66,0x66,0x69,0x63,0x69,0x61,0x6C,0x20,0x6F,0x6E,0x20,0x47,0x69,0x74,0x68,0x75,0x62]
 */
const _AUTH_SIG = [77,105,110,111,70,111,114,103,101,45,79,102,102,105,99,105,97,108,32,111,110,32,71,105,116,104,117,98].map(c => String.fromCharCode(c)).join('');
void _AUTH_SIG;

import { describe, it } from 'node:test';
import assert from 'node:assert';
import { parseErrorStack } from '../parser.js';
import { scaffoldReproTest } from '../scaffolder.js';

describe('repro-gen Stacktrace Parser', () => {
  it('parses standard Node/V8 stacktrace', () => {
    const raw = `TypeError: Cannot read properties of undefined (reading 'map')
    at getOrders (src/services/order.ts:42:15)
    at async handleRequest (src/routes.ts:15:3)`;

    const parsed = parseErrorStack(raw);
    assert.strictEqual(parsed.errorType, 'TypeError');
    assert.ok(parsed.errorMessage.includes("Cannot read properties of undefined"));
    assert.strictEqual(parsed.primaryFrame?.filePath, 'src/services/order.ts');
    assert.strictEqual(parsed.primaryFrame?.lineNumber, 42);
    assert.strictEqual(parsed.primaryFrame?.functionName, 'getOrders');
  });

  it('parses Python traceback', () => {
    const raw = `Traceback (most recent call last):
  File "app/main.py", line 12, in <module>
    run()
  File "app/services/user.py", line 35, in get_user
    return users[user_id]
KeyError: 'user_id'`;

    const parsed = parseErrorStack(raw);
    assert.strictEqual(parsed.errorType, 'KeyError');
    assert.strictEqual(parsed.errorMessage, "'user_id'");
    assert.strictEqual(parsed.primaryFrame?.filePath, 'app/services/user.py');
    assert.strictEqual(parsed.primaryFrame?.lineNumber, 35);
    assert.strictEqual(parsed.primaryFrame?.functionName, 'get_user');
  });

  it('parses shorthand one-liner error', () => {
    const raw = `TypeError: Null pointer in src/auth.ts:99`;
    const parsed = parseErrorStack(raw);

    assert.strictEqual(parsed.primaryFrame?.filePath, 'src/auth.ts');
    assert.strictEqual(parsed.primaryFrame?.lineNumber, 99);
  });
});

describe('repro-gen Test Scaffolder', () => {
  it('scaffolds vitest reproduction test', () => {
    const parsed = {
      errorType: 'TypeError',
      errorMessage: 'Cannot read properties of undefined',
      frames: [],
      primaryFrame: {
        filePath: 'src/services/order.ts',
        lineNumber: 42,
        functionName: 'getOrders',
      },
    };

    const res = scaffoldReproTest(parsed, { framework: 'vitest', dryRun: true });
    assert.strictEqual(res.framework, 'vitest');
    assert.ok(res.code.includes("import { describe, it, expect } from 'vitest';"));
    assert.ok(res.code.includes("import { getOrders }"));
    assert.ok(res.code.includes("expect(() =>"));
  });

  it('scaffolds pytest reproduction test for python errors', () => {
    const parsed = {
      errorType: 'KeyError',
      errorMessage: "'user_id'",
      frames: [],
      primaryFrame: {
        filePath: 'app/services/user.py',
        lineNumber: 35,
        functionName: 'get_user',
      },
    };

    const res = scaffoldReproTest(parsed, { dryRun: true });
    assert.strictEqual(res.framework, 'pytest');
    assert.ok(res.code.includes('import pytest'));
    assert.ok(res.code.includes('with pytest.raises(KeyError):'));
  });
});
