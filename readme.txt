================================================================================
REPRO-GEN (v1.0.0)
Author: MinoForge-Official (@MinoForge-Official)
================================================================================

Turn any crash report, stacktrace, or error log into an instant failing test.

[QUICK LINKS]
- Web: https://github.com/
- License: MIT Open Source
- Supported: Vitest, Jest, Node.js Native Test, Pytest, Mocha

================================================================================
1. OVERVIEW & PURPOSE
================================================================================
When a production bug arrives from Sentry, Datadog, or GitHub Issues, developers
spend 20 to 45 minutes setting up test files, finding the crashing function,
and writing boilerplate test cases to reproduce it.

repro-gen automates this in 1 second:
1. Paste the error or pipe from logs.
2. repro-gen parses file, line number, column, and function name.
3. Automatically scaffolds repro.test.ts ready to run!

================================================================================
2. QUICKSTART COMMANDS
================================================================================
# Paste error directly
$ npx repro-gen "TypeError: Cannot read properties of undefined at getUser (src/user.ts:42:15)"

# Pipe from crash log file
$ cat crash.log | npx repro-gen

# Custom output destination
$ npx repro-gen "TypeError in src/auth.ts:25" --out tests/repro.test.ts

# Dry run (print generated test to console without writing)
$ npx repro-gen "KeyError in app/user.py:15" --dry-run

================================================================================
3. NEXT STEP: RUN THE REPRODUCTION
================================================================================
$ npx vitest repro.test.ts
$ pytest test_repro.py

License: MIT (c) 2026. Instant bug reproduction for all.
