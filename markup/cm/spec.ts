export type WH = [str, str]
// classes
export type Cs = str[]

export let encHtml = (c: chr): str =>
  (LT == c && '<') ||
  (AMP == c && '&') ||
  ('<' == c && '&lt;') ||
  ('&' == c && '&amp;') ||
  (BR == c && '<br/>') ||
  c

export let encRaw = (c: chr): chr => ('<' == c && LT) || ('&' == c && AMP) || c

// footnotes
type Fns = [int, str][]

// adapter
//>>> see CM  = window.CompactMarkup
export type CM = {
  fns: Fns
  isBook: bol
  link: (ln: str) => str
  gotoLink: (ln: str, anchor: str, target: str) => str
  idx: int
  toc: {
    lst: []
    ids: Dct<int>
  }
  pragma?: (tag: str, what: str, par: str) => bol
  hook?: (tag: str, what: any, parts: (i: int) => (str | undefined)[]) => bol
  debug?: bol
}
