export type num = number
export type int = num & { __int__: void }
export type chr = string // >>> & length 1
export type str = string
export type bol = boolean