import parser from './parser'
import type { CM } from './spec'
import { assert, test } from 'vitest'

let eq = assert.equal

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

let p = (s: str) => parser(cm, s)()

test('p', (t) => {
  eq('', p(''))
  eq('<p>P </p>', p('P'))
  eq('<p>P </p>', p('P \n'))
  eq('<p> P </p>', p(' P'))
  eq('<p>  P </p>', p('  P'))
  eq(
    '<p>Paragraph, still the same paragraph. </p><p>A new paragraph. On two source lines. </p><p>A paragraph without a blank line before it. </p><p>Another </p><p> This is not. </p>',
    p(
      'Paragraph,\nstill the same paragraph.\n\nA new paragraph.\nOn two source lines.\n.A paragraph without a blank line before it.\n.Another\n. This is not.',
    ),
  )
})

test('typo', (t) => {
  eq('<p> *B* </p>', p(' *B*'))
  eq('<p>a<b>B</b> </p>', p('@chr b *\na*B*'))
  eq('<p>a<b>B </b></p>', p('@chr b *\na*B'))
  eq('<p><b>*B </b></p>', p('@chr b a\na*B'))

  eq('<p><em>em</em> </p>', p('@chr em /\n/em/'))
  eq('<p><code class="inline">x </code></p>', p('@chr code ~\n~x'))

  eq('<p>‘q’ </p>', p("@chr squo '\n'q'"))
  eq('<p>“q” </p>', p('@chr dquo "\n"q"'))

  eq('<p><em>em</em> </p>', p('{/em}'))
  eq('<p><b>b</b> </p>', p('{*b}'))
  eq('<p><u>u</u> </p>', p('{_u}'))
  eq('<p><code class="inline">mono</code> </p>', p('{~mono}'))
  eq('<p><sup>sup</sup> </p>', p("{'sup}"))
  eq('<p><sub>sub</sub> </p>', p('{,sub}'))
  eq('<p><u>uu<sub>sub</sub>script</u> </p>', p('{_uu{,sub}script}'))
})

test('typohook', (t) => {
  eq('<p>🡒🡐⇒⇐▸◂–— </p>', p('{->}{<-}{=>}{<=}{>}{<}{--}{---}'))
})

test('pragma', (t) => {
  eq('', p('@toc cm;; Compact Markup'))
})

test('macro', (t) => {
  eq('<p>CM </p>', p('CM'))
  eq('<p>$CM </p>', p('@def CM Compact Markup\n$CM'))
  eq('<p>Compact Markup </p>', p('@def CM Compact Markup\n@chr macro $\n$CM'))
  eq('<p>Compact Markup </p>', p('@def CM Compact Markup\n@chr macro ?\n?CM'))
})

test('escape', (t) => {
  eq('<p>CMs </p>', p('CMs'))
  eq('<p>CMs </p>', p('CM\\s'))
  eq('<p>CM\\s </p>', p('@chr esc -\nCM\\s'))
  eq('<p>CMs </p>', p('@chr esc -\nCM-s'))
  eq('<p>li ne </p>', p('li\\\nne'))
  eq('<p>li<br/>ne </p>', p('li\\nne'))
})

test('comment', (t) => {
  eq('', p('# eof'))
  eq('<p> # eof </p>', p(' # eof'))
  eq('<p># eof </p>', p('\\# eof'))
})

test('h', (t) => {
  eq('<h1>h</h1>', p('=h'))
  eq('<h1>h</h1>', p('= h'))
  eq('<h2>h</h2>', p('== h'))
  eq('<h3>h</h3>', p('=== h'))
  eq('<h4>h</h4>', p('==== h'))
  eq('<h5>h</h5>', p('===== h'))
  eq('<h6>h</h6>', p('====== h'))
})

