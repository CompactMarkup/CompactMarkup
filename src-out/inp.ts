export let NUL = '\0'
export let NL = '\n'

export interface Input {
  get: (ahead?: num) => chr // get the character ahead
  is: (c: chr, ahead?: num) => bol // is the character c?
  isWhite: (ahead?: num) => bol // is the character white?
  next: () => chr // get the character and advance
  skip: (n?: num) => void // skip n characters
  skipWhite: () => void // skip white characters
  skipLine: () => void // skip to the end of the line
  push: (head: str) => void // push a string back
  take: (n: num) => str // take n characters
}

// allowed control characters
let _isCtrl = (c: chr) => '\t\n'.includes(c)
// whitespace (w/o NL)
let _isWhite = (c: chr) => ' \t'.includes(c)
// valid content
let _isValid = (c: chr) => 31 < c.charCodeAt(0) || _isCtrl(c)
// ensure valid content
let _sane = (cs: chr[]): chr[] => cs.filter(_isValid)

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
  let cs = _sane([...s])
  let i = 0

  let get = (ahead = 0): chr => cs[i + ahead] || NUL
  let is = (c: chr, ahead?: num) => c == get(ahead)
  let isWhite = (ahead?: num) => _isWhite(get(ahead))

  let next = (): chr => (++i, get(-1))

  let skip = (n = 1) => {
    i += n
  }

  let skipWhite = () => {
    while (isWhite()) ++i
  }

  let skipLine = () => {
    while (NL != next());
  }

  let push = (head: str) => {
    cs = _sane([...head]).concat(cs.slice(i))
    i = 0
  }

  let take = (n: num): str => cs.slice(i, (i = i + n)).join('')

  return {
    get,
    is,
    isWhite,
    next,
    skip,
    skipWhite,
    skipLine,
    push,
    take,
  }
}
