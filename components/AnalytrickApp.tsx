'use client'

import React, { useState, useEffect, useCallback, useRef } from 'react'
import { createClient } from '@/lib/supabase/client'
import { DataTable } from '@/components/table/DataTable'
import { ColDef, CHANNELS, TABS, TabId, Channel } from '@/types'
import {
  AN_COLS, CAT_COLS, BRAND_COLS, TREND_COLS, USER_COLS, TOP100_COLS, HL_COLS,
} from '@/lib/colDefs'

// ── Tab configs ──────────────────────────────────────────────
const TAB_CONFIGS: Record<TabId, {
  cols: ColDef[]
  fixedKeys: Set<string>
  headerColor: string
  headerColorSorted: string
  countLabel: string
  searchKeys: string[]
  table: string | null
  query?: string
  orderBy?: string
}> = {
  anuncios: {
    cols: AN_COLS,
    fixedKeys: new Set(['thumbnail', 'title']),
    headerColor: '#0f766e',
    headerColorSorted: '#0d9488',
    countLabel: 'anúncios',
    searchKeys: ['title', 'attributes_brand', 'seller_name'],
    table: 'mercadolibre_items',
    query: 'select=*&eq.status=active&order=sold_quantity.desc.nullslast',
    orderBy: 'sold_quantity',
  },
  categorias: {
    cols: CAT_COLS,
    fixedKeys: new Set(['category_parent', 'category_tree']),
    headerColor: '#7c3aed',
    headerColorSorted: '#6d28d9',
    countLabel: 'categorias',
    searchKeys: ['category_name', 'category_tree', 'category_parent'],
    table: 'mercadolibre_categories',
    orderBy: 'category_tree',
  },
  marcas: {
    cols: BRAND_COLS,
    fixedKeys: new Set(['brand']),
    headerColor: '#0369a1',
    headerColorSorted: '#0284c7',
    countLabel: 'marcas',
    searchKeys: ['brand'],
    table: 'mercadolibre_brands',
    orderBy: 'results',
  },
  tendencias: {
    cols: TREND_COLS,
    fixedKeys: new Set(['trends_rank']),
    headerColor: '#0f766e',
    headerColorSorted: '#0d9488',
    countLabel: 'tendências',
    searchKeys: ['keyword'],
    table: 'mercadolibre_trends',
    orderBy: 'trends_rank',
  },
  vendedores: {
    cols: USER_COLS,
    fixedKeys: new Set(['nickname']),
    headerColor: '#1d4ed8',
    headerColorSorted: '#1e40af',
    countLabel: 'vendedores',
    searchKeys: ['nickname', 'address_city', 'address_state'],
    table: 'mercadolibre_users',
    orderBy: 'created_at',
  },
  top100: {
    cols: TOP100_COLS,
    fixedKeys: new Set(['ranking']),
    headerColor: '#b45309',
    headerColorSorted: '#92400e',
    countLabel: 'itens',
    searchKeys: ['title', 'seller_alias'],
    table: 'mercadolibre_top100',
    orderBy: 'ranking',
  },
  destaques: {
    cols: HL_COLS,
    fixedKeys: new Set(['thumbnail', 'title']),
    headerColor: '#7c3aed',
    headerColorSorted: '#6d28d9',
    countLabel: 'destaques',
    searchKeys: ['title', 'attributes_brand'],
    table: 'mercadolibre_items',
    query: 'select=*&eq.status=active&order=visits.desc.nullslast',
    orderBy: 'visits',
  },
}

// Abas disponíveis sem canal
const TABS_SEM_CANAL: TabId[] = ['categorias', 'marcas']

