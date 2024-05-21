import test from 'ava'
import parser from '@lib/markup/cm/parser'
import type { CM } from '@lib/markup/cm/spec'
import '@lib/typ'

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
  t.is('', p(''))
  t.is('<p>P </p>', p('P'))
  t.is('<p>P </p>', p('P \n'))
  t.is('<p> P </p>', p(' P'))
  t.is('<p>  P </p>', p('  P'))
  t.is(
    '<p>Paragraph, still the same paragraph. </p><p>A new paragraph. On two source lines. </p><p>A paragraph without a blank line before it. </p><p>Another </p><p> This is not. </p>',
    p(
      'Paragraph,\nstill the same paragraph.\n\nA new paragraph.\nOn two source lines.\n.A paragraph without a blank line before it.\n.Another\n. This is not.'
    )
  )
})

test('typo', (t) => {
  t.is('<p> *B* </p>', p(' *B*'))
  t.is('<p>a<b>B</b> </p>', p('@chr b *\na*B*'))
  t.is('<p>a<b>B </b></p>', p('@chr b *\na*B'))
  t.is('<p><b>*B </b></p>', p('@chr b a\na*B'))

  t.is('<p><em>em</em> </p>', p('@chr em /\n/em/'))
  t.is('<p><code class="inline">x </code></p>', p('@chr code ~\n~x'))

  t.is('<p>‘q’ </p>', p("@chr squo '\n'q'"))
  t.is('<p>“q” </p>', p('@chr dquo "\n"q"'))

  t.is('<p><em>em</em> </p>', p('{/em}'))
  t.is('<p><b>b</b> </p>', p('{*b}'))
  t.is('<p><u>u</u> </p>', p('{_u}'))
  t.is('<p><code class="inline">mono</code> </p>', p('{~mono}'))
  t.is('<p><sup>sup</sup> </p>', p("{'sup}"))
  t.is('<p><sub>sub</sub> </p>', p('{,sub}'))
  t.is('<p><u>uu<sub>sub</sub>script</u> </p>', p('{_uu{,sub}script}'))
})

test('typohook', (t) => {
  t.is('<p>🡒🡐⇒⇐▸◂–— </p>', p('{->}{<-}{=>}{<=}{>}{<}{--}{---}'))
})

test('pragma', (t) => {
  t.is('', p('@toc cm;; Compact Markup'))
})

test('macro', (t) => {
  t.is('<p>CM </p>', p('CM'))
  t.is('<p>$CM </p>', p('@def CM Compact Markup\n$CM'))
  t.is('<p>Compact Markup </p>', p('@def CM Compact Markup\n@chr macro $\n$CM'))
  t.is('<p>Compact Markup </p>', p('@def CM Compact Markup\n@chr macro ?\n?CM'))
})

test('escape', (t) => {
  t.is('<p>CMs </p>', p('CMs'))
  t.is('<p>CMs </p>', p('CM\\s'))
  t.is('<p>CM\\s </p>', p('@chr esc -\nCM\\s'))
  t.is('<p>CMs </p>', p('@chr esc -\nCM-s'))
  t.is('<p>li ne </p>', p('li\\\nne'))
  t.is('<p>li<br/>ne </p>', p('li\\nne'))
})

test('comment', (t) => {
  t.is('', p('# eof'))
  t.is('<p> # eof </p>', p(' # eof'))
  t.is('<p># eof </p>', p('\\# eof'))
})

test('h', (t) => {
  t.is('<h1>h</h1>', p('=h'))
  t.is('<h1>h</h1>', p('= h'))
  t.is('<h2>h</h2>', p('== h'))
  t.is('<h3>h</h3>', p('=== h'))
  t.is('<h4>h</h4>', p('==== h'))
  t.is('<h5>h</h5>', p('===== h'))
  t.is('<h6>h</h6>', p('====== h'))
})

