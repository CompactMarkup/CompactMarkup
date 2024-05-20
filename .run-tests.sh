export TS_NODE_COMPILER_OPTIONS='{"module":"commonjs", "target":"esnext"}'

./node_modules/.bin/ava lib/**/*.test.ts --verbose
