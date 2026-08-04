import { CuriousHubPageRenderer } from './curious-hub'
import { GheeRoastPageRenderer } from './ghee-roast'
import { ZuruZuruPageRenderer } from './zuru-zuru'
import type { ThemeRegistration } from './types'

export const themeRegistry = {
  'curious-hub': {
    key: 'curious-hub',
    PageRenderer: CuriousHubPageRenderer,
  },
  'ghee-roast': {
    key: 'ghee-roast',
    PageRenderer: GheeRoastPageRenderer,
  },
  'zuru-zuru': {
    key: 'zuru-zuru',
    PageRenderer: ZuruZuruPageRenderer,
  },
} as const satisfies Record<string, ThemeRegistration>

