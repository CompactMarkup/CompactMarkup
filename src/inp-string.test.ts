import Inp from './inp-string'
import { NL, NUL } from './tokenizer'
import test from 'ava'

test('get', (t) => {
  let inp = Inp('abčĎe😀fg \n g')

  t.is('a', inp.get(0))
  t.is('b', inp.get(1))
  t.is('č', inp.get(2))
  t.is('Ď', inp.get(3))
  t.is('e', inp.get(4))
  t.is('😀', inp.get(5))
  t.is('f', inp.get(6))
  t.is('g', inp.get(7))
  t.is(NL, inp.get(8))
  t.is(' ', inp.get(9))
  t.is('g', inp.get(10))
  t.is(NL, inp.get(11))
  t.is(NUL, inp.get(12)) // beyond the end
})

test('next-skip', (t) => {
  let inp = Inp('ab😀d')
  t.is('a', inp.next())
  inp.skip()
  t.is('😀', inp.next())
  inp.skip(1)
  t.is(NL, inp.next())
  t.is(NUL, inp.next())
})

test('push', (t) => {
  let inp = Inp('d😀f')
  inp.push('abc')
  t.is('a', inp.next())
  t.is('b', inp.next())
  t.is('c', inp.next())
  t.is('d', inp.next())
  t.is('😀', inp.next())
  t.is('f', inp.next())
  t.is(NL, inp.next())
  t.is(NUL, inp.next())

  inp = Inp('')
  inp.push('')
  t.is(NL, inp.next())
  t.is(NUL, inp.next())
})
