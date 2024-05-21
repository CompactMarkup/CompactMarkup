import Out from './out-html'
import { assert, test } from 'vitest'

let eq = assert.equal

test('out', () => {
  let out = Out()
  eq(out, out)
})
