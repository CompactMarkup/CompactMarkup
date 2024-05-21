// meaningful characters - configuration
export default () => ({
  pragma: '@', // pragma
  cmt: '#', // comment
  h: '=', // header
  hr: '-', // horizontal rule
  p: '.', // paragraph
  ul: '-', // unordered list
  ol: '*', // ordered list
  pre: '~', // preformatted
  sec: '-', // section
  cls: '.', // class
  hook: '{|}', // hook
  raw: '', // raw text (default: off)
  esc: '\\', // escape character
  th: '[]', // table header
  td: '()', // table data

  // no defaults, must be set with @chr
  b: '', // bold
  em: '', // emphasis
  u: '', // underline
  sup: '', // superscript
  sub: '', // subscript
  code: '', // code
  macro: '', // macro definition
  squo: '', // single quote
  dquo: '', // double quote
})
