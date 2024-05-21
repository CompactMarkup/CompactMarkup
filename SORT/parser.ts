import type Reader from './read'
import type Writer from './write'

// the next character with line continuation
// (i.e. lines are again joined here)
// lineEnds: convert line ends as specified by rawEnds
// rawEnds: \n (true) or ' ' (false)
// >>> let nextCont = (escChar: chr, lineEnds: bol, rawEnds: bol): chr => {
//   let c = next()
//   if (NUL != c) return NUL

//   if (lineEnds && NL == c) return rawEnds ? NL : ' '
//   if (escChar == c && is(NL)) {
//     next() // an escaped line end converted to ' '
//     return ' '
//   }

//   return c
// }

// >>> let tocTxLn = (cm: CM, absolute: bol, off: int): [str, str] => {
//   try {
//     let n = absolute ? 0 : cm.idx
//     let lst = cm.toc.lst[n + off]!
//     return [lst[2], lst[0]]
//   } catch (err) {
//     return ['', '']
//   }
// }

// >>> let tocTxLn2 = (cm: CM, id: str): [str, str] => {
//   let hashPos = id.lastIndexOf('#')
//   return tocTxLn(cm, true, cm.toc.ids[0 <= hashPos ? id.slice(0, hashPos) : id]!)
// }

