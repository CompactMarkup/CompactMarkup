export let NUL = '\0'
export let NL = '\n'

export interface Input {
  get: (ahead?: num) => chr // get the character ahead
  next: () => chr // get the character and advance
  skip: (n?: num) => void // skip n characters
  push: (head: str) => void // push a string back
  take: (n: num) => str // take n characters
}

// utilities
export default {
  // does the character pass a test?
  is: (c: chr, test: (c: chr) => bol): bol => test(c),
  // is white?
  isWhite: (c: chr) => ' \t\n'.includes(c),
  // prepare
  prepare: (s: str): str => {
    // trim lines
    s = s
      .normalize()
      .split(NL)
      .map((l) => l.trimEnd())
      .join(NL)
    // ensure NL at the end
    s.endsWith(NL) || (s += NL)
    return s
  },
}
