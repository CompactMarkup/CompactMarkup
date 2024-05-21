export let NUL = '\0'
export let NL = '\n'

export type Input = {
  get: (ahead?: num) => chr
  next: () => chr
  skip: (n?: num) => void
  push: (head: str) => void
}