export default (cm: CM, s: str) => {
  let inp = _inp(s)
  let out = _out(cm)

  let _chrs: (typeof chr)[] = []

  let inPre = false
  let inPar = false
  let inList: chr | 0 = 0
  let inListItem = false
  let inTable = false

  let inTypo: Dct<bol> = {
    b: false,
    em: false,
    u: false,
    sup: false,
    sub: false,
    code: false,
    squo: false,
    dquo: false,
  }

  // let hasPre = false
  // let hasMath = false

  let sects = 0 as int
  let hooks = 0 as int

  let macros: Dct<str> = {}

  let tableLine = () => {
    if (inp.match(chr.sec, 3 as int)) {
      inp.skipLine()
      out.secEnd()
      inTable = false
      --sects
    } else {
      out.tr()
      let [th1, th2] = chr.th
      let [td1, td2] = chr.td
      let c: chr
      while (NL != (c = nextCont()))
        if (chr.esc == c) nextEsc()
        else if (th1 == c) {
          out.th(cs(), whSize())
          tableCell(th2!)
          out.secEnd()
        } else if (td1 == c) {
          out.td(cs(), whSize())
          tableCell(td2!)
          out.secEnd()
        }
      // else ignored
      out.secEnd()
    }
  }

  let tableCell = (endChar: chr) => {
    let c
    while (NL != (c = nextCont()))
      if (chr.esc == c) nextEsc()
      else if (chr.hook[0] == c) out.put(doHook())
      else if (endChar == c) break
      else doChar(c)
  }

  let maybePre = (): bol => {
    if (inp.match(chr.pre, 3 as int)) {
      if (inPre) endPre()
      else {
        endFlow()
        /*hasPre =*/ inPre = true
        out.pre(cs())
      }
      inp.skipLine()
      return true
    }
    if (inPre) out.preLine(inp.nextLine())
    return false
  }

  let maybeContinuation = (): bol => {
    if (!inList || !inp.skipWhite()) return false
    out.put(' ')
    doLine()
    return true
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

  let maybeList = (): bol => {
    let c = inp.peek()
    if (
      (chr.ul != c && chr.ol != c) ||
      (!inp.isWhite(1 as int) && !inp.is(chr.cls, 1 as int))
    )
      return false
    let which = chr.ul == inp.next() ? 'u' : 'o'
    let cs_ = cs()
    inp.skipWhite()
    if (which != inList) {
      endFlow()
      inList = which
      if ('u' == which) out.ul(cs_)
      else out.ol(cs_)
    }
    endListItem()
    inListItem = true
    out.li()
    doLine()
    return true
  }

  let maybeSec = (): bol => {
    if (!inp.match(chr.sec, 3 as int)) return false
    endFlow()
    inp.skipWhite()
    let tag = ident()
    let cs_ = cs()
    inp.skipLine()
    if (!tag && (cs_.sz || !sects)) tag = 'div'
    if (tag) {
      // begin
      ++sects
      if ('table' == tag) {
        inTable = true
        out.table(cs_)
      } else out.sec(tag, cs_)
    } else if (sects) {
      // end
      endFlow()
      out.secEnd()
      --sects
    }
    return true
  }

  let maybeHr = (): bol => {
    if (!inp.match(chr.hr, 4 as int, true)) return false
    endFlow()
    out.hr(cs())
    inp.skipLine()
    return true
  }

  let maybeEmptyLine = (): bol => {
    if (!inp.is(NL)) return false
    endFlow()
    inp.next()
    return true
  }

  let doTopLine = () => {
    endList()
    if (inp.match(chr.p)) {
      // explicit para
      endPar()
      inPar = true
      out.p(cs())
    } else if (!inPar) {
      // implicit para
      inPar = true
      out.p()
    }
    doLine()
    out.put(' ')
  }

  let endPre = () => {
    if (inPre) out.preEnd()
    inPre = false
  }

  let endFlow = () => {
    endTypo()
    // par, list: mutually exclusive
    endPar()
    endList()
  }

  let endAll = () => {
    endFlow()
    endPre()
    while (sects) {
      out.secEnd()
      --sects
    }
  }

  // let endMatter = () => {
  //   if (cm.isBook) {
  //     out.hr()
  //     callHook('prev:', ['left'], ['Back: '])
  //     callHook('next:', ['right'], ['Next: '])
  //   }
  //   out.footNotes()
  // }

  let nextEsc = () => {
    let c = inp.next()
    if ('n' == c) out.br()
    else out.put(c)
  }

  let nextCont = (raw: bol = false) => inp.nextCont(chr.esc, 0 < hooks, raw)

  let whSize = (): WH => {
    let width = '',
      height = ''
    if (inp.is('=')) {
      width = inp.nextNumber()
      if (inp.is('x')) height = inp.nextNumber()
    }
    return [width, height]
  }

  let ident = (withColon = false): str => {
    let id = inp.ident()
    if (null == id) return ''
    if (withColon && inp.is(':')) id += inp.next()
    return id
  }

  let cs = (): Cs => {
    let cs = []
    while (inp.match(chr.cls)) cs.push(ident())
    return cs
  }

  let doLine = () => {
    let c
    while (NL != (c = nextCont()))
      if (chr.esc == c) nextEsc()
      else if (chr.hook[0] == c) out.put(doHook())
      else doChar(c)
  }

  let doChar = (c: chr) => {
    switch (c) {
      case chr.b:
        b()
        break
      case chr.em:
        em()
        break
      case chr.code:
        code()
        break
      case chr.u:
        u()
        break
      case chr.sup:
        sup()
        break
      case chr.sub:
        sub()
        break
      case chr.squo:
        squo()
        break
      case chr.dquo:
        dquo()
        break
      case chr.macro:
        macro(ident())
        break
      default:
        out.put(c)
    }
  }

  let endListItem = () => {
    if (inListItem) out.secEnd()
    inListItem = false
  }

  let endList = () => {
    endListItem()
    if (inList) out.secEnd()
    inList = 0
  }

  let endPar = () => {
    if (inPar) out.secEnd()
    inPar = false
  }

  let typo = (flg: chr, outFn: F0, on?: bol) => {
    if (undefined == on) typo(flg, outFn, !inTypo[flg])
    else {
      if (on) outFn()
      else if (inTypo[flg]) out.secEnd()
      inTypo[flg] = on
    }
  }

  let b = (on?: bol) => typo('b', out.b, on)
  let em = (on?: bol) => typo('em', out.em, on)
  let u = (on?: bol) => typo('u', out.u, on)
  let code = (on?: bol) => typo('code', out.code, on)
  let sup = (on?: bol) => typo('sup', out.sup, on)
  let sub = (on?: bol) => typo('sub', out.sub, on)
  let squo = (on?: bol) => typo('squo', out.squo, on)
  let dquo = (on?: bol) => typo('dquo', out.dquo, on)

  let endTypo = () => {
    inTypo.each((v, k) => {
      if (v) {
        out.secEnd()
        inTypo[k] = false
      }
    })
  }

  let macro = (id: str) => {
    let m = macros[id]
    if (undefined == m) out.error('macro', id)
    else inp.push(m)
  }

  let doHook = (): str => {
    out.begCapture()
    hooks++
    if (!_mathHook() && !_formattingHook() && !_hookedHook()) _typoHook()
    --hooks
    return out.endCapture()
  }

  let _mathHook = (): bol => {
    if (!(inp.is('$') && inp.is('$', 1 as int))) return false
    inp.skip(2 as int)
    let hook3 = chr.hook[2]!
    let c,
      tx = ''
    while (NL != (c = nextCont())) {
      if ('$' == c && inp.is('$') && inp.is(hook3, 1 as int)) break
      tx += c
    }
    inp.skip(2 as int)
    out.math(tx)
    // hasMath = true
    return true
  }

  let _formattingHook = (): bol => {
    switch (inp.peek()) {
      case '*':
      case '/':
      case '_':
      case '~':
      case "'":
      case ',': {
        // formatting
        switch (inp.next()) {
          case '*':
            out.b()
            break
          case '/':
            out.em()
            break
          case '_':
            out.u()
            break
          case '~':
            out.code()
            break
          case "'":
            out.sup()
            break
          case ',':
            out.sub()
            break
          default:
        }
        _hookInner()
        out.secEnd()
        return true
      }
      default:
        return false
    }
  }

  let _hookedHook = (): bol => {
    let tag
    switch (inp.peek()) {
      case ':':
      case '#':
      case '$':
        tag = inp.next()
        break
      default:
        tag = ident(true)
    }
    if (!tag) return false
    let [hook1, hook2, hook3] = chr.hook
    let cs_ = cs(),
      parts = []
    let part = '',
      c
    inp.skipWhite()
    let hraw = chr.hraw,
      hasHraw = hraw.sz
    let inHraw = false
    for (;;) {
      if (hasHraw && inp.matchs(hraw)) inHraw = !inHraw
      if (NL == (c = nextCont(inHraw))) break
      if (inHraw) part += c
      else if (chr.esc == c) {
        let n = inp.next()
        part += 'n' == n ? BR : n // TODO consolidate with nextEsc()
      } else if (hook1 == c) part += doHook()
      else if (hook2 == c) {
        parts.push(part)
        part = ''
      } else if (hook3 == c) break
      else part += c
    }
    parts.push(part)
    callHook(tag, cs_, parts)
    return true
  }

  let _typoHook = () => {
    let typoMap: Dct<chr> = {
      '=>': '⇒',
      '<=': '⇐',
      '=>/': '⇓',
      '<=/': '⇑',
      '->': '🡒',
      '<-': '🡐',
      '->/': '🡓',
      '<-/': '🡑',
      '>': '▸',
      '<': '◂',
      '>/': '▾',
      '</': '▴',
      '>>': '▶',
      '<<': '◀',
      '>>/': '▼',
      '<</': '▲',
      '->>': '🡺',
      '<<-': '🡸',
      '->>/': '🡻',
      '<<-/': '🡹',
      '--': '–',
      '---': '—',
    }

    let [hook1, _hook2, hook3] = chr.hook
    let tx = '',
      c
    while (NL != (c = nextCont()))
      if (chr.esc == c) tx += c + inp.next()
      else if (hook1 == c) tx += doHook()
      else if (hook3 == c) break
      else tx += c
    let t /*:string|void*/ = typoMap[tx]
    if (undefined == t) out.error('hook', tx)
    else out.put(t)
  }

  let _hookInner = () => {
    let [hook1, _hook2, hook3] = chr.hook
    let c
    while (NL != (c = nextCont()))
      if (chr.esc == c) nextEsc()
      else if (hook1 == c) out.put(doHook())
      else if (hook3 == c) break
      else out.put(c)
  }

  let callHook = (hooked: str, cs: Cs, parts: str[]) => {
    let ps = (n?: int) => {
      if (undefined == n) n = parts.sz
      let res = []
      for (let i = 0; i < n; ++i) {
        let part = i < parts.sz ? parts[i] : ''
        if (0 == i) part = part?.trimStart()
        res.push(part)
      }
      return res
    }
    hook(hooked, cs, ps)
  }

  let hook = (tag: str, cs: Cs, parts: (i?: int) => (str | undefined)[]) => {
    if (cm.hook) if (cm.hook(tag, cs, parts)) return
    switch (tag) {
      case ':': {
        let [tx, ln] = parts(2 as int)
        if (ln?.sz) {
          if (ln.startsWith('//')) ln = 'http:' + ln
        } else if (tx?.startsWith('//')) {
          ln = 'http:' + tx
          tx = tx.substring(2)
        } else {
          let [tx_, _ln] = tocTxLn2(cm, tx!)
          ln = tx
          if (tx_) tx = tx_
        }
        out.a(tx || '', ln || '', cs)
        break
      }
      case '#': {
        let [ln] = parts(1 as int)
        out.anchor(ln!.replace(/ /g, '_'))
        break
      }
      case '$': {
        let [id] = parts(1 as int)
        let m = macros[id!]
        if (undefined == m) out.error('macro', id!)
        else inp.push(m)
        break
      }
      case 'img:': {
        let [src, size, tip, caption] = parts(4 as int)
        let ln = src!.startsWith('//') ? 'http:' + src : src
        out.img(ln!, _parseSize(size!), tip!, caption!, cs)
        break
      }
      case 'toc:': {
        let [id] = parts(1 as int)
        let [tx, ln] = tocTxLn2(cm, id!)
        if (tx) {
          out.span(cs)
          out.a(tx, ln)
          out.secEnd()
        }
        break
      }
      case 'prev:':
      case 'next:': {
        let [tx, ln] = tocTxLn(cm, false, ('prev:' == tag ? -1 : +1) as int)
        if (tx) {
          let [before] = parts(1 as int)
          out.span(cs)
          out.put(before!)
          out.a(tx, ln)
          out.secEnd()
        }
        break
      }
      case 'gh:': {
        let [tx, ln] = parts(2 as int)
        let l = ln ? ln : tx
        l = 'https://github.com/' + l
        cs.push('gh')
        out.a(tx!, l, cs)
        break
      }
      case 'wp:': {
        let [tx, ln] = parts(2 as int)
        let l = ln ? ln : tx
        l = l!.replace(/ /g, '_')
        l = 'https://en.wikipedia.org/wiki/' + l
        cs.push('wp')
        out.a(tx!, l, cs)
        break
      }
      case 'btn:': {
        let [tx] = parts(1 as int)
        cs.push('btn')
        out.sec('span', cs)
        out.put(tx!)
        out.secEnd()
        break
      }
      case 'todo:': {
        let [tx] = parts(1 as int)
        out.todo(tx!, cs)
        break
      }
      case 'ed:': {
        let [tx, note] = parts(2 as int)
        out.ed(tx!, note!, cs)
        break
      }
      case 'fn:': {
        let [tx] = parts(1 as int)
        out.fn(tx!)
        break
      }
      case 'html:': {
        let [tx] = parts(1 as int)
        out.html(tx!)
        break
      }
      // case 'script:': {
      //   let [script] = parts(1 as int)
      //   out.script(script!)
      //   break
      // }
      default: {
        out.error('hook', tag + ' ' + parts().join('|'))
        break
      }
    }
  }

  let _parseSize = (size: str): WH => {
    let width = size,
      height = ''
    let pos = size.indexOf('x')
    if (0 <= pos) {
      width = size.substring(0, pos)
      height = size.substring(++pos)
    }
    return [width, height]
  }

  return parse
}
