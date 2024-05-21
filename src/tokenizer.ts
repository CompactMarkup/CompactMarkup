import type { Input } from './inp'
import { isWhite } from './inp'

export interface Tokenizer extends Input {
  is: (c: chr, ahead?: num) => bol // is the character c?
  isWhite: (ahead?: num) => bol
  token: () => str
}

export default (inp: Input): Tokenizer => {
  let { get, next, skip, push, take } = inp

  let is = (c: chr, ahead = 0) => c == get(ahead)

  // NL does not count
  let isWhite = (ahead = 0): bol => _is(get(ahead), (c: chr) => ' ' == c || '\t' == c)

  let token = (): str => {
    let i = 0
    while (!(is(NL, i) || isWhite(i))) ++i
    return take(i)
  }

  return { get, next, skip, push, is, isWhite, token }
}