test('ln', (t) => {
  eq(
    '<p>(<a class="extern" href="http://es6-features.org/" target="cm_extern">ES6</a>) </p>',
    p('({:ES6|http://es6-features.org/})'),
  )
  eq(
    '<p><a class="extern" href="http://mutebook.me" target="cm_extern">mutebook.me</a> </p>',
    p('{://mutebook.me}'),
  )
  eq(
    '<p><a class="wp extern" href="https://en.wikipedia.org/wiki/markup_language" target="cm_extern">markup language</a> </p>',
    p('{wp: markup language}'),
  )
  eq(
    '<p><a class="gh extern" href="https://github.com/mutebook" target="cm_extern">here</a> </p>',
    p('{gh:here|mutebook}'),
  )
  eq('<p><a class="lc" href="cm_pragmas">cm_pragmas</a> </p>', p('{:.lc cm_pragmas}'))
  eq('<p><a href="link">name</a> </p>', p('{:name|link}'))
  eq('<p><a name="anchor"></a> </p>', p('{#anchor}'))
})

test('img', (t) => {
  eq('<p><img src="/assets/icon32.png"> </p>', p('{img:/assets/icon32.png}'))
  eq('<p><img src="img/timer.png"> </p>', p('{img:img/timer.png}'))
  eq('<p><img src="../10-CM/img/timer.png"> </p>', p('{img:../10-CM/img/timer.png}'))
  eq(
    '<p><img src="../20-CM-Book/img/liveReload_browser.png" width="24"> </p>',
    p('{img:../20-CM-Book/img/liveReload_browser.png|24}'),
  )
  eq('<p><img src="cm:img/timer.png"> </p>', p('{img:cm:img/timer.png}'))
  eq(
    '<p><img src="cmb:img/liveReload_browser.png" width="18"> </p>',
    p('{img:cmb:img/liveReload_browser.png|18}'),
  )
})

test('list', (t) => {
  eq('<ul><li>a</li><li>b</li><li>c</li></ul>', p('- a\n- b\n- c'))
  eq(
    "<ul><li>one</li><li>and two</li></ul><ol><li>one</li><li>two</li><li>three,    the '\\' above was not needed to continue</li></ol>",
    p(
      "- one\n- and two\n* one\n* two\n* three, \\\n  the '\\\\' above was not needed\n  to continue",
    ),
  )
})

test('pre', (t) => {
  eq(
    '<pre class="nohighlight"><code class="nohighlight">A normal line\n# This is a comment\n\n # This is not a comment\n\nThis is also # not a comment\n</code></pre>',
    p(
      '~~~\nA normal line\n# This is a comment\n\n # This is not a comment\n \nThis is also # not a comment\n~~~',
    ),
  )
})

test('box', (t) => {
  eq('<div class="box"><p>box </p></div>', p('---.box\nbox\n---'))
})

test('hline', (t) => {
  eq('<hr/>', p('---- xxx'))
})

test('fences', (t) => {
  eq(
    '<div><div class="box left"><p>floating left </p></div><div class="box right"><p>floating right </p></div></div>',
    p('---\n--- .box.left\nfloating left\n---\n--- .box.right\nfloating right\n---\n---'),
  )
})

test('tables', (t) => {
  eq(
    '<table class="border"><tr><th>th1</th><th>th2</th><th>th3</th><th>th4</th></tr><tr><td>td1</td><td>td2</td><td>td3</td><td>td4</td></tr><tr><td>td1</td><td>td2</td><td>td3</td></tr><tr><td>td4</td></tr><tr><td>td1</td><td>td2</td><td>td3</td><td>td4</td></tr></table>',
    p(
      '--- table.border\n[th1][th2][th3][th4]\n(td1)(td2)(td3)(td4)\n(td1)(td2)(td3)\n(td4)\n(td1)(td2)(td3)(td4)\n---',
    ),
  )
})

test('math', (t) => {
  eq(
    '<p><span class="math">(math((\\mathsf{ 20 \\times 10^{0.0002} }))math)</span> </p>',
    p('{$$ 20 \\times 10^{0.0002} $$}'),
  )
})

// >>> for a book
test('notes', (t) => {
  eq(
    '<p><sup><a name="fn1"></a><a onclick="CompactMarkup.scrollTo(\'#_fn1\')">1</a></sup> </p>',
    p('{fn: This is a footnote.}'),
  )
  eq('<p>This is mizzpeled. </p>', p('This is {ed:mizzpeled|korrekt this}.'))
  eq('<p>This feature. </p>', p('This feature{todo: does not yet exist}.'))
})

test('buttons', (t) => {
  eq('<p><span class="r btn">red button</span> </p>', p('{btn:.r red button}'))
})

// etc ...
