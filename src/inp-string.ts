// input from a string
import inp, { NUL } from './inp'
import type { Input } from './inp'

export default (s: str): Input => {
  s = inp.prepare(s)

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

  // take the string from the mark
  let take = (n: num): str => {
    let s = cs.slice(i, n).join('')
    i += n
    return s
  }

  return {
    get,
    next,
    skip,
    push,
    take,
  }
}
