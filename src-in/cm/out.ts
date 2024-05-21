import { LT, encHtml, encRaw } from './spec'
import type { CM, Cs, WH } from './spec'

// HTML generator
let htmlGen = () => {
  // captured output
  let _capture: str | null = null
  // the stack of captured output
  let _captures: str[] = []
  // output text
  let _outTx = ''

  let begCapture = () => {
    if (null !== _capture) _captures.push(_capture)
    _capture = ''
  }

  let endCapture = (): str => {
    let res = _capture!
    _capture = _captures.pop() ?? null
    return res
  }

  let put = (tx: str) => {
    if (null == _capture) {
      let res = ''
      for (let c of tx) res += encHtml(c)
      _outTx += res
    } else _capture += tx
  }

  let _putRaw = (tx: str) => {
    if (null == _capture) put(tx)
    else {
      let res = ''
      for (let c of tx) res += encRaw(c)
      _capture += res
    }
  }

  let outTx = (): str => _outTx

  let _attr = (name: str, val: str | num): str =>
    val ? ` ${name}=${JSON.stringify(val)}` : ''

  let _cls = (cs: Cs): str => _attr('class', cs.length ? cs.join(' ') : '')

  let _tag = (tag: str, cs: Cs = [], extra: str, closed: bol): str =>
    `${LT}${tag}${_cls(cs)}${extra}${closed ? '/' : ''}>`

  let _endTag = (tag: str): str => `${LT}/${tag}>`

  let html = (tx: str) => _putRaw(tx)

  return { begCapture, endCapture, put, outTx, html, _tag, _endTag, _attr }
}

// output