export default function AnalytrickApp() {
  const supabase = createClient()

  // ── State ────────────────────────────────────────────────
  const [channel, setChannel] = useState<Channel>('ml')
  const [activeTab, setActiveTab] = useState<TabId>('anuncios')
  const [showChannelMenu, setShowChannelMenu] = useState(false)
  const [data, setData] = useState<Record<TabId, Record<string, unknown>[]>>({
    anuncios: [], categorias: [], marcas: [], tendencias: [],
    vendedores: [], top100: [], destaques: [],
  })
  const [loading, setLoading] = useState<Record<TabId, boolean>>({
    anuncios: false, categorias: false, marcas: false, tendencias: false,
    vendedores: false, top100: false, destaques: false,
  })
  const [loaded, setLoaded] = useState<Set<TabId>>(new Set())
  const [colDefs, setColDefs] = useState<Record<TabId, ColDef[]>>({
    anuncios: AN_COLS,
    categorias: CAT_COLS,
    marcas: BRAND_COLS,
    tendencias: TREND_COLS,
    vendedores: USER_COLS,
    top100: TOP100_COLS,
    destaques: HL_COLS,
  })
  const [user, setUser] = useState<{ email?: string; name?: string } | null>(null)
  const [toast, setToast] = useState<string | null>(null)
  const channelMenuRef = useRef<HTMLDivElement>(null)

  // ── Auth ─────────────────────────────────────────────────
  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      if (data.user) {
        setUser({
          email: data.user.email,
          name: data.user.user_metadata?.full_name || data.user.email?.split('@')[0],
        })
      }
    })
  }, [])

  // ── Canal: ajusta tab ativa se não disponível ─────────────
  useEffect(() => {
    if (channel === null && !TABS_SEM_CANAL.includes(activeTab)) {
      setActiveTab('categorias')
    }
  }, [channel])

  // ── Tabs disponíveis ──────────────────────────────────────
  const availableTabs = TABS.filter(t => {
    if (channel === null) return TABS_SEM_CANAL.includes(t.id)
    return true
  })

  // ── Carregar dados ────────────────────────────────────────
  const loadTab = useCallback(async (tab: TabId) => {
    if (loaded.has(tab)) return
    const cfg = TAB_CONFIGS[tab]
    if (!cfg.table) return

    setLoading(l => ({ ...l, [tab]: true }))
    try {
      let allRows: Record<string, unknown>[] = []
      let offset = 0
      const limit = 1000

      while (true) {
        let q = supabase.from(cfg.table).select('*').range(offset, offset + limit - 1)
        if (tab === 'anuncios' || tab === 'destaques') q = q.eq('status', 'active')
        if (cfg.orderBy) {
          q = q.order(cfg.orderBy, { ascending: tab === 'categorias' || tab === 'tendencias' || tab === 'top100' })
        }
        const { data: rows, error } = await q
        if (error) { console.error(error); break }
        if (!rows || rows.length === 0) break
        allRows = [...allRows, ...rows as Record<string, unknown>[]]
        if (rows.length < limit) break
        offset += limit
      }

      // receita calculada para anúncios e destaques
      if (tab === 'anuncios' || tab === 'destaques') {
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
    } finally {
      setLoading(l => ({ ...l, [tab]: false }))
    }
  }, [loaded, supabase])

  // auto-load ao trocar de tab
  useEffect(() => {
    loadTab(activeTab)
  }, [activeTab, loadTab])

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

  // ── Canal atual ───────────────────────────────────────────
  const currentChannel = CHANNELS.find(c => c.id === channel) || CHANNELS[0]

  // ── Close channel menu on outside click ───────────────────
  useEffect(() => {
    if (!showChannelMenu) return
    function handler(e: MouseEvent) {
      if (channelMenuRef.current && !channelMenuRef.current.contains(e.target as Node)) {
        setShowChannelMenu(false)
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [showChannelMenu])

  const cfg = TAB_CONFIGS[activeTab]

  return (
    <div style={{
      position: 'fixed', inset: 0,
      background: '#111827',
      display: 'flex', flexDirection: 'column',
      fontFamily: "'Inter', system-ui, sans-serif",
      color: '#f9fafb', overflow: 'hidden',
    }}>

      {/* ══ H1 — Barra principal ══════════════════════════ */}
      <div style={{
        display: 'flex', alignItems: 'center', height: 48, flexShrink: 0,
        background: '#1a2035',
        borderBottom: '1px solid rgba(255,255,255,0.08)',
        padding: '0 10px', gap: 0,
      }}>

        {/* Logo */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginRight: 16, flexShrink: 0 }}>
          <div style={{
            background: '#ffe600', borderRadius: 6, width: 28, height: 28,
            display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 15,
          }}>📊</div>
          <span style={{ fontSize: 13, fontWeight: 800, letterSpacing: '.8px', color: '#ffe600', textTransform: 'uppercase' }}>
            ANALYTRICK
          </span>
        </div>

        {/* ── Canal Dropdown ── */}
        <div style={{ position: 'relative', marginRight: 12, flexShrink: 0 }} ref={channelMenuRef}>
          <button
            onClick={() => setShowChannelMenu(v => !v)}
            style={{
              display: 'flex', alignItems: 'center', gap: 6,
              background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.15)',
              borderRadius: 8, padding: '4px 12px', cursor: 'pointer',
              color: currentChannel.color, fontFamily: 'inherit',
              fontSize: 12, fontWeight: 700, letterSpacing: '.3px',
              transition: 'background 0.15s',
            }}
          >
            <span style={{
              width: 8, height: 8, borderRadius: '50%',
              background: currentChannel.color, flexShrink: 0,
            }} />
            {currentChannel.label}
            <span style={{ fontSize: 9, opacity: 0.7, marginLeft: 2 }}>▾</span>
          </button>

          {showChannelMenu && (
            <div style={{
              position: 'absolute', top: '100%', left: 0, marginTop: 4,
              background: '#1f2937', border: '1px solid #374151',
              borderRadius: 10, minWidth: 200,
              boxShadow: '0 8px 32px rgba(0,0,0,0.6)',
              zIndex: 9999, overflow: 'hidden',
            }}>
              <div style={{ padding: '8px 12px', borderBottom: '1px solid #374151', fontSize: 10, color: '#6b7280', fontWeight: 700, letterSpacing: '.5px' }}>
                CANAL DE DADOS
              </div>
              {CHANNELS.map(ch => (
                <button
                  key={ch.id ?? 'none'}
                  onClick={() => {
                    setChannel(ch.id)
                    setShowChannelMenu(false)
                    // reset loaded para forçar reload no novo canal (futuramente)
                  }}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 10,
                    width: '100%', background: channel === ch.id ? '#1e3a8a' : 'none',
                    border: 'none', borderBottom: '1px solid #1e2535',
                    padding: '10px 14px', cursor: 'pointer', color: '#f9fafb',
                    fontFamily: 'inherit', fontSize: 12, fontWeight: channel === ch.id ? 700 : 400,
                    textAlign: 'left', transition: 'background 0.1s',
                  }}
                  onMouseEnter={e => { if (channel !== ch.id) e.currentTarget.style.background = '#273549' }}
                  onMouseLeave={e => { if (channel !== ch.id) e.currentTarget.style.background = 'none' }}
                >
                  <span style={{ width: 10, height: 10, borderRadius: '50%', background: ch.color, flexShrink: 0 }} />
                  <div>
                    <div>{ch.label}</div>
                    {ch.id === null && (
                      <div style={{ fontSize: 10, color: '#6b7280', marginTop: 2 }}>
                        Categorias, Marcas, Produtos
                      </div>
                    )}
                  </div>
                  {channel === ch.id && <span style={{ marginLeft: 'auto', color: '#ffe600' }}>✓</span>}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* ── Tabs de módulo ── */}
        <div style={{ flex: 1, display: 'flex', alignItems: 'stretch', height: '100%', gap: 0, overflow: 'hidden' }}>
          {availableTabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className="atk-tab"
              style={{
                color: activeTab === tab.id ? '#ffe600' : 'rgba(255,255,255,0.55)',
                borderBottom: activeTab === tab.id ? '3px solid #ffe600' : '3px solid transparent',
                fontWeight: activeTab === tab.id ? 700 : 600,
              }}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* ── Ações direita ── */}
        <div style={{ display: 'flex', gap: 4, alignItems: 'center', flexShrink: 0 }}>
          <button
            onClick={() => loadTab(activeTab)}
            className="atk-btn"
            title="Recarregar dados"
            style={{ fontSize: 11 }}
          >
            ↻ Atualizar
          </button>
          <div style={{ width: 1, height: 20, background: 'rgba(255,255,255,0.12)', margin: '0 4px' }} />
          {user && (
            <span style={{ fontSize: 10, color: '#6b7280', marginRight: 4 }}>
              {user.name || user.email}
            </span>
          )}
          <button onClick={handleLogout} className="atk-btn" style={{ color: '#ef4444', borderColor: 'rgba(239,68,68,0.3)' }}>
            Sair
          </button>
        </div>
      </div>

      {/* ══ Conteúdo ══════════════════════════════════════ */}
      <div style={{ flex: 1, overflow: 'hidden', minHeight: 0, display: 'flex', flexDirection: 'column' }}>
        {availableTabs.map(tab => (
          <div
            key={tab.id}
            style={{
              display: activeTab === tab.id ? 'flex' : 'none',
              flexDirection: 'column',
              flex: 1,
              overflow: 'hidden',
              minHeight: 0,
            }}
          >
            <DataTable
              rows={data[tab.id]}
              colDefs={colDefs[tab.id]}
              onColDefsChange={cols => setColDefs(c => ({ ...c, [tab.id]: cols }))}
              headerColor={TAB_CONFIGS[tab.id].headerColor}
              headerColorSorted={TAB_CONFIGS[tab.id].headerColorSorted}
              fixedKeys={TAB_CONFIGS[tab.id].fixedKeys}
              countLabel={TAB_CONFIGS[tab.id].countLabel}
              tableId={`atk-${tab.id}`}
              loading={loading[tab.id]}
              searchKeys={TAB_CONFIGS[tab.id].searchKeys}
            />
          </div>
        ))}
      </div>

      {/* ══ Footer ════════════════════════════════════════ */}
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '4px 12px', height: 26, flexShrink: 0,
        background: '#0f172a', borderTop: '1px solid #1e2535',
        fontSize: 9, color: '#4b5563',
      }}>
        <span>ANALYTRICK · {currentChannel.label} · 1 clique = ordenar · Ctrl+clique = filtrar</span>
        <span>💡 Use Ctrl+clique no cabeçalho para filtrar colunas</span>
      </div>

      {/* Toast */}
      {toast && (
        <div className="atk-toast">{toast}</div>
      )}
    </div>
  )
}
