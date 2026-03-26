import type { Metadata } from 'next'
import { GeistSans } from 'geist/font/sans'
import { GeistMono } from 'geist/font/mono'
import './globals.css'

export const metadata: Metadata = {
  title: 'Analytrick — Inteligência para o Mercado Livre',
  description: 'Análise de anúncios, vendedores, categorias e tendências do Mercado Livre.',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR" className={`${GeistSans.variable} ${GeistMono.variable}`}>
      <body className="bg-surface text-text-primary antialiased">
        {children}
      </body>
    </html>
  )
}
