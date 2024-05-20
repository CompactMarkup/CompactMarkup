export default {
  files: ['lib/**/*.test.*'],
  extensions: ['ts'],
  require: ['ts-node/register', 'tsconfig-paths/register'],
  concurrency: 4,
  verbose: true,
  failWithoutAssertions: true,
}
