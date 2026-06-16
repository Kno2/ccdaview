#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

console.log('Installing git pre-commit hook...');

const hookPath = path.join('.git', 'hooks', 'pre-commit');

const hookContent = `#!/bin/sh

# Get staged files, skipping files with unstaged changes to avoid staging unrelated work
files=""
for file in $(git diff --cached --name-only --diff-filter=ACM); do
    [ -f "$file" ] && [ -z "$(git diff --name-only -- "$file")" ] && files="$files $file"
done

[ -z "$files" ] && exit 0

# Format all files in a single invocation — --no-error-on-unmatched-pattern
# skips non-formattable files (images, etc.) instead of erroring
./node_modules/.bin/oxfmt --no-error-on-unmatched-pattern $files && git add $files`;

try {
    // Create .git/hooks directory if it doesn't exist
    const hooksDir = path.dirname(hookPath);
    if (!fs.existsSync(hooksDir)) {
        fs.mkdirSync(hooksDir, { recursive: true });
    }

    // Write the hook file
    fs.writeFileSync(hookPath, hookContent, { mode: 0o755 });

    console.log('Git pre-commit hook installed successfully!');
    console.log('The hook will now run oxfmt on staged files before each commit.');
} catch (error) {
    console.error('Failed to install git hook:', error.message);
    process.exit(1);
}
