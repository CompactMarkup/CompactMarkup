// input tokenizer
import { NL, NUL } from './spec'
import './typs'

export default (s: str) => {
  // trim lines
  s = s
    .split(NL)
    .map((l) => l.trimEnd())
    .join(NL)

  // ensure NL at the end
  s.endsWith(NL) || (s += NL)

  // character queue
  let que: chr[] = [...s]

  // fill the queue & peek ahead
  let peek = (ahead = 0 as int): chr => que[ahead] || NUL

  // get next character
  let next = (): chr => (NUL == peek() ? NUL : que.shift()!)

  // is the character c?
  let is = (c: chr, ahead = 0 as int): bol => c == peek(ahead)

  // push a string into the queue
  let push = (s: str) => {
    for (let c of s.split('').reverse()) que.unshift(c)
  }

  // skip a few
  let skip = (n = 1 as int) => {
    while (0 < n--) next()
  }

  // a complete line
  let nextLine = (): str => {
    let c: chr,
      s = ''
    while (NL != (c = next())) s += c
    return s
  }

  // does the character pass a test?
  let isTest = (c: chr, test: (c: chr) => bol): bol => test(c)

  let isNumChar = (ahead = 0 as int): bol =>
    isTest(peek(ahead), (c: chr) => '0' <= c && c <= '9')

  let isIdentChar = (ahead = 0 as int, asFirst: bol = false): bol =>
    isTest(
      peek(ahead),
      (c: chr) =>
        ('a' <= c && c <= 'z') ||
        ('A' <= c && c <= 'Z') ||
        ('0' <= c && c <= '9') ||
        '_' == c ||
        (!asFirst && '-' == c),
    )

  let isWhite = (ahead = 0 as int): bol =>
    // NL does not count
    isTest(peek(ahead), (c: chr) => ' ' == c || '\t' == c)

  let skipWhite = (): bol => {
    let skipped = false
    while (isWhite()) {
      next()
      skipped = true
    }
    return skipped
  }

  let skipLine = () => {
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
    is,
    push,
    skip,
    nextLine,
    isNumChar,
    isIdentChar,
    isWhite,
    skipWhite,
    skipLine,
    match,
    matchs,
    nextNumber,
    ident,
    token,
    lineRest,
  }
}
