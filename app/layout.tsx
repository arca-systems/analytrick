import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Analytrick',
  description: 'Análise de mercado Mercado Livre',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR">
      <body>{children}</body>
    </html>
  )
}
