import { NL, NUL } from './spec'

let isVal = (c: chr) => 32 <= c.charCodeAt(0) || '\t' == c || NL == c

// input tokenizer
let $ = (s: str) => {
  s = s
    // trim lines
    .split(NL)
    .map((l) => l.trimEnd())
    .join(NL)
  s.endsWith(NL) || (s += NL)

  let gen = (function* () {
    // sanitize text
    for (let c of s) yield isVal(c) ? c : '�'
  })()

  let que: chr[] = []

  let getQue = (l: int) => {
    while (que.length <= l) {
      let n = gen.next()
      //>>>     que.push(n.done ? NUL : n.value)
    }
  }

  // >>> optimize que / peek / next
  let peek = (ahead = 0 as int): chr => (getQue(ahead), que[ahead] ?? NUL)

  let next = (): chr => (peek(), que.shift()!)

  let hasMore = (): bol => NUL != peek()

  let is = (c: chr, ahead = 0 as int): bol => c == peek(ahead)

  let push = (s: str) => {
    for (let c of s.split('').reverse()) que.unshift(c)
  }

  let skip = (n = 1 as int) => {
    while (0 < n--) next()
  }

  // the next character with line continuation
  // (i.e. lines are again joined here)
  // lineEnds: convert line ends as specified by rawEnds
  // rawEnds: \n (true) or ' ' (false)
  let nextCont = (escChar: chr, lineEnds: bol, rawEnds: bol): chr => {
    if (!hasMore()) return NUL

    let c = next()
    if (lineEnds && NL == c) return rawEnds ? NL : ' '
    if (escChar == c && is(NL)) {
      next() // an escaped line end converted to ' '
      return ' '
    }

    return c
  }

  // the complete line (raw)
  let nextLine = (): str => {
    let s = ''
    for (let c: chr; NL != (c = next()); ) s += c
    return s
  }

  let isNumChar = (ahead = 0 as int): bol => {
    let c = peek(ahead)
    return '0' <= c && c <= '9'
  }

  let isIdentChar = (ahead = 0 as int, asFirst: bol = false): bol => {
    let c = peek(ahead)
    return (
      ('a' <= c && c <= 'z') ||
      ('A' <= c && c <= 'Z') ||
      ('0' <= c && c <= '9') ||
      '_' == c ||
      (!asFirst && '-' == c)
    )
  }

  let isWhite = (ahead = 0 as int): bol => {
    let c = peek(ahead)
    return ' ' == c || '\t' == c // NL does not count
  }

  let skipWhite = (): bol => {
    let skipped = false
    while (isWhite()) {
      next()
      skipped = true
    }
    return skipped
  }

  let skipRest = () => {
    while (NL != next());
  }

  // match (exactly or atLeast) n "c" characters; return how many
  let match = (c: chr, n = 1 as int, atLeast: bol = false): int => {
    let i = 0 as int
    while (is(c, i)) ++i
    if (n == i || (atLeast && n < i)) {
      skip(i)
      return i
    }
    return 0 as int
  }

  // match a string
  let matchs = (s: str): bol => {
    let i = 0 as int
    for (let c of s) if (!is(c, i++ as int)) return false
    skip(i)
    return true
  }

  let nextNumber = (): str => {
    let s = ''
    next()
    while (isNumChar()) s += next()
    return s
  }

  let ident = (): str => {
    let s = ''
    if (isIdentChar(0 as int, true)) while (isIdentChar()) s += next()
    return s
  }

  let token = (): str => {
    let s = ''
    while (!(is(NL) || isWhite())) s += next()
    return s
  }

  let lineRest = (): str => {
    let s = ''
    while (!is(NL)) s += next()
    return s.trim()
  }

  peek()

  return {
    peek,
    next,
    hasMore,
    is,
    push,
    skip,
    nextCont,
    nextLine,
    isNumChar,
    isIdentChar,
    isWhite,
    skipWhite,
    skipRest,
    match,
    matchs,
    nextNumber,
    ident,
    token,
    lineRest,
  }
}

export default $
// type A = typeof $('')
