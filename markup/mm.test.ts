import test from 'ava'
import '@lib/typ'
import p from './mm'
import type { Cb } from './mm'

test('mm', (t) => {
  t.is(1, 1)
  t.is('', p(''))
  t.is('<h1>h</h1>', p('# h'))
  t.is('<p>a<br/>b </p>', p('a\\\\b'))
  t.is(
    '<p><b>b</b> <b>c</b> <em><u>i</u></em> </p>',
    p('**b** **c** //__i__//')
  )
  t.is('<p><code>a&mdash;b</code> </p>', p('~~a--b~~'))
  t.is('<hr/>', p('---HR'))
  t.is('<p>---HR </p>', p(' ---HR'))
  t.is('<p><ul><li>A</li></ul></p>', p('* A'))
  t.is('<p><ol><li>A</li><li>B</li></ol></p>', p('+ A\n+B'))
  t.is('<p><img style="width:b" src="a" alt=""/> </p>', p('[[a|b]]'))
  t.is('<p><a target="_blank" href="b"/>a</a> </p>', p('((a|b))'))
  t.is('<p>a </p>', p('(((a|b|v)))'))
  t.is(
    '<p>[a,b] </p>',
    p('(((a|b|v)))', { val: (tag: str, img: str) => `[${tag},${img}]` } as Cb)
  )
})
