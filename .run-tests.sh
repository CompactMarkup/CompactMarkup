export TS_NODE_COMPILER_OPTIONS='{"module":"commonjs", "target":"esnext"}'
./node_modules/.bin/ava parser/**/*.test.ts --timeout=4s --verbose
