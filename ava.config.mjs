export default {
  files: ['src/**/*.test.*'],
  extensions: ['ts'],
  require: ['ts-node/register', 'tsconfig-paths/register'],
  concurrency: 4,
  verbose: true,
  timeout: '4s',
  failWithoutAssertions: true,
}
