import test from 'ava'

import { AMP, BR, LT, NL, NUL } from './spec'

test('code', (t) => {
  t.is('\x00', NUL)
  t.not(NUL, LT)
  t.not(LT, AMP)
  t.not(AMP, BR)
  t.not(BR, NL)
  t.is('\n', NL)

  t.is(LT, encRaw('<'))
  t.is(AMP, encRaw('&'))
  t.is(LT, encRaw(LT))
  t.is(NL, encRaw(NL))
  t.is('?', encRaw('?'))

  t.is('&lt;', encHtml('<'))
  t.is('<', encHtml(LT))
  t.is('&amp;', encHtml('&'))
  t.is('&', encHtml(AMP))
  t.is('<br/>', encHtml(BR))
  t.is(NL, encHtml(NL))
  t.is('?', encHtml('?'))
})

// etc ...
