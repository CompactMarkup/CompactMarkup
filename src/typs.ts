declare global {
  type num = number
  type int = num & { __int__: void }

  type str = string
  type chr = str // only a hint, no checking

  type bol = boolean
}

export {}
