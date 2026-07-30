import { registerHooks } from 'node:module'

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
        return nextResolve(`${specifier}.ts`, context)
      }
      throw error
    }
  },
})