test('ln', (t) => {
  t.is(
    '<p>(<a class="extern" href="http://es6-features.org/" target="cm_extern">ES6</a>) </p>',
    p('({:ES6|http://es6-features.org/})')
  )
  t.is(
    '<p><a class="extern" href="http://mutebook.me" target="cm_extern">mutebook.me</a> </p>',
    p('{://mutebook.me}')
  )
  t.is(
    '<p><a class="wp extern" href="https://en.wikipedia.org/wiki/markup_language" target="cm_extern">markup language</a> </p>',
    p('{wp: markup language}')
  )
  t.is(
    '<p><a class="gh extern" href="https://github.com/mutebook" target="cm_extern">here</a> </p>',
    p('{gh:here|mutebook}')
  )
  t.is(
    '<p><a class="lc" href="cm_pragmas">cm_pragmas</a> </p>',
    p('{:.lc cm_pragmas}')
  )
  t.is('<p><a href="link">name</a> </p>', p('{:name|link}'))
  t.is('<p><a name="anchor"></a> </p>', p('{#anchor}'))
})

test('img', (t) => {
  t.is('<p><img src="/assets/icon32.png"> </p>', p('{img:/assets/icon32.png}'))
  t.is('<p><img src="img/timer.png"> </p>', p('{img:img/timer.png}'))
  t.is(
    '<p><img src="../10-CM/img/timer.png"> </p>',
    p('{img:../10-CM/img/timer.png}')
  )
  t.is(
    '<p><img src="../20-CM-Book/img/liveReload_browser.png" width="24"> </p>',
    p('{img:../20-CM-Book/img/liveReload_browser.png|24}')
  )
  t.is('<p><img src="cm:img/timer.png"> </p>', p('{img:cm:img/timer.png}'))
  t.is(
    '<p><img src="cmb:img/liveReload_browser.png" width="18"> </p>',
    p('{img:cmb:img/liveReload_browser.png|18}')
  )
})

test('list', (t) => {
  t.is('<ul><li>a</li><li>b</li><li>c</li></ul>', p('- a\n- b\n- c'))
  t.is(
    "<ul><li>one</li><li>and two</li></ul><ol><li>one</li><li>two</li><li>three,    the '\\' above was not needed to continue</li></ol>",
    p(
      "- one\n- and two\n* one\n* two\n* three, \\\n  the '\\\\' above was not needed\n  to continue"
    )
  )
})

test('pre', (t) => {
  t.is(
    '<pre class="nohighlight"><code class="nohighlight">A normal line\n# This is a comment\n\n # This is not a comment\n\nThis is also # not a comment\n</code></pre>',
    p(
      '~~~\nA normal line\n# This is a comment\n\n # This is not a comment\n \nThis is also # not a comment\n~~~'
    )
  )
})

test('box', (t) => {
  t.is('<div class="box"><p>box </p></div>', p('---.box\nbox\n---'))
})

test('hline', (t) => {
  t.is('<hr/>', p('---- xxx'))
})

test('fences', (t) => {
  t.is(
    '<div><div class="box left"><p>floating left </p></div><div class="box right"><p>floating right </p></div></div>',
    p(
      '---\n--- .box.left\nfloating left\n---\n--- .box.right\nfloating right\n---\n---'
    )
  )
})

test('tables', (t) => {
  t.is(
    '<table class="border"><tr><th>th1</th><th>th2</th><th>th3</th><th>th4</th></tr><tr><td>td1</td><td>td2</td><td>td3</td><td>td4</td></tr><tr><td>td1</td><td>td2</td><td>td3</td></tr><tr><td>td4</td></tr><tr><td>td1</td><td>td2</td><td>td3</td><td>td4</td></tr></table>',
    p(
      '--- table.border\n[th1][th2][th3][th4]\n(td1)(td2)(td3)(td4)\n(td1)(td2)(td3)\n(td4)\n(td1)(td2)(td3)(td4)\n---'
    )
  )
})

test('math', (t) => {
  t.is(
    '<p><span class="math">(math((\\mathsf{ 20 \\times 10^{0.0002} }))math)</span> </p>',
    p('{$$ 20 \\times 10^{0.0002} $$}')
  )
})

// >>> for a book
test('notes', (t) => {
  t.is(
    '<p><sup><a name="fn1"></a><a onclick="CompactMarkup.scrollTo(\'#_fn1\')">1</a></sup> </p>',
    p('{fn: This is a footnote.}')
  )
  t.is('<p>This is mizzpeled. </p>', p('This is {ed:mizzpeled|korrekt this}.'))
  t.is('<p>This feature. </p>', p('This feature{todo: does not yet exist}.'))
})

test('buttons', (t) => {
  t.is(
    '<p><span class="r btn">red button</span> </p>',
    p('{btn:.r red button}')
  )
})

// etc ...
