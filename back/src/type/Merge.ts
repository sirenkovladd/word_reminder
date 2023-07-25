export type Merge<A extends Record<string, unknown>, B extends Record<string, unknown>> = {
  [K in keyof (A & B)]: K extends keyof A ? A[K] : K extends keyof B ? B[K] : never
}
