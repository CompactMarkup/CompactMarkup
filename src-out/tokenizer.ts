import type { Input } from './inp'
import { NL } from './inp'

export interface Tokenizer {
  token: (skipWhite?: bol) => str
  rest: (skipWhite?: bol) => str // line rest
}

export default (inp: Input): Tokenizer => {
  let token = (skipWhite = true): str => {
    if (skipWhite) inp.skipWhite()
    let i = 0
    while (!inp.isWhite(i)) ++i
    return inp.take(i)
  }

  let rest = (skipWhite = true): str => {
    if (skipWhite) inp.skipWhite()
    let i = 0
    while (!inp.is(NL)) ++i
    let s = inp.take(i)
    inp.next()
    return s
  }

  return { token, rest }
}
