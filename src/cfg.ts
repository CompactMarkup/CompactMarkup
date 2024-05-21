import type { Tokenizer } from './tokenizer'

// meaningful characters - configuration
export type Chr = {
  cmt: chr // comment
  h: chr // header
  hr: chr // horizontal rule
  p: chr // paragraph
  ul: chr // unordered list
  ol: chr // ordered list
  pre: chr // preformatted
  sec: chr // section
  cls: chr // class
  hook: str // hook
  raw: chr // raw text
  esc: chr //  escape character
  th: chr // table header
  td: chr // table data
  b: chr // bold
  em: chr // emphasis
  u: chr // underline
  sup: chr // superscript
  sub: chr // subscript
  code: chr // code
  macro: chr // macro definition
  squo: chr // single quote
  dquo: chr // double quote
}

// default settings
export default (): Chr => ({
  cmt: '#',
  h: '=',
  hr: '-',
  p: '.',
  ul: '-',
  ol: '*',
  pre: '~',
  sec: '-',
  cls: '.',
  hook: '{|}',
  raw: '', // not switched on
  esc: '\\',
  th: '[]',
  td: '()',

  // no defaults, must be set with @chr
  b: '',
  em: '',
  u: '',
  sup: '',
  sub: '',
  code: '',
  macro: '',
  squo: '',
  dquo: '',
})

let doPragma = (chr: Chr, tok: Tokenizer) => {
  tok.next()
  let tag = inp.token()
  inp.skipWhite()
  let what = inp.token()
  inp.skipWhite()
  let par = inp.lineRest()

  if (cm.pragma?.(tag, what, par)) return
  switch (tag) {
    case 'push': {
      _chrs.push(JSON.parse(JSON.stringify(chr)))
      break
    }
    case 'pop': {
      if (_chrs.sz) chr = _chrs.pop()!
      break
    }
    case 'chr':
      switch (what) {
        case 'cmt':
          chr.cmt = par
          break
        case 'h':
          chr.h = par
          break
        case 'hr':
          chr.hr = par
          break
        case 'p':
          chr.p = par
          break
        case 'ul':
          chr.ul = par
          break
        case 'ol':
          chr.ol = par
          break
        case 'pre':
          chr.pre = par
          break
        case 'sec':
          chr.sec = par
          break
        case 'cls':
          chr.cls = par
          break
        case 'hook':
          chr.hook = par
          break
        case 'hraw':
          chr.hraw = par
          break
        case 'esc':
          chr.esc = par
          break
        case 'b':
          chr.b = par
          break
        case 'em':
          chr.em = par
          break
        case 'u':
          chr.u = par
          break
        case 'sup':
          chr.sup = par
          break
        case 'sub':
          chr.sub = par
          break
        case 'code':
          chr.code = par
          break
        case 'macro':
          chr.macro = par
          break
        case 'th':
          chr.th = par
          break
        case 'td':
          chr.td = par
          break
        case 'squo':
          chr.squo = par
          break
        case 'dquo':
          chr.dquo = par
          break
        default:
      }
      inp.skipLine()
      break
    case 'def':
      macros[what] = par
      break
  }
}
