'use client'

import React, { useState, useEffect, useCallback, useRef } from 'react'
import { createClient } from '@/lib/supabase/client'
import { DataTable } from '@/components/table/DataTable'
import {
  ColDef, CHANNELS, TABS_WITH_CHANNEL, TABS_NO_CHANNEL,
  TabId, Channel, ChannelOption,
} from '@/types'
import {
  AN_COLS, CAT_COLS, BRAND_COLS, TREND_COLS, USER_COLS,
  PRODUTO_COLS, FORNECEDOR_COLS,
} from '@/lib/colDefs'

// ── Header colors por canal ──────────────────────────────────
const CHANNEL_HEADER: Record<string, { anuncios: string; vendedores: string }> = {
  ml:     { anuncios: '#0f766e', vendedores: '#1d4ed8' },
  shopee: { anuncios: '#c73e23', vendedores: '#b03322' },
  amazon: { anuncios: '#c46a00', vendedores: '#a35500' },
  magalu: { anuncios: '#0062cc', vendedores: '#004fa3' },
  shein:  { anuncios: '#d42e7a', vendedores: '#aa2462' },
}

type DataMap = Record<TabId, Record<string, unknown>[]>
type LoadingMap = Record<TabId, boolean>
type ColMap = Record<TabId, ColDef[]>

const EMPTY_DATA = (): DataMap => ({
  anuncios: [], categorias: [], marcas: [], vendedores: [],
  tendencias: [], produtos: [], fornecedores: [],
})
const EMPTY_LOADING = (): LoadingMap => ({
  anuncios: false, categorias: false, marcas: false, vendedores: false,
  tendencias: false, produtos: false, fornecedores: false,
})
const INIT_COLS = (): ColMap => ({
  anuncios: [...AN_COLS], categorias: [...CAT_COLS], marcas: [...BRAND_COLS],
  vendedores: [...USER_COLS], tendencias: [...TREND_COLS],
  produtos: [...PRODUTO_COLS], fornecedores: [...FORNECEDOR_COLS],
})