let $ = (cm: CM) => {
  let gen = htmlGen()
  // ends of nested structures
  let _ends: str[] = []
  // *collected* footnotes

  let put = gen.put
  let begCapture = gen.begCapture
  let endCapture = gen.endCapture
  let outTx = gen.outTx
  let html = gen.html

  let putTag = (tag: str, cs: Cs = [], extra: str = '', closed: bol = false) => {
    gen.put(gen._tag(tag, cs, extra, closed))
  }

  let putEndTag = (tag: str) => gen.put(gen._endTag(tag))

  let sec = (tag: str, cs: Cs = [], extra: str = '') => {
    putTag(tag, cs, extra)
    _ends.push(gen._endTag(tag))
  }

  let secEnd = () => gen.put(_ends.pop()!)

  let table = (cs: Cs = []) => sec('table', cs)

  let tr = () => sec('tr')

  let _thd = (tag: str, cs: Cs, wh: WH | null) => {
    let extra = ''
    if (null !== wh) {
      let [w, h] = wh
      if (w) extra += ` colspan="${w}"`
      if (h) extra += ` rowspan="${h}"`
    }
    sec(tag, cs, extra)
  }

  let th = (cs: Cs = [], wh: WH | null = null) => _thd('th', cs, wh)

  let td = (cs: Cs = [], wh: WH | null = null) => _thd('td', cs, wh)

  let pre = (cs: Cs = []) => {
    if (!cs.length) cs.push('nohighlight')
    sec('pre', cs)
    sec('code', cs)
  }

  let preEnd = () => {
    secEnd()
    secEnd()
  }

  let preLine = (tx: str) => {
    gen.put(tx)
    gen.put('\n')
  }

  let br = () => putTag('br', [], '', true)

  let h = (n: int, cs: Cs = []) => sec(`h${n}`, cs)

  let hr = (cs: Cs = []) => putTag('hr', cs, '', true)

  let p = (cs: Cs = []) => sec('p', cs)

  let ul = (cs: Cs = []) => sec('ul', cs)

  let ol = (cs: Cs = []) => sec('ol', cs)

  let li = () => sec('li')

  let b = () => sec('b')

  let em = () => sec('em')

  let u = () => sec('u')

  let code = () => sec('code', ['inline'])

  let sup = () => sec('sup')

  let sub = () => sec('sub')

  let squo = () => {
    gen.put('‘')
    _ends.push('’')
  }

  let dquo = () => {
    gen.put('“')
    _ends.push('”')
  }

  let div = (cs: Cs = [], extra: str = '') => sec('div', cs, extra)

  let span = (cs: Cs = []) => sec('span', cs)

  let box = (cs: Cs = []) => {
    cs.push('box')
    div(cs)
  }

  let img = (src: str, wh: WH, tip: str, caption: str, cs: Cs = []) => {
    let [width, height] = wh

    if (caption) div(['caption'])

    let a = gen._attr('src', link(src)) + gen._attr('title', tip)
    if (width) a += gen._attr('width', width)
    if (height) a += gen._attr('height', height)

    let pop = 0 <= cs.indexOf('pop')
    if (pop) {
      let l = link(src)
      let onClick = gen._attr(
        'onclick',
        `window.open('${l}','cm_pop','location=0, resizable=1, status=0, toolbar=0, menubar=0'); return false;`,
      )
      putTag('a', [], onClick)
    }
    putTag('img', cs, a)
    if (pop) putEndTag('a')

    if (caption) {
      br()
      gen.put(caption)
      secEnd()
    }
  }

  let link = (ln: str): str => (cm.isBook ? cm.link(ln) : ln)

  let gotoLink = (ln: str, anchor: str, target: str): str =>
    cm.isBook ? cm.gotoLink(ln, anchor, target) : ''

  let a = (tx: str, ln: str, cs: Cs = []) => {
    let extern = 0 <= ln.indexOf('://') || ln.startsWith('//')
    if (extern) cs.push('extern')
    let hashPos = ln.lastIndexOf('#')
    let anchor = ''
    if (0 <= hashPos) {
      if (tx === ln && 0 === hashPos) tx = tx.slice(1)
      anchor = ln.slice(hashPos).replace(/ /g, '_')
      ln = ln.slice(0, hashPos)
    }
    let trg = gen._attr('href', link(ln) + anchor),
      target = ''
    if (extern) trg += gen._attr('target', (target = 'cm_extern'))
    trg += gotoLink(ln, anchor, target)

    putTag('a', cs, trg)
    gen.put(tx)
    putEndTag('a')
  }

  let anchor = (ln: str) => {
    putTag('a', [], gen._attr('name', ln))
    putEndTag('a')
  }

  let math = (tx: str) => {
    span(['math'])
    gen.put(`(math((\\mathsf{${tx}}))math)`)
    secEnd()
  }

  let error = (what: str, tx: str) => {
    if (cm.debug) {
      span(['error'])
      gen.put('(!!!>' + what + ': ' + tx + '<!!!)')
      secEnd()
    }
  }

  let todo = (tx: str, cs: Cs = []) => {
    if (cm.debug) {
      cs.push('todo')
      span(cs)
      gen.put(tx)
      secEnd()
    }
  }

  let ed = (tx: str, note: str, cs: Cs = []) => {
    if (cm.debug) {
      cs.push('ed')
      span(cs)
      span(['tx'])
      gen.put(tx)
      secEnd()
      span(['note'])
      gen.put(note)
      secEnd()
      secEnd()
    } else gen.put(tx)
  }

  let fn = (tx: str) => {
    let n = (cm.fns.length + 1) as int
    cm.fns.push([n, tx])

    sup()
    anchor('fn' + n)

    putTag('a', [], ' onclick="CompactMarkup.scrollTo(\'#_fn' + n + '\')"')
    gen.put(n.toString())
    putEndTag('a')

    secEnd()
  }

  // >>>
  // let script = (script: str) => eval(script)

  let footNotes = () => {
    if (cm.fns.length) {
      hr(['paper'])
      box()
      gen.put('Footnotes:')
      ol(['none'])
      for (let [n, tx] of cm.fns) {
        li()
        anchor('_fn' + n)
        putTag('a', [], ' onclick="CompactMarkup.scrollTo(\'#fn' + n + '\')"')
        gen.put('[' + n + ']')
        putEndTag('a')
        gen.put(' ' + tx)
      }
    }
  }

  return {
    put,
    begCapture,
    endCapture,
    outTx,
    html,
    sec,
    secEnd,
    table,
    tr,
    th,
    td,
    pre,
    preEnd,
    preLine,
    br,
    h,
    hr,
    p,
    ul,
    ol,
    li,
    b,
    em,
    u,
    code,
    sup,
    sub,
    squo,
    dquo,
    div,
    span,
    box,
    img,
    a,
    anchor,
    math,
    error,
    todo,
    ed,
    fn,
    // script,
    footNotes,
  }
}

export default $
