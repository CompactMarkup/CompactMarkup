import test from 'ava'

import { AMP, BR, LT, NUL } from './spec'

test('spec', (t) => {
  // NUL is 0
  t.is('\x00', NUL)
  // the rest are unique
  t.not(NUL, LT)
  t.not(LT, AMP)
  t.not(AMP, BR)

  // NUL comparison
  t.true(NUL == '\0')
  t.false(NUL == '')
  t.false(NUL == '0')
  t.false(NUL == null)

  // t.is(LT, encRaw('<'))
  // t.is(AMP, encRaw('&'))
  // t.is(LT, encRaw(LT))
  // t.is(NL, encRaw(NL))
  // t.is('?', encRaw('?'))

  // t.is('&lt;', encHtml('<'))
  // t.is('<', encHtml(LT))
  // t.is('&amp;', encHtml('&'))
  // t.is('&', encHtml(AMP))
  // t.is('<br/>', encHtml(BR))
  // t.is(NL, encHtml(NL))
  // t.is('?', encHtml('?'))
})

// etc ...
