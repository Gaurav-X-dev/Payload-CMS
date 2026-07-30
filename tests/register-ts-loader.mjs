import { registerHooks } from 'node:module'

process.env.NODE_ENV = 'test'
process.env.DISABLE_PAYLOAD_HMR = 'true'

registerHooks({
  resolve(specifier, context, nextResolve) {
    try {
      return nextResolve(specifier, context)
    } catch (error) {
      if (specifier.startsWith('next/') && !specifier.endsWith('.js')) {
        return nextResolve(`${specifier}.js`, context)
      }
      if (
        (specifier.startsWith('./') || specifier.startsWith('../')) &&
        !/\.[cm]?[jt]sx?$/.test(specifier)
      ) {
        try {
          return nextResolve(`${specifier}.ts`, context)
        } catch {
          return nextResolve(`${specifier}/index.ts`, context)
        }
      }
      throw error
    }
  },
})
