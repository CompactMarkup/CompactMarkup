// reader adapter for strings
import { NL, NUL } from './spec'

type Reader = {
  get: (ahead?: num) => chr
  next: () => chr
  skip: (n?: num) => void
  is: (c: chr, ahead?: num) => bol
  push: (head: str) => void
  nextLine: () => str
  isNumChar: (ahead?: num) => bol
  isIdentChar: (ahead?: num, asFirst?: bol) => bol
  skipWhite: () => bol
  skipLine: () => void
  match: (c: chr, n?: num, atLeast?: bol) => num
  matchs: (s: str) => bol
  nextNumber: () => str
  ident: () => str
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

  let _join = (start: num, padEnd = 0) => cs.slice(start, i - padEnd).join('')

  // a complete line
  let nextLine = (): str => {
    if (_isEnd()) return NUL
    let start = i
    while (NL != cs[i++]);
    return _join(start, 1)
  }

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

  let skipWhite = (): bol => {
    let start = i
    while (isWhite()) ++i
    return start < i
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
