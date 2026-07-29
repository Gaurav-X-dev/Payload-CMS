import type { ReactNode } from 'react'
import { Footer, Newsletter } from '../components/Footer'
import { Header } from '../components/Header'
import { BackToTop } from '../components/Interactive'

export function ZuruZuruLayout({ children, pathname }: { children: ReactNode; pathname: string }) {
  return <div className="zuru-zuru-theme"><Header pathname={pathname} /><main>{children}</main><Newsletter /><Footer /><BackToTop /></div>
}
