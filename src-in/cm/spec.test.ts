import { AMP, BR, LT, NL, NUL, encHtml, encRaw } from './spec'
import { assert, test } from 'vitest'

let eq = assert.equal
let ne = assert.notEqual

test('code', (t) => {
  eq('\x00', NUL)
  ne(NUL, LT)
  ne(LT, AMP)
  ne(AMP, BR)
  ne(BR, NL)
  eq('\n', NL)

  eq(LT, encRaw('<'))
  eq(AMP, encRaw('&'))
  eq(LT, encRaw(LT))
  eq(NL, encRaw(NL))
  eq('?', encRaw('?'))

  eq('&lt;', encHtml('<'))
  eq('<', encHtml(LT))
  eq('&amp;', encHtml('&'))
  eq('&', encHtml(AMP))
  eq('<br/>', encHtml(BR))
  eq(NL, encHtml(NL))
  eq('?', encHtml('?'))
})

// etc ...
