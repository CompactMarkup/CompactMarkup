import parser from './cm/parser'
import type { CM } from './cm/spec'

let cm: CM = {
  fns: [],
  isBook: false,
  link: (ln: str) => ln,
  gotoLink: (ln: str, _anchor: str, _target: str) => ln,
  idx: 0 as int,
  toc: {
    lst: [],
    ids: {},
  },
}

let parse = (s: str): str => parser(cm, s)()

export default parse
