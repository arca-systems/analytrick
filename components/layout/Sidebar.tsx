'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { BarChart2, Tag, Grid, Users, TrendingUp, Star, Layers } from 'lucide-react'

const nav = [
  { href: '/dashboard',    label: 'Dashboard',   icon: BarChart2  },
  { href: '/anuncios',     label: 'Anúncios',    icon: Tag        },
  { href: '/categorias',   label: 'Categorias',  icon: Grid       },
  { href: '/marcas',       label: 'Marcas',      icon: Layers     },
  { href: '/vendedores',   label: 'Vendedores',  icon: Users      },
  { href: '/tendencias',   label: 'Tendências',  icon: TrendingUp },
  { href: '/destaques',    label: 'Destaques',   icon: Star       },
]

export function Sidebar() {
  const path = usePathname()

  return (
    <aside className="w-56 flex-shrink-0 flex flex-col h-screen sticky top-0
                      bg-surface-raised border-r border-surface-border">
      {/* Logo */}
      <div className="flex items-center gap-3 px-5 py-5 border-b border-surface-border">
        <div className="w-8 h-8 rounded-lg flex items-center justify-center text-lg flex-shrink-0"
             style={{ background: 'var(--brand)' }}>
          📊
        </div>
        <span className="font-bold text-white text-sm tracking-tight">Analytrick</span>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
        {nav.map(({ href, label, icon: Icon }) => {
          const active = path === href || path.startsWith(href + '/')
          return (
            <Link key={href} href={href}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm
                              transition-all duration-150 group
                              ${active
                                ? 'bg-blue-950 text-blue-300 font-600'
                                : 'text-text-secondary hover:bg-surface-hover hover:text-white'}`}>
              <Icon size={15} className={active ? 'text-blue-400' : 'text-text-muted group-hover:text-white'} />
              {label}
            </Link>
          )
        })}
      </nav>

      {/* Footer */}
      <div className="px-4 py-4 border-t border-surface-border">
        <p className="text-xs text-text-muted">© 2025 ARCA SYSTEMS</p>
      </div>
    </aside>
  )
}
