import Out from './out-html'
import test from 'ava'

test('out', (t) => {
  let out = Out()
  t.true(out == out)
})
