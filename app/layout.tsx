import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Analytrick — Inteligência para o Mercado Livre',
  description: 'Análise de anúncios, vendedores, categorias e tendências do Mercado Livre.',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR">
      <body style={{ fontFamily: 'system-ui, sans-serif' }}>
        {children}
      </body>
    </html>
  )
}