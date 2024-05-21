// reader adapter for strings
import { NL, NUL } from './spec'
import './typs'

type Reader = {
  get: (ahead?: num) => chr
  next: () => chr
  skip: (n?: num) => void
  is: (c: chr, ahead?: num) => bol
  push: (head: str) => void
  nextLine: () => str
  isNumChar: (ahead?: num) => bol
  isIdentChar: (ahead?: num, asFirst?: bol) => bol
  isWhite: (ahead?: num) => bol
  skipWhite: () => bol
  skipLine: () => void
  match: (c: chr, n?: num, atLeast?: bol) => num
  matchs: (s: str) => bol
  nextNumber: () => str
  ident: () => str
  token: () => str
  lineRest: () => str /*  */
}

export default (sss: str): Reader => {
  // trim lines
  sss = sss
    .normalize()
    .split(NL)
    .map((l) => l.trimEnd())
    .join(NL)

  // ensure NL at the end
  sss.endsWith(NL) || (sss += NL)

  // array of characters (to deal with unicode)
  let cs = [...sss]
  let i = 0

  let _trim = () => {
    cs.slice(i)
    i = 0
  }

  // get ahead
  let get = (ahead = 0): chr => cs[i + ahead] || NUL
  let _isEnd = () => NUL == get()

  // get next character
  let next = (): chr => (NUL == get() ? NUL : cs[i++]!)

  // skip a few
  let skip = (n = 1) => {
    i += n
  }

  // is the character c?
  let is = (c: chr, ahead = 0): bol => c == get(ahead)

  // push a string into the queue
  let push = (head: str) => {
    _trim()
    cs = [...head, ...cs]
  }

  let _join = (start: num, padEnd = 0) => cs.slice(start, i - padEnd).join('')

  // a complete line
  let nextLine = (): str => {
    if (_isEnd()) return NUL
    let start = i
    while (NL != cs[i++]);
    return _join(start, 1)
  }

  // does the character pass a test?
  let _isTest = (c: chr, test: (c: chr) => bol): bol => test(c)

  let isNumChar = (ahead = 0): bol => _isTest(get(ahead), (c: chr) => '0' <= c && c <= '9')

  let isIdentChar = (ahead = 0, asFirst: bol = false): bol =>
    _isTest(
      get(ahead),
      (c: chr) =>
        ('a' <= c && c <= 'z') ||
        ('A' <= c && c <= 'Z') ||
        ('0' <= c && c <= '9') ||
        '_' == c ||
        (!asFirst && '-' == c),
    )

  let isWhite = (ahead = 0): bol =>
    // NL does not count
    _isTest(get(ahead), (c: chr) => ' ' == c || '\t' == c)

  let skipWhite = (): bol => {
    let start = i
    while (isWhite()) ++i
    return start < i
  }

  let skipLine = () => {
    while (NL != next());
  }

  // match (exactly or atLeast) n "c" characters; return how many
  let match = (c: chr, n = 1, atLeast: bol = false): num => {
    let i = 0
    while (is(c, i)) ++i
    if (n != i && !(atLeast && n < i)) return 0

    skip(i)
    return i
  }

  // match a string
  let matchs = (s: str): bol => {
    let i = 0
    for (let c of s) if (!is(c, i++)) return false
    skip(i)
    return true
  }

  let nextNumber = (): str => {
    next()
    let start = i
    while (isNumChar()) ++i
    return _join(start)
  }

  let ident = (): str => {
    let start = i
    if (isIdentChar(0, true)) while (isIdentChar()) ++i
    return _join(start)
  }

  let token = (): str => {
    let start = i
    while (!(is(NL) || isWhite())) ++i
    return _join(start)
  }

  let lineRest = (): str => {
    let start = i
    while (!is(NL)) ++i
    return _join(start).trim()
  }

  return {
    get,
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