export default function AnalytrickApp() {
  const supabase = createClient()

  const [channel, setChannel]           = useState<Channel>('ml')
  const [activeTab, setActiveTab]       = useState<TabId>('anuncios')
  const [isDark, setIsDark]             = useState(true)
  const [showChannelMenu, setShowChannelMenu] = useState(false)
  const [showConfigPanel, setShowConfigPanel] = useState(false)
  const [data, setData]                 = useState<DataMap>(EMPTY_DATA())
  const [loading, setLoading]           = useState<LoadingMap>(EMPTY_LOADING())
  const [loaded, setLoaded]             = useState<Set<string>>(new Set())
  const [colDefs, setColDefs]           = useState<ColMap>(INIT_COLS())
  const [user, setUser]                 = useState<{ email?: string; name?: string } | null>(null)
  const [toast, setToast]               = useState<string | null>(null)
  const [imposto, setImposto]           = useState(0)

  const channelMenuRef = useRef<HTMLDivElement>(null)
  const configRef      = useRef<HTMLDivElement>(null)

  const tabs       = channel === null ? TABS_NO_CHANNEL : TABS_WITH_CHANNEL
  const currentCh  = CHANNELS.find(c => c.id === channel) || CHANNELS[0]
  const chKey      = channel ?? 'none'

  // cache key inclui canal — dados por canal separados
  const cacheKey = (tab: TabId) => `${chKey}:${tab}`

  // ── Auth ─────────────────────────────────────────────────
  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      if (data.user) setUser({
        email: data.user.email,
        name: data.user.user_metadata?.full_name || data.user.email?.split('@')[0],
      })
    })
  }, [])

  // ── Ajusta tab ao trocar canal ────────────────────────────
  useEffect(() => {
    const available = (channel === null ? TABS_NO_CHANNEL : TABS_WITH_CHANNEL).map(t => t.id)
    if (!available.includes(activeTab)) setActiveTab(available[0] as TabId)
  }, [channel])

  // ── Tema ─────────────────────────────────────────────────
  const bg      = isDark ? '#111827' : '#f3f4f6'
  const hbg     = isDark ? '#1f2937' : '#ffffff'
  const brd     = isDark ? '#374151' : '#e5e7eb'
  const txt     = isDark ? '#f9fafb' : '#111827'
  const txtM    = isDark ? '#9ca3af' : '#374151'
  const txtD    = isDark ? '#6b7280' : '#9ca3af'
  const h1bg    = isDark ? '#1a2035' : '#1e3a8a'
  const rowBg   = isDark ? '#111827' : '#ffffff'
  const rowAlt  = isDark ? '#1a2234' : '#f8fafc'
  const hoverBg = isDark ? '#1e3a5f' : '#dbeafe'
  const inputBg = isDark ? '#0f172a' : '#ffffff'

  // ── Tabela por tab/canal ──────────────────────────────────
  function getTable(tab: TabId, ch: ChannelOption): string | null {
    switch (tab) {
      case 'anuncios':    return ch.itemsTable
      case 'vendedores':  return ch.usersTable
      case 'categorias':  return ch.categoriesTable
      case 'marcas':      return ch.brandsTable
      case 'tendencias':  return ch.trendsTable
      case 'produtos':    return 'products'
      case 'fornecedores':return 'suppliers'
      default:            return null
    }
  }

  function getOrderBy(tab: TabId): { col: string; asc: boolean } {
    switch (tab) {
      case 'anuncios':    return { col: 'sold_quantity', asc: false }
      case 'tendencias':  return { col: 'trends_rank',   asc: true  }
      case 'categorias':  return { col: 'category_tree', asc: true  }
      case 'marcas':      return { col: 'results',       asc: false }
      case 'vendedores':  return { col: 'created_at',    asc: false }
      case 'produtos':    return { col: 'title',         asc: true  }
      case 'fornecedores':return { col: 'name',          asc: true  }
      default:            return { col: 'id',            asc: false }
    }
  }

  function getCountLabel(tab: TabId): string {
    const map: Record<TabId, string> = {
      anuncios: 'anúncios', categorias: 'categorias', marcas: 'marcas',
      vendedores: 'vendedores', tendencias: 'tendências',
      produtos: 'produtos', fornecedores: 'fornecedores',
    }
    return map[tab]
  }

  function getSearchKeys(tab: TabId): string[] {
    const map: Record<TabId, string[]> = {
      anuncios:    ['title','attributes_brand','seller_name'],
      categorias:  ['category_name','category_tree','category_parent'],
      marcas:      ['brand'],
      vendedores:  ['nickname','address_city','address_state'],
      tendencias:  ['keyword'],
      produtos:    ['title','brand'],
      fornecedores:['name','email'],
    }
    return map[tab] || []
  }

  function getHeaderColor(tab: TabId): { hc: string; hcs: string } {
    const ch = chKey in CHANNEL_HEADER ? CHANNEL_HEADER[chKey] : CHANNEL_HEADER.ml
    if (tab === 'anuncios')   return { hc: ch.anuncios,  hcs: ch.anuncios + 'dd' }
    if (tab === 'vendedores') return { hc: ch.vendedores, hcs: ch.vendedores + 'dd' }
    if (tab === 'categorias') return { hc: '#7c3aed', hcs: '#6d28d9' }
    if (tab === 'marcas')     return { hc: '#0369a1', hcs: '#0284c7' }
    if (tab === 'tendencias') return { hc: '#0f766e', hcs: '#0d9488' }
    if (tab === 'produtos')   return { hc: '#0f766e', hcs: '#0d9488' }
    return                           { hc: '#374151', hcs: '#4b5563' }
  }

  function getFixedKeys(tab: TabId): Set<string> {
    if (tab === 'anuncios')    return new Set(['thumbnail','title'])
    if (tab === 'categorias')  return new Set(['category_parent','category_tree'])
    if (tab === 'marcas')      return new Set(['brand'])
    if (tab === 'vendedores')  return new Set(['nickname'])
    if (tab === 'tendencias')  return new Set(['trends_rank'])
    if (tab === 'produtos')    return new Set(['thumbnail','title'])
    if (tab === 'fornecedores')return new Set(['name'])
    return new Set()
  }

  // ── Carregar dados ────────────────────────────────────────
  const loadTab = useCallback(async (tab: TabId, force = false) => {
    const key = cacheKey(tab)
    if (loaded.has(key) && !force) return

    const table = getTable(tab, currentCh)
    if (!table) {
      // tabela não existe para este canal — mostra vazio
      setData(d => ({ ...d, [tab]: [] }))
      return
    }

    setLoading(l => ({ ...l, [tab]: true }))
    try {
      let allRows: Record<string, unknown>[] = []
      let offset = 0
      const { col, asc } = getOrderBy(tab)

      while (true) {
        let q = supabase.from(table).select('*').range(offset, offset + 999)
        if (tab === 'anuncios') q = q.eq('status', 'active')
        q = q.order(col, { ascending: asc })
        const { data: rows, error } = await q
        if (error) { console.error(error); break }
        if (!rows?.length) break
        allRows = [...allRows, ...rows as Record<string, unknown>[]]
        if (rows.length < 1000) break
        offset += rows.length
      }

      if (tab === 'anuncios') {
        allRows = allRows.map(r => ({
          ...r,
          receita: ((r.price as number)||0) * ((r.sold_quantity as number)||0),
        }))
      }

      setData(d => ({ ...d, [tab]: allRows }))
      setLoaded(s => new Set([...s, key]))
      showToast(`✓ ${allRows.length.toLocaleString('pt-BR')} ${getCountLabel(tab)} carregados`)
    } catch (e) {
      console.error(e)
      showToast('Erro ao carregar dados')
    } finally {
      setLoading(l => ({ ...l, [tab]: false }))
    }
  }, [loaded, channel, supabase])

  useEffect(() => { loadTab(activeTab) }, [activeTab, channel])

  function showToast(msg: string) {
    setToast(msg)
    setTimeout(() => setToast(null), 2500)
  }

  async function handleLogout() {
    await supabase.auth.signOut()
    window.location.href = '/auth/login'
  }

  // ── Close menus on outside click ──────────────────────────
  useEffect(() => {
    function handler(e: MouseEvent) {
      if (channelMenuRef.current && !channelMenuRef.current.contains(e.target as Node))
        setShowChannelMenu(false)
      if (configRef.current && !configRef.current.contains(e.target as Node))
        setShowConfigPanel(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  const btnH1Style = (active = false): React.CSSProperties => ({
    height: 30, padding: '0 10px', borderRadius: 5, fontSize: 11, fontWeight: 600,
    cursor: 'pointer', fontFamily: 'inherit', display: 'inline-flex', alignItems: 'center', gap: 4,
    background: active ? '#ffe600' : 'rgba(255,255,255,0.1)',
    color: active ? '#111' : 'rgba(255,255,255,0.8)',
    border: active ? '1px solid #d4b800' : '1px solid rgba(255,255,255,0.18)',
    whiteSpace: 'nowrap' as const, transition: 'background 0.15s',
  })

  return (
    <div style={{
      position: 'fixed', inset: 0, background: bg,
      display: 'flex', flexDirection: 'column',
      fontFamily: "'Inter', system-ui, sans-serif",
      color: txt, overflow: 'hidden',
    }}>

      {/* ══ H1 ════════════════════════════════════════════ */}
      <div style={{
        display: 'flex', alignItems: 'center', height: 48, flexShrink: 0,
        background: h1bg, borderBottom: '1px solid rgba(255,255,255,0.08)',
        padding: '0 10px', gap: 8,
      }}>

        {/* Logo */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexShrink: 0 }}>
          <div style={{
            background: '#ffe600', borderRadius: 6, width: 28, height: 28,
            display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 15,
          }}>📊</div>
          <span style={{ fontSize: 13, fontWeight: 800, letterSpacing: '.8px', color: '#ffe600' }}>
            ANALYTRICK
          </span>
          <span style={{ fontSize: 10, fontWeight: 400, color: '#ffe600', opacity: 0.7 }}>
            · {currentCh.label}
          </span>
        </div>

        <div style={{ width: 1, height: 20, background: 'rgba(255,255,255,0.15)', flexShrink: 0 }} />

        {/* ── Tabs módulos (no centro, como na extensão) ── */}
        <div style={{ display: 'flex', alignItems: 'stretch', height: '100%', flex: 1, overflow: 'hidden' }}>
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              style={{
                display: 'flex', alignItems: 'center', padding: '0 14px',
                height: '100%', fontSize: 12,
                fontWeight: activeTab === tab.id ? 700 : 600,
                color: activeTab === tab.id ? '#ffe600' : 'rgba(255,255,255,0.55)',
                background: 'none', border: 'none',
                borderBottom: activeTab === tab.id ? '3px solid #ffe600' : '3px solid transparent',
                borderTop: '3px solid transparent',
                cursor: 'pointer', fontFamily: 'inherit', whiteSpace: 'nowrap',
                transition: 'color 0.15s',
              }}
              onMouseEnter={e => { if (activeTab !== tab.id) e.currentTarget.style.color = 'rgba(255,255,255,0.85)' }}
              onMouseLeave={e => { if (activeTab !== tab.id) e.currentTarget.style.color = 'rgba(255,255,255,0.55)' }}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div style={{ width: 1, height: 20, background: 'rgba(255,255,255,0.15)', flexShrink: 0 }} />

        {/* ── Ações direita ── */}
        <div style={{ display: 'flex', gap: 4, alignItems: 'center', flexShrink: 0 }}>

          {/* Canal dropdown */}
          <div style={{ position: 'relative' }} ref={channelMenuRef}>
            <button
              onClick={() => setShowChannelMenu(v => !v)}
              style={{
                ...btnH1Style(false),
                color: currentCh.color,
                borderColor: currentCh.color + '44',
                background: currentCh.color + '18',
              }}
            >
              <span style={{ width: 8, height: 8, borderRadius: '50%', background: currentCh.color, flexShrink: 0 }} />
              {currentCh.label}
              <span style={{ fontSize: 9, opacity: 0.7 }}>▾</span>
            </button>

            {showChannelMenu && (
              <div style={{
                position: 'absolute', top: '100%', right: 0, marginTop: 6,
                background: hbg, border: `1px solid ${brd}`,
                borderRadius: 10, minWidth: 200,
                boxShadow: '0 8px 32px rgba(0,0,0,0.5)', zIndex: 9999,
              }}>
                <div style={{ padding: '8px 12px', borderBottom: `1px solid ${brd}`, fontSize: 10, color: txtD, fontWeight: 700, letterSpacing: '.5px' }}>
                  CANAL DE DADOS
                </div>
                {CHANNELS.map(ch => (
                  <button
                    key={ch.id ?? 'none'}
                    onClick={() => { setChannel(ch.id); setShowChannelMenu(false) }}
                    style={{
                      display: 'flex', alignItems: 'center', gap: 10,
                      width: '100%',
                      background: channel === ch.id ? '#1e3a8a' : 'none',
                      border: 'none', borderBottom: `1px solid ${brd}`,
                      padding: '9px 14px', cursor: 'pointer', color: txt,
                      fontFamily: 'inherit', fontSize: 12,
                      fontWeight: channel === ch.id ? 700 : 400, textAlign: 'left',
                    }}
                    onMouseEnter={e => { if (channel !== ch.id) e.currentTarget.style.background = '#1e3a5f' }}
                    onMouseLeave={e => { if (channel !== ch.id) e.currentTarget.style.background = 'none' }}
                  >
                    <span style={{ width: 10, height: 10, borderRadius: '50%', background: ch.color, flexShrink: 0 }} />
                    {ch.label}
                    {channel === ch.id && <span style={{ marginLeft: 'auto', color: '#ffe600' }}>✓</span>}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Tema */}
          <button
            onClick={() => setIsDark(v => !v)}
            title={isDark ? 'Modo claro' : 'Modo escuro'}
            style={btnH1Style()}
          >
            {isDark ? '☀' : '🌙'}
          </button>

          {/* Config */}
          <div style={{ position: 'relative' }} ref={configRef}>
            <button
              onClick={() => setShowConfigPanel(v => !v)}
              style={btnH1Style(showConfigPanel)}
              title="Configurações"
            >
              ⚙ {user?.name || user?.email?.split('@')[0] || ''}
            </button>

            {showConfigPanel && (
              <div style={{
                position: 'absolute', top: '100%', right: 0, marginTop: 6,
                background: hbg, border: `1px solid ${brd}`, borderRadius: 12,
                width: 280, boxShadow: '0 8px 40px rgba(0,0,0,0.6)',
                zIndex: 9999, overflow: 'hidden',
              }}>
                {/* Usuário */}
                <div style={{ padding: '12px 16px', borderBottom: `1px solid ${brd}`, display: 'flex', alignItems: 'center', gap: 10 }}>
                  <div style={{ width: 36, height: 36, borderRadius: '50%', background: '#1e3a8a', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16, flexShrink: 0 }}>👤</div>
                  <div style={{ minWidth: 0 }}>
                    <div style={{ fontSize: 12, fontWeight: 700, color: txt, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{user?.name || 'Usuário'}</div>
                    <div style={{ fontSize: 10, color: txtM, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{user?.email || ''}</div>
                    <div style={{ fontSize: 9, color: '#4ade80', marginTop: 2 }}>● Acesso ativo</div>
                  </div>
                </div>

                {/* Financeiro */}
                <div style={{ padding: 16, borderBottom: `1px solid ${brd}` }}>
                  <div style={{ fontSize: 11, fontWeight: 700, color: txt, marginBottom: 4 }}>FINANCEIRO</div>
                  <div style={{ fontSize: 10, color: txtD, marginBottom: 8 }}>% Imposto sobre o preço</div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <input
                      type="number" min={0} max={100} step={0.1} value={imposto}
                      onChange={e => setImposto(parseFloat(e.target.value)||0)}
                      style={{ background: inputBg, border: `1px solid ${brd}`, borderRadius: 6, color: txt, fontSize: 11, padding: '4px 10px', fontFamily: 'inherit', outline: 'none', width: 80, textAlign: 'right' }}
                    />
                    <span style={{ fontSize: 11, color: txtM }}>%</span>
                  </div>
                </div>

                {/* Aparência */}
                <div style={{ padding: 16, borderBottom: `1px solid ${brd}` }}>
                  <div style={{ fontSize: 11, fontWeight: 700, color: txt, marginBottom: 8 }}>APARÊNCIA</div>
                  <button onClick={() => setIsDark(v => !v)} style={{ display: 'flex', alignItems: 'center', gap: 8, background: 'none', border: `1px solid ${brd}`, borderRadius: 8, padding: '7px 12px', cursor: 'pointer', color: txt, fontFamily: 'inherit', fontSize: 11, width: '100%' }}>
                    {isDark ? '☀ Modo claro' : '🌙 Modo escuro'}
                  </button>
                </div>

                {/* Sair */}
                <div style={{ padding: 12 }}>
                  <button onClick={handleLogout} style={{ width: '100%', background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', borderRadius: 8, color: '#ef4444', padding: '8px 12px', cursor: 'pointer', fontFamily: 'inherit', fontSize: 12, fontWeight: 600 }}>
                    Sair da conta
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ══ Conteúdo ══════════════════════════════════════ */}
      <div style={{ flex: 1, overflow: 'hidden', minHeight: 0 }}>
        {tabs.map(tab => {
          const { hc, hcs } = getHeaderColor(tab.id)
          return (
            <div
              key={tab.id}
              style={{ display: activeTab === tab.id ? 'flex' : 'none', flexDirection: 'column', height: '100%' }}
            >
              <DataTable
                rows={data[tab.id]}
                colDefs={colDefs[tab.id]}
                onColDefsChange={cols => setColDefs(c => ({ ...c, [tab.id]: cols }))}
                headerColor={hc}
                headerColorSorted={hcs}
                fixedKeys={getFixedKeys(tab.id)}
                countLabel={getCountLabel(tab.id)}
                tableId={`atk-${chKey}-${tab.id}`}
                loading={loading[tab.id]}
                searchKeys={getSearchKeys(tab.id)}
                isDark={isDark}
                rowBg={rowBg}
                rowAlt={rowAlt}
                hoverBg={hoverBg}
                onReload={() => {
                  const key = cacheKey(tab.id)
                  setLoaded(s => { const n = new Set(s); n.delete(key); return n })
                  loadTab(tab.id, true)
                }}
              />
            </div>
          )
        })}
      </div>

      {/* ══ Footer ════════════════════════════════════════ */}
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '0 12px', height: 24, flexShrink: 0,
        background: isDark ? '#0f172a' : '#e5e7eb',
        borderTop: `1px solid ${brd}`,
        fontSize: 9, color: txtD,
      }}>
        <span>ANALYTRICK · {currentCh.label} · 1 clique = ordenar · Ctrl+clique = filtrar</span>
        <span>v0.19.0</span>
      </div>

      {toast && (
        <div style={{
          position: 'fixed', bottom: 20, right: 20,
          background: hbg, border: `1px solid ${brd}`,
          color: txt, padding: '10px 16px', borderRadius: 8,
          fontSize: 12, fontWeight: 600, zIndex: 9999,
          boxShadow: '0 4px 20px rgba(0,0,0,0.4)',
          animation: 'fadeInUp 0.2s ease',
        }}>
          {toast}
        </div>
      )}

      <style>{`
        @keyframes fadeInUp { from { opacity:0; transform:translateY(8px); } to { opacity:1; transform:translateY(0); } }
      `}</style>
    </div>
  )
}