'use client'

import React, { useState, useEffect, useCallback, useRef } from 'react'
import { createClient } from '@/lib/supabase/client'
import { DataTable } from '@/components/table/DataTable'
import { ColDef, CHANNELS, TABS_ML, TABS_NONE, TabId, Channel } from '@/types'
import {
  AN_COLS, CAT_COLS, BRAND_COLS, TREND_COLS, USER_COLS,
  PRODUTO_COLS, FORNECEDOR_COLS,
} from '@/lib/colDefs'

// ── Configuração por tab ─────────────────────────────────────
const TAB_CONFIG: Record<TabId, {
  cols: ColDef[]
  fixedKeys: Set<string>
  headerColor: string
  headerColorSorted: string
  countLabel: string
  searchKeys: string[]
  table: string
  filters?: Record<string, string>
  orderBy?: string
  orderAsc?: boolean
}> = {
  anuncios: {
    cols: AN_COLS,
    fixedKeys: new Set(['thumbnail', 'title']),
    headerColor: '#0f766e', headerColorSorted: '#0d9488',
    countLabel: 'anúncios', searchKeys: ['title', 'attributes_brand', 'seller_name'],
    table: 'mercadolibre_items', filters: { status: 'active' },
    orderBy: 'sold_quantity',
  },
  categorias: {
    cols: CAT_COLS,
    fixedKeys: new Set(['category_parent', 'category_tree']),
    headerColor: '#7c3aed', headerColorSorted: '#6d28d9',
    countLabel: 'categorias', searchKeys: ['category_name', 'category_tree', 'category_parent'],
    table: 'mercadolibre_categories', orderBy: 'category_tree', orderAsc: true,
  },
  marcas: {
    cols: BRAND_COLS,
    fixedKeys: new Set(['brand']),
    headerColor: '#0369a1', headerColorSorted: '#0284c7',
    countLabel: 'marcas', searchKeys: ['brand'],
    table: 'mercadolibre_brands', orderBy: 'results',
  },
  vendedores: {
    cols: USER_COLS,
    fixedKeys: new Set(['nickname']),
    headerColor: '#1d4ed8', headerColorSorted: '#1e40af',
    countLabel: 'vendedores', searchKeys: ['nickname', 'address_city', 'address_state'],
    table: 'mercadolibre_users', orderBy: 'created_at',
  },
  tendencias: {
    cols: TREND_COLS,
    fixedKeys: new Set(['trends_rank']),
    headerColor: '#0f766e', headerColorSorted: '#0d9488',
    countLabel: 'tendências', searchKeys: ['keyword'],
    table: 'mercadolibre_trends', orderBy: 'trends_rank', orderAsc: true,
  },
  produtos: {
    cols: PRODUTO_COLS,
    fixedKeys: new Set(['thumbnail', 'title']),
    headerColor: '#0f766e', headerColorSorted: '#0d9488',
    countLabel: 'produtos', searchKeys: ['title', 'brand'],
    table: 'products', orderBy: 'title', orderAsc: true,
  },
  fornecedores: {
    cols: FORNECEDOR_COLS,
    fixedKeys: new Set(['name']),
    headerColor: '#1d4ed8', headerColorSorted: '#1e40af',
    countLabel: 'fornecedores', searchKeys: ['name'],
    table: 'suppliers', orderBy: 'name', orderAsc: true,
  },
}

type DataMap = Record<TabId, Record<string, unknown>[]>
type LoadingMap = Record<TabId, boolean>
type ColMap = Record<TabId, ColDef[]>

const EMPTY_DATA: DataMap = {
  anuncios: [], categorias: [], marcas: [], vendedores: [],
  tendencias: [], produtos: [], fornecedores: [],
}
const EMPTY_LOADING: LoadingMap = {
  anuncios: false, categorias: false, marcas: false, vendedores: false,
  tendencias: false, produtos: false, fornecedores: false,
}

export default function AnalytrickApp() {
  const supabase = createClient()

  // ── State ────────────────────────────────────────────────
  const [channel, setChannel] = useState<Channel>('ml')
  const [activeTab, setActiveTab] = useState<TabId>('anuncios')
  const [isDark, setIsDark] = useState(true)
  const [showChannelMenu, setShowChannelMenu] = useState(false)
  const [showConfigPanel, setShowConfigPanel] = useState(false)
  const [data, setData] = useState<DataMap>(EMPTY_DATA)
  const [loading, setLoading] = useState<LoadingMap>(EMPTY_LOADING)
  const [loaded, setLoaded] = useState<Set<TabId>>(new Set())
  const [colDefs, setColDefs] = useState<ColMap>({
    anuncios: AN_COLS, categorias: CAT_COLS, marcas: BRAND_COLS,
    vendedores: USER_COLS, tendencias: TREND_COLS,
    produtos: PRODUTO_COLS, fornecedores: FORNECEDOR_COLS,
  })
  const [user, setUser] = useState<{ email?: string; name?: string } | null>(null)
  const [toast, setToast] = useState<string | null>(null)
  const [imposto, setImposto] = useState(0)

  const channelMenuRef = useRef<HTMLDivElement>(null)
  const configRef = useRef<HTMLDivElement>(null)

  // ── Tabs disponíveis por canal ────────────────────────────
  const tabs = channel === 'ml' ? TABS_ML : TABS_NONE

  // ── Auth ─────────────────────────────────────────────────
  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      if (data.user) setUser({
        email: data.user.email,
        name: data.user.user_metadata?.full_name || data.user.email?.split('@')[0],
      })
    })
  }, [])

  // ── Ajusta tab ativa ao trocar canal ─────────────────────
  useEffect(() => {
    const available = (channel === 'ml' ? TABS_ML : TABS_NONE).map(t => t.id)
    if (!available.includes(activeTab)) setActiveTab(available[0] as TabId)
  }, [channel])

  // ── Tema ─────────────────────────────────────────────────
  const bg       = isDark ? '#111827' : '#f3f4f6'
  const hbg      = isDark ? '#1f2937' : '#ffffff'
  const brd      = isDark ? '#374151' : '#e5e7eb'
  const txt      = isDark ? '#f9fafb' : '#111827'
  const txtM     = isDark ? '#9ca3af' : '#374151'
  const txtD     = isDark ? '#6b7280' : '#6b7280'
  const h1bg     = isDark ? '#1a2035' : '#1e3a8a'
  const rowBg    = isDark ? '#111827' : '#ffffff'
  const rowAlt   = isDark ? '#1a2234' : '#f8fafc'
  const hoverBg  = isDark ? '#1e3a5f' : '#dbeafe'
  const inputBg  = isDark ? '#0f172a' : '#ffffff'

  // ── Carregar dados ────────────────────────────────────────
  const loadTab = useCallback(async (tab: TabId, force = false) => {
    if (loaded.has(tab) && !force) return
    const cfg = TAB_CONFIG[tab]
    setLoading(l => ({ ...l, [tab]: true }))
    try {
      let allRows: Record<string, unknown>[] = []
      let offset = 0
      while (true) {
        let q = supabase.from(cfg.table).select('*').range(offset, offset + 999)
        if (cfg.filters) {
          Object.entries(cfg.filters).forEach(([k, v]) => { q = q.eq(k, v) })
        }
        if (cfg.orderBy) q = q.order(cfg.orderBy, { ascending: cfg.orderAsc ?? false })
        const { data: rows, error } = await q
        if (error) { console.error(error); break }
        if (!rows?.length) break
        allRows = [...allRows, ...rows as Record<string, unknown>[]]
        if (rows.length < 1000) break
        offset += rows.length
      }
      // receita calculada
      if (tab === 'anuncios') {
        allRows = allRows.map(r => ({
          ...r,
          receita: ((r.price as number) || 0) * ((r.sold_quantity as number) || 0),
        }))
      }
      setData(d => ({ ...d, [tab]: allRows }))
      setLoaded(s => new Set([...s, tab]))
      showToast(`✓ ${allRows.length.toLocaleString('pt-BR')} ${cfg.countLabel} carregados`)
    } catch (e) {
      console.error(e)
      showToast('Erro ao carregar dados')
    } finally {
      setLoading(l => ({ ...l, [tab]: false }))
    }
  }, [loaded, supabase])

  useEffect(() => { loadTab(activeTab) }, [activeTab])

  // ── Toast ─────────────────────────────────────────────────
  function showToast(msg: string) {
    setToast(msg)
    setTimeout(() => setToast(null), 2500)
  }

  // ── Logout ────────────────────────────────────────────────
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

  const currentChannel = CHANNELS.find(c => c.id === channel) || CHANNELS[0]

  const inputStyle: React.CSSProperties = {
    background: inputBg, border: `1px solid ${brd}`, borderRadius: 6,
    color: txt, fontSize: 11, padding: '4px 10px',
    fontFamily: 'inherit', outline: 'none',
  }

  return (
    <div style={{
      position: 'fixed', inset: 0, background: bg,
      display: 'flex', flexDirection: 'column',
      fontFamily: "'Inter', system-ui, sans-serif",
      color: txt, overflow: 'hidden',
      transition: 'background 0.2s, color 0.2s',
    }}>

      {/* ══ H1 ════════════════════════════════════════════ */}
      <div style={{
        display: 'flex', alignItems: 'center', height: 48, flexShrink: 0,
        background: h1bg, borderBottom: '1px solid rgba(255,255,255,0.08)',
        padding: '0 10px', gap: 0, position: 'relative',
      }}>

        {/* Logo */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexShrink: 0, marginRight: 10 }}>
          <div style={{
            background: '#ffe600', borderRadius: 6, width: 28, height: 28,
            display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 15,
          }}>📊</div>
          <span style={{ fontSize: 13, fontWeight: 800, letterSpacing: '.8px', color: '#ffe600' }}>
            ANALYTRICK
          </span>
        </div>

        {/* Separador */}
        <div style={{ width: 1, height: 20, background: 'rgba(255,255,255,0.15)', margin: '0 10px', flexShrink: 0 }} />

        {/* Canal Dropdown */}
        <div style={{ position: 'relative', flexShrink: 0 }} ref={channelMenuRef}>
          <button
            onClick={() => setShowChannelMenu(v => !v)}
            style={{
              display: 'flex', alignItems: 'center', gap: 6,
              background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.15)',
              borderRadius: 8, padding: '4px 12px', cursor: 'pointer',
              color: currentChannel.color, fontFamily: 'inherit',
              fontSize: 12, fontWeight: 700,
            }}
          >
            <span style={{ width: 8, height: 8, borderRadius: '50%', background: currentChannel.color, flexShrink: 0 }} />
            {currentChannel.label}
            <span style={{ fontSize: 9, opacity: 0.7 }}>▾</span>
          </button>

          {showChannelMenu && (
            <div style={{
              position: 'absolute', top: '100%', left: 0, marginTop: 6,
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
                    padding: '10px 14px', cursor: 'pointer', color: txt,
                    fontFamily: 'inherit', fontSize: 12,
                    fontWeight: channel === ch.id ? 700 : 400, textAlign: 'left',
                  }}
                  onMouseEnter={e => { if (channel !== ch.id) e.currentTarget.style.background = '#1e3a5f' }}
                  onMouseLeave={e => { if (channel !== ch.id) e.currentTarget.style.background = 'none' }}
                >
                  <span style={{ width: 10, height: 10, borderRadius: '50%', background: ch.color, flexShrink: 0 }} />
                  <div>
                    <div>{ch.label}</div>
                    {ch.id === null && (
                      <div style={{ fontSize: 10, color: txtD, marginTop: 2 }}>
                        Produtos, Categorias, Marcas...
                      </div>
                    )}
                    {ch.id === 'ml' && (
                      <div style={{ fontSize: 10, color: txtD, marginTop: 2 }}>
                        Anúncios, Categorias, Marcas...
                      </div>
                    )}
                  </div>
                  {channel === ch.id && <span style={{ marginLeft: 'auto', color: '#ffe600' }}>✓</span>}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Separador */}
        <div style={{ width: 1, height: 20, background: 'rgba(255,255,255,0.15)', margin: '0 10px', flexShrink: 0 }} />

        {/* ── Tabs (flex:1, alinhadas à direita da logo/canal) ── */}
        <div style={{ flex: 1, display: 'flex', alignItems: 'stretch', height: '100%', overflow: 'hidden' }}>
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              style={{
                display: 'flex', alignItems: 'center', padding: '0 16px',
                height: '100%', fontSize: 12, fontWeight: activeTab === tab.id ? 700 : 600,
                color: activeTab === tab.id ? '#ffe600' : 'rgba(255,255,255,0.55)',
                background: 'none', border: 'none',
                borderBottom: activeTab === tab.id ? '3px solid #ffe600' : '3px solid transparent',
                borderTop: '3px solid transparent',
                cursor: 'pointer', fontFamily: 'inherit',
                whiteSpace: 'nowrap', transition: 'color 0.15s',
              }}
              onMouseEnter={e => { if (activeTab !== tab.id) e.currentTarget.style.color = 'rgba(255,255,255,0.85)' }}
              onMouseLeave={e => { if (activeTab !== tab.id) e.currentTarget.style.color = 'rgba(255,255,255,0.55)' }}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* ── Ações direita ── */}
        <div style={{ display: 'flex', gap: 4, alignItems: 'center', flexShrink: 0 }}>

          {/* Tema */}
          <button
            onClick={() => setIsDark(v => !v)}
            title={isDark ? 'Modo claro' : 'Modo escuro'}
            style={{
              height: 30, width: 30, borderRadius: 5, fontSize: 14,
              background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.18)',
              color: 'rgba(255,255,255,0.8)', cursor: 'pointer', display: 'flex',
              alignItems: 'center', justifyContent: 'center',
            }}
          >
            {isDark ? '☀' : '🌙'}
          </button>

          {/* Configurações */}
          <div style={{ position: 'relative' }} ref={configRef}>
            <button
              onClick={() => setShowConfigPanel(v => !v)}
              title="Configurações"
              style={{
                height: 30, padding: '0 10px', borderRadius: 5, fontSize: 11, fontWeight: 600,
                background: showConfigPanel ? '#1e3a8a' : 'rgba(255,255,255,0.1)',
                border: '1px solid rgba(255,255,255,0.18)',
                color: 'rgba(255,255,255,0.8)', cursor: 'pointer',
                fontFamily: 'inherit', display: 'flex', alignItems: 'center', gap: 5,
              }}
            >
              ⚙ {user?.name || user?.email || ''}
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
                  <div style={{
                    width: 36, height: 36, borderRadius: '50%', background: '#1e3a8a',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16, flexShrink: 0,
                  }}>👤</div>
                  <div style={{ minWidth: 0 }}>
                    <div style={{ fontSize: 12, fontWeight: 700, color: txt, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {user?.name || 'Usuário'}
                    </div>
                    <div style={{ fontSize: 10, color: txtM, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {user?.email || ''}
                    </div>
                    <div style={{ fontSize: 9, color: '#4ade80', marginTop: 2 }}>● Acesso ativo</div>
                  </div>
                </div>

                {/* Financeiro */}
                <div style={{ padding: 16, borderBottom: `1px solid ${brd}` }}>
                  <div style={{ fontSize: 11, fontWeight: 700, color: txt, marginBottom: 4 }}>FINANCEIRO</div>
                  <div style={{ fontSize: 10, color: txtD, marginBottom: 8 }}>% Imposto aplicado sobre o preço</div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <input
                      type="number" min={0} max={100} step={0.1}
                      value={imposto}
                      onChange={e => setImposto(parseFloat(e.target.value) || 0)}
                      style={{ ...inputStyle, width: 80, textAlign: 'right' }}
                    />
                    <span style={{ fontSize: 11, color: txtM }}>%</span>
                  </div>
                </div>

                {/* Tema */}
                <div style={{ padding: 16, borderBottom: `1px solid ${brd}` }}>
                  <div style={{ fontSize: 11, fontWeight: 700, color: txt, marginBottom: 8 }}>APARÊNCIA</div>
                  <button
                    onClick={() => setIsDark(v => !v)}
                    style={{
                      display: 'flex', alignItems: 'center', gap: 8,
                      background: 'none', border: `1px solid ${brd}`, borderRadius: 8,
                      padding: '7px 12px', cursor: 'pointer', color: txt,
                      fontFamily: 'inherit', fontSize: 11, width: '100%',
                    }}
                  >
                    {isDark ? '☀ Modo claro' : '🌙 Modo escuro'}
                  </button>
                </div>

                {/* Sair */}
                <div style={{ padding: 12 }}>
                  <button
                    onClick={handleLogout}
                    style={{
                      width: '100%', background: 'rgba(239,68,68,0.1)',
                      border: '1px solid rgba(239,68,68,0.3)', borderRadius: 8,
                      color: '#ef4444', padding: '8px 12px', cursor: 'pointer',
                      fontFamily: 'inherit', fontSize: 12, fontWeight: 600,
                    }}
                  >
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
        {tabs.map(tab => (
          <div
            key={tab.id}
            style={{
              display: activeTab === tab.id ? 'flex' : 'none',
              flexDirection: 'column', height: '100%',
            }}
          >
            <DataTable
              rows={data[tab.id]}
              colDefs={colDefs[tab.id]}
              onColDefsChange={cols => setColDefs(c => ({ ...c, [tab.id]: cols }))}
              headerColor={TAB_CONFIG[tab.id].headerColor}
              headerColorSorted={TAB_CONFIG[tab.id].headerColorSorted}
              fixedKeys={TAB_CONFIG[tab.id].fixedKeys}
              countLabel={TAB_CONFIG[tab.id].countLabel}
              tableId={`atk-${tab.id}`}
              loading={loading[tab.id]}
              searchKeys={TAB_CONFIG[tab.id].searchKeys}
              isDark={isDark}
              rowBg={rowBg}
              rowAlt={rowAlt}
              hoverBg={hoverBg}
              onReload={() => {
                setLoaded(s => { const n = new Set(s); n.delete(tab.id); return n })
                loadTab(tab.id, true)
              }}
            />
          </div>
        ))}
      </div>

      {/* ══ Footer ════════════════════════════════════════ */}
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '0 12px', height: 24, flexShrink: 0,
        background: isDark ? '#0f172a' : '#e5e7eb',
        borderTop: `1px solid ${brd}`,
        fontSize: 9, color: txtD,
      }}>
        <span>ANALYTRICK · {currentChannel.label} · 1 clique = ordenar · Ctrl+clique = filtrar</span>
        <span>💡 Ctrl+clique no cabeçalho para filtrar colunas</span>
      </div>

      {/* Toast */}
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
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(8px); }
          to   { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  )
}
