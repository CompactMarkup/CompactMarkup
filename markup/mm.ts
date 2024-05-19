// Minimal Markup

type ValCb = (tag: str, img: str, val: str) => str
type ImgCb = (src: str) => str
type LinkCb = (text: str, href: str, loc?: (url: str) => str) => str

export type Cb = {
  val?: ValCb
  img?: ImgCb
  link?: LinkCb
}

let defLoc = (url: str) => url

let defCb: Cb = {
  val: (tag) => tag,
  img: (src) => src,
  link: (text, href, loc) => {
    if (!href.includes('://')) href = (loc || defLoc)(href)
    href = JSON.stringify(href)
    return `<a target="_blank" href=${href}/>${text}</a>`
  },
}

let parse = (tx: str, cb: Cb = {}): str => {
  cb = {
    ...defCb,
    ...cb,
  }

  // lists, paragraph, result
  let p = '',
    ul = '',
    ol = '',
    tbl = '',
    res = ''

  let flushLists = () => {
    if (ul) {
      p += `<ul>${ul}</ul>`
      ul = ''
    }
    if (ol) {
      p += `<ol>${ol}</ol>`
      ol = ''
    }
  }

  let flushTable = () => {
    if (tbl) {
      p += `<table>${tbl}</table>`
      tbl = ''
    }
  }

  let flushAll = () => {
    flushLists()
    flushTable()
    flushP()
  }

  let flushP = () => {
    if (p) {
      res += `<p>${p}</p>`
      p = ''
    }
  }

  let starts = (tag: str, line: str) =>
    !line.startsWith(tag) ? '' : line.substring(tag.sz).trim()

  let first = (tag: str, line: str) => line.startsWith(tag)

  let addEl = (h: str) => {
    flushAll()
    res += h
  }

  let nDiv = 0

  let div = (line: str) => {
    let l: str
    if ((l = starts('{{', line))) {
      let cl: any = []
      if (l.includes('::')) cl.push('j')
      else if (l.includes(':')) cl.push('c')
      if (l.includes('>')) cl.push('r')
      if (l.includes('*')) cl.push('b')
      if (l.includes('/')) cl.push('i')
      if ((cl = cl.join(' '))) cl = ` class="${cl}"`
      addEl(`<div${cl}>`)
      ++nDiv
    } else if (first('}}', line)) {
      --nDiv
      addEl('</div>')
    } else return false
    return true
  }

  let header = (line: str) => {
    let l: str
    if ((l = starts('###', line))) addEl(`<h3>${l}</h3>`)
    else if ((l = starts('##', line))) addEl(`<h2>${l}</h2>`)
    else if ((l = starts('#', line))) addEl(`<h1>${l}</h1>`)
    else return false
    return true
  }

  let hr = (line: str) => {
    if (first('---', line)) addEl(`<hr/>`)
    else return false
    return true
  }

  let uli = (line: str) => {
    let l: str
    if ((l = starts('*', line))) {
      flushP()
      ul += `<li>${l}</li>`
    } else return false
    return true
  }

  let oli = (line: str) => {
    let l: str
    if ((l = starts('+', line))) {
      flushP()
      ol += `<li>${l}</li>`
    } else return false
    return true
  }

  let table = (line: str) => {
    if (starts('|', line)) {
      flushP()
      let t = '',
        span: any = 1
      line
        .split('|')
        .slice(1)
        .each((_) => {
          if ('-' == _.trim()) {
            ++span
          } else {
            let l: str,
              cl = ''
            if ((l = starts(':', _))) {
              cl = 'c'
            } else if ((l = starts('>', _))) {
              cl = 'r'
            } else {
              l = _
            }

            if (1 < span) {
              span = ` colspan="${span}"`
            } else {
              span = ''
            }

            if (cl) cl = ` class="${cl}"`
            t += `<td${cl}${span}>${l.trim()}</td>`
            span = 1
          }
        })
      tbl += '<tr>' + t + '</tr>'
      return true
    }
    return false
  }

  let plain = (line: str) => {
    flushLists()
    flushTable()
    line = line.trim()
    if (!line) flushP()
    else p += line + ' '
    return true
  }

  // sanitize <, &
  tx = tx.replace(/&/gu, '&amp;').replace(/</gu, '&lt;')

  // sanitize end-of-lines, do simple markup
  tx = tx
    .split('\n')
    .map(
      (line) =>
        line
          .trimEnd()
          .replace(/\\\\/gu, '<br/>') // br
          .replace(/\*\*(.*?)\*\*/gu, '<b>$1</b>') // **bold**
          .replace(/\/\/(.*?)\/\//gu, '<em>$1</em>') // //italics//
          .replace(/__(.*?)__/gu, '<u>$1</u>') // __underline__
          .replace(/~~(.*?)~~/gu, '<code>$1</code>') // ~~code~~
          .replace(/([^-])--([^-])/gu, '$1&mdash;$2') // m-dash
    )
    .join('\n')

  tx = tx.replace(
    /\(\(\(([\s\S]*?)\|([^\|]*)\|([\s\S]*?)\)\)\)/gu, // (((tag|img|val)))
    (_, tag, img, val) =>
      cb.val!(tag.trim(), img.trim(), val.replace(/\n/g, '0x01'))
  )

  // split to lines and process
  tx.split('\n').map((line) => {
    line = line.replace(/0x01/g, '\\n')
    if (div(line) || hr(line)) return
    line = line
      .trimEnd()
      .replace(
        /\[\[(.*)\]\]/gu, // [[image (|width)]]
        (_, img) => {
          let [src, w] = img.split('|')
          let style = w ? ` style="width:${w.trim()}"` : ''
          return `<img${style} src="${cb.img!(src.trim())}" alt=""/>`
        }
      )
      .replace(
        /\(\((.*)\|(.*)\)\)/gu, // ((text|link))
        (_, text, link) => cb.link!(text.trim(), link.trim())
      )
    header(line) || uli(line) || oli(line) || table(line) || plain(line)
  })

  flushAll()
  while (0 < nDiv--) res += '</div>'
  return res.replace(/\x01/g, '<')
}

export default parse
