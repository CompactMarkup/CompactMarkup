import { NL, NUL } from './tokenizer'
import type { Input } from './tokenizer'
import './typs'

export default (s: str): Input => {
  // trim lines
  s = s
    .normalize()
    .split(NL)
    .map((l) => l.trimEnd())
    .join(NL)

  // ensure NL at the end
  s.endsWith(NL) || (s += NL)

  // array of characters (to deal with unicode)
  let cs = [...s]
  let i = 0

  // get a character
  let get = (ahead = 0): chr => cs[i + ahead] || NUL

  // get next character
  let next = (): chr => (++i, get(-1))

  // skip a few
  let skip = (n = 1) => {
    i += n
  }

  // push a string back
  let push = (head: str) => {
    cs = [...head, ...cs.slice(i)]
    i = 0
  }

  return {
    get,
    next,
    skip,
    push,
  }
}
