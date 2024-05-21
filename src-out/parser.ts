import Chr from './chr'
import type { CMBook } from './cm'
import type { Input } from './inp'
import Tok from './tokenizer'

export interface Parser {
  parse(): void
}

export default (inp: Input, cmb?: CMBook): Parser => {
  let tok = Tok(inp)

  let chr = Chr()
  let chrs: (typeof chr)[] = []

  let macros: Dct<str> = {}

  let doPragma = () => {
    inp.next() // skip @
    let tag = tok.token()
    let what = tok.token()
    let par = tok.rest()

    // cmbook adapter
    if (cmb?.pragma?.(tag, what, par)) return

    switch (tag) {
      case 'push':
        chrs.push({ ...chr })
        break

      case 'pop':
        if (chrs.length) chr = chrs.pop()!
        break

      case 'chr':
        if (what in chr) (chr as any)[what] = par
        break

      case 'def':
        macros[what] = par
        break
    }
  }

  let doComment = () => {
    inp.skipLine()
  }

  let maybeHeader = (): bol => {
    let n = inp.match(chr.h, 1 as int, true)
    if (!n) return false
    endFlow()
    out.h(n, cs())
    inp.skipWhite()
    doLine()
    out.secEnd()
    return true
  }

  let parse = () => {
    for (let c; (c = inp.get()); ) {
      switch (true) {
        // case inTable:
        //   tableLine()
        //   break
        // case inPre:
        //   maybePre()
        //   break
        // case inList && maybeContinuation():
        //   break
        case chr.pragma == c:
          doPragma()
          break
        case chr.cmt == c:
          doComment()
          break
        case chr.h == c && maybeHeader():
          break
        //     case (chr.ul == c || chr.ol == c) && maybeList():
        //       break
        //     case chr.pre == c && maybePre():
        //       break
        //     case chr.sec == c && maybeSec():
        //       break
        //     case chr.hr == c && maybeHr():
        //       break
        //     default:
        //       maybeEmptyLine() || doTopLine()
      }
    }
    // endAll()
    // return out.outTx()
  }

  return {
    parse,
  }
}
