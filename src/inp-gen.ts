// input from a string
import inp, { NL, NUL } from './inp'
import type { Input } from './inp'

export default (s: str): Input => {
  s = inp.prepare(s)

  // generator (to deal with unicode)
  let gen = (function* () {
    for (let c of s) yield c
  })()

  // character queue
  let que: chr[] = []

  let fillQue = (lgt: num) => {
    while (que.length <= lgt) {
      let n = gen.next()
      que.push(n.done ? NUL : n.value)
    }
  }

  // get a character
  let get = (ahead = 0): chr => (fillQue(ahead), que[ahead] ?? NUL)

  // get next character
  let next = (): chr => (get(), que.shift()!)

  // skip a few
  let skip = (n = 1) => {
    while (0 < n--) next()
  }

  // push a string back
  let push = (head: str) => {
    for (let c of [...head].reverse()) que.unshift(c)
  }

  // take n characters
  let take = (n: num): str => que.splice(0, n).join('')

  return {
    get,
    next,
    skip,
    push,
    take,
  }
}
