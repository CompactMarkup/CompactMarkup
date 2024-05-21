import Tok from './tokenizer'
import type { Tokenizer } from './tokenizer'

export interface Parser {
  parse(): void
}

export default (tok: Tokenizer): Parser => {
  let parse = () => {
    for (let c; (c = tok.get()); ) {
      // case inTable:
      //   tableLine()
      //   break
      // case inPre:
      //   maybePre()
      //   break
      // case inList && maybeContinuation():
      //   break
      // default: {
      if ('@' == c) {
        doPragma()
        continue
      }
      //     case chr.cmt == c:
      //       doComment()
      //       break
      //     case chr.h == c && maybeHeader():
      //       break
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

    // endAll()

    // return out.outTx()
  }

  return {
    parse,
  }
}
