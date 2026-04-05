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

type DataMap    = Record<TabId, Record<string, unknown>[]>
type LoadingMap = Record<TabId, boolean>
type ColMap     = Record<TabId, ColDef[]>

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

// Canais: Home primeiro, resto alfabético
const CHANNELS_SORTED = [
  CHANNELS.find(c => c.id === null)!,
  ...CHANNELS.filter(c => c.id !== null).sort((a, b) => a.label.localeCompare(b.label, 'pt-BR')),
]

export default function AnalytrickApp() {
  const supabase = createClient()

  // Home = null como padrão
  const [channel, setChannel]             = useState<Channel>(null)
  const [activeTab, setActiveTab]         = useState<TabId>('categorias')
  const [isDark, setIsDark]               = useState(true)
  const [showChannelMenu, setShowChannelMenu] = useState(false)
  const [showConfigPanel, setShowConfigPanel] = useState(false)
  const [configTab, setConfigTab]         = useState<'CONTA'|'FINANCEIRO'|'PAGINAÇÃO'>('CONTA')
  const [data, setData]                   = useState<DataMap>(EMPTY_DATA())
  const [loading, setLoading]             = useState<LoadingMap>(EMPTY_LOADING())
  const [loaded, setLoaded]               = useState<Set<string>>(new Set())
  const [colDefs, setColDefs]             = useState<ColMap>(INIT_COLS())
  const [user, setUser]                   = useState<{ email?: string; name?: string; role?: string; status?: string } | null>(null)
  const [toast, setToast]                 = useState<string | null>(null)
  const [imposto, setImposto]             = useState(0)
  const [roi, setRoi]                     = useState(20)

  const channelMenuRef = useRef<HTMLDivElement>(null)
  const configRef      = useRef<HTMLDivElement>(null)

  const tabs      = channel === null ? TABS_NO_CHANNEL : TABS_WITH_CHANNEL
  const currentCh = CHANNELS.find(c => c.id === channel) || CHANNELS.find(c => c.id === null)!
  const chKey     = channel ?? 'none'
  const isAdmin   = user?.role === 'admin' || user?.role === 'tester'

  // ── Auth ─────────────────────────────────────────────────
  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      if (data.user) setUser({
        email:  data.user.email,
        name:   data.user.user_metadata?.full_name || data.user.email?.split('@')[0],
        role:   data.user.user_metadata?.role,
        status: data.user.user_metadata?.status || 'active',
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
  const brd2    = isDark ? '#2d3748' : '#d1d5db'
  const txt     = isDark ? '#f9fafb' : '#111827'
  const txtM    = isDark ? '#9ca3af' : '#374151'
  const txtD    = isDark ? '#6b7280' : '#9ca3af'
  const txtVD   = isDark ? '#4b5563' : '#9ca3af'
  const h1bg    = isDark ? '#1a2035' : '#1e3a8a'
  const h2bg    = isDark ? '#111827' : '#ffffff'
  const rowBg   = isDark ? '#111827' : '#ffffff'
  const rowAlt  = isDark ? '#1a2234' : '#f8fafc'
  const hoverBg = isDark ? '#1e3a5f' : '#dbeafe'
  const inputBg = isDark ? '#0f172a' : '#ffffff'

  // ── Tab/canal configs ────────────────────────────────────
  function getTable(tab: TabId, ch: ChannelOption): string | null {
    switch (tab) {
      case 'anuncios':     return ch.itemsTable
      case 'vendedores':   return ch.usersTable
      case 'categorias':   return ch.categoriesTable
      case 'marcas':       return ch.brandsTable
      case 'tendencias':   return ch.trendsTable
      case 'produtos':     return 'products'
      case 'fornecedores': return 'suppliers'
    }
  }
  function getOrderBy(tab: TabId) {
    const m: Record<TabId, {col:string;asc:boolean}> = {
      anuncios:    {col:'sold_quantity',asc:false},
      tendencias:  {col:'trends_rank',  asc:true },
      categorias:  {col:'category_tree',asc:true },
      marcas:      {col:'results',      asc:false},
      vendedores:  {col:'created_at',   asc:false},
      produtos:    {col:'title',        asc:true },
      fornecedores:{col:'name',         asc:true },
    }
    return m[tab]
  }
  const COUNT_LABEL: Record<TabId,string> = {
    anuncios:'anúncios',categorias:'categorias',marcas:'marcas',
    vendedores:'vendedores',tendencias:'tendências',
    produtos:'produtos',fornecedores:'fornecedores',
  }
  const SEARCH_KEYS: Record<TabId,string[]> = {
    anuncios:   ['title','attributes_brand','seller_name'],
    categorias: ['category_name','category_tree','category_parent'],
    marcas:     ['brand'],
    vendedores: ['nickname','address_city','address_state'],
    tendencias: ['keyword'],
    produtos:   ['title','brand'],
    fornecedores:['name','email'],
  }
  const CHANNEL_HEADER: Record<string,{a:string;v:string}> = {
    ml:    {a:'#0f766e',v:'#1d4ed8'},
    shopee:{a:'#c73e23',v:'#b03322'},
    amazon:{a:'#c46a00',v:'#a35500'},
    magalu:{a:'#0062cc',v:'#004fa3'},
    shein: {a:'#d42e7a',v:'#aa2462'},
    none:  {a:'#7c3aed',v:'#1d4ed8'},
  }
  function getHeaderColor(tab: TabId) {
    const ch = CHANNEL_HEADER[chKey] || CHANNEL_HEADER.none
    if (tab==='anuncios')   return {hc:ch.a,hcs:ch.a+'cc'}
    if (tab==='vendedores') return {hc:ch.v,hcs:ch.v+'cc'}
    const m: Record<TabId,{hc:string;hcs:string}> = {
      categorias:  {hc:'#7c3aed',hcs:'#6d28d9'},
      marcas:      {hc:'#0369a1',hcs:'#0284c7'},
      tendencias:  {hc:'#0f766e',hcs:'#0d9488'},
      produtos:    {hc:'#0f766e',hcs:'#0d9488'},
      fornecedores:{hc:'#1d4ed8',hcs:'#1e40af'},
      anuncios:    {hc:'#0f766e',hcs:'#0d9488'},
      vendedores:  {hc:'#1d4ed8',hcs:'#1e40af'},
    }
    return m[tab]
  }
  const FIXED_KEYS: Record<TabId,Set<string>> = {
    anuncios:    new Set(['thumbnail','title']),
    categorias:  new Set(['category_parent','category_tree']),
    marcas:      new Set(['brand']),
    vendedores:  new Set(['nickname']),
    tendencias:  new Set(['trends_rank']),
    produtos:    new Set(['thumbnail','title']),
    fornecedores:new Set(['name']),
  }

  // ── Carregar dados ────────────────────────────────────────
  const loadTab = useCallback(async (tab: TabId, force = false) => {
    const key = `${chKey}:${tab}`
    if (loaded.has(key) && !force) return
    const table = getTable(tab, currentCh)
    if (!table) { setData(d => ({...d,[tab]:[]})); return }

    setLoading(l => ({...l,[tab]:true}))
    try {
      let rows: Record<string,unknown>[] = []
      let offset = 0
      const {col,asc} = getOrderBy(tab)
      while (true) {
        let q = supabase.from(table).select('*').range(offset, offset+999)
        if (tab==='anuncios') q = q.eq('status','active')
        q = q.order(col, {ascending:asc})
        const {data:batch, error} = await q
        if (error) { console.error(error); break }
        if (!batch?.length) break
        rows = [...rows, ...batch as Record<string,unknown>[]]
        if (batch.length < 1000) break
        offset += batch.length
      }
      if (tab==='anuncios') {
        rows = rows.map(r => ({...r, receita:((r.price as number)||0)*((r.sold_quantity as number)||0)}))
      }
      setData(d => ({...d,[tab]:rows}))
      setLoaded(s => new Set([...s, key]))
      showToast(`✓ ${rows.length.toLocaleString('pt-BR')} ${COUNT_LABEL[tab]} carregados`)
    } catch(e) {
      console.error(e); showToast('Erro ao carregar dados')
    } finally {
      setLoading(l => ({...l,[tab]:false}))
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

  // ── Estilos ───────────────────────────────────────────────
  const btnH1 = (active=false, red=false): React.CSSProperties => ({
    height:30, padding:'0 10px', borderRadius:5, fontSize:11, fontWeight:600,
    cursor:'pointer', fontFamily:'inherit',
    display:'inline-flex', alignItems:'center', gap:4,
    whiteSpace:'nowrap', transition:'background .15s, transform .1s',
    background: red ? 'rgba(220,38,38,.7)' : active ? '#ffe600' : 'rgba(255,255,255,.1)',
    color:       red ? '#fff'              : active ? '#111'    : 'rgba(255,255,255,.8)',
    border:      red ? '1px solid rgba(185,28,28,.8)' : active ? '1px solid #d4b800' : '1px solid rgba(255,255,255,.18)',
  })
  const vsep: React.CSSProperties = {
    width:1, height:20, background:'rgba(255,255,255,.12)', flexShrink:0, margin:'0 2px',
  }
  const footerBtn: React.CSSProperties = {
    background:hbg, border:`1px solid ${brd}`, borderRadius:6,
    color:txtM, cursor:'pointer', fontSize:10, fontFamily:'inherit',
    fontWeight:700, padding:'6px 12px', letterSpacing:'.4px', whiteSpace:'nowrap',
  }
  const cfgTabStyle = (active: boolean): React.CSSProperties => ({
    flex:1, padding:'7px 4px',
    background: active ? bg : 'none',
    border:'none',
    borderBottom: active ? '2px solid #3b82f6' : '2px solid transparent',
    color: active ? txt : txtVD,
    fontSize:10, fontWeight:700, cursor:'pointer',
    fontFamily:'inherit', letterSpacing:'.4px',
  })
  const cfgInputStyle: React.CSSProperties = {
    width:80, background:inputBg, border:`1.5px solid ${brd}`, borderRadius:6,
    color:txt, fontSize:14, fontWeight:700, padding:'6px 10px',
    fontFamily:'inherit', textAlign:'right', outline:'none',
  }

  return (
    <div style={{
      position:'fixed', inset:0, background:bg,
      display:'flex', flexDirection:'column',
      fontFamily:"'Inter', system-ui, sans-serif",
      color:txt, overflow:'hidden',
    }}>

      {/* ══ H1 ════════════════════════════════════════════ */}
      <div style={{
        display:'flex', alignItems:'center', height:48, flexShrink:0,
        background:h1bg, borderBottom:'1px solid rgba(255,255,255,0.08)',
        padding:'0 10px', gap:0,
      }}>

        {/* Logo — sem nome do canal aqui */}
        <div style={{display:'flex',alignItems:'center',gap:6,flexShrink:0,marginRight:8}}>
          <div style={{background:'#ffe600',borderRadius:6,width:28,height:28,display:'flex',alignItems:'center',justifyContent:'center',fontSize:15}}>📊</div>
          <span style={{fontSize:13,fontWeight:800,letterSpacing:'.8px',color:'#ffe600'}}>Analytrick</span>
        </div>

        {/* Canal Dropdown — ao lado do logo */}
        <div style={{position:'relative',marginRight:8,flexShrink:0}} ref={channelMenuRef}>
          <button onClick={() => setShowChannelMenu(v => !v)} style={{...btnH1(false), gap:6}} title="Selecionar canal">
            <span style={{width:8,height:8,borderRadius:'50%',background:currentCh.color,flexShrink:0}}/>
            {channel === null ? 'Home' : currentCh.label}
            <span style={{fontSize:9,opacity:.7}}>▾</span>
          </button>

          {showChannelMenu && (
            <div style={{
              position:'absolute', top:'100%', left:0, marginTop:6,
              background:hbg, border:`1px solid ${brd}`,
              borderRadius:10, minWidth:210,
              boxShadow:'0 8px 32px rgba(0,0,0,.5)', zIndex:9999, overflow:'hidden',
            }}>
              <div style={{padding:'7px 12px',borderBottom:`1px solid ${brd}`,fontSize:10,color:txtVD,fontWeight:700,letterSpacing:'.5px'}}>
                CANAL DE DADOS
              </div>
              {CHANNELS_SORTED.map(ch => (
                <button key={ch.id ?? 'none'}
                  onClick={() => { setChannel(ch.id); setShowChannelMenu(false) }}
                  style={{
                    display:'flex',alignItems:'center',gap:10,width:'100%',
                    background: channel===ch.id ? '#1e3a8a' : 'none',
                    border:'none', borderBottom:`1px solid ${brd2}`,
                    padding:'9px 14px', cursor:'pointer', color:txt,
                    fontFamily:'inherit', fontSize:12,
                    fontWeight: channel===ch.id ? 700 : 400, textAlign:'left',
                  }}
                  onMouseEnter={e => { if (channel!==ch.id) e.currentTarget.style.background=hoverBg }}
                  onMouseLeave={e => { if (channel!==ch.id) e.currentTarget.style.background='none' }}
                >
                  <span style={{width:10,height:10,borderRadius:'50%',background:ch.color,flexShrink:0}}/>
                  {ch.id===null ? 'Home' : ch.label}
                  {channel===ch.id && <span style={{marginLeft:'auto',color:'#ffe600'}}>✓</span>}
                </button>
              ))}
            </div>
          )}
        </div>

        <div style={vsep}/>

        {/* Flex para empurrar tabs à direita */}
        <div style={{flex:1}}/>

        {/* ── Tabs módulos à direita ── */}
        <div style={{display:'flex',alignItems:'stretch',height:'100%',overflow:'hidden'}}>
          {tabs.map(tab => (
            <button key={tab.id} onClick={() => setActiveTab(tab.id)}
              style={{
                display:'flex',alignItems:'center',padding:'0 14px',
                height:'100%',fontSize:12,
                fontWeight: activeTab===tab.id ? 700 : 600,
                color: activeTab===tab.id ? '#ffe600' : 'rgba(255,255,255,.55)',
                background: activeTab===tab.id ? 'rgba(255,230,0,.08)' : 'none',
                border:'none',
                borderBottom: activeTab===tab.id ? '3px solid #ffe600' : '3px solid transparent',
                borderTop:'3px solid transparent',
                cursor:'pointer',fontFamily:'inherit',whiteSpace:'nowrap',
                transition:'color .15s',
              }}
              onMouseEnter={e => { if (activeTab!==tab.id) e.currentTarget.style.color='rgba(255,255,255,.85)' }}
              onMouseLeave={e => { if (activeTab!==tab.id) e.currentTarget.style.color='rgba(255,255,255,.55)' }}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div style={vsep}/>

        {/* ── Ações direita ── */}
        <div style={{display:'flex',gap:4,alignItems:'center',flexShrink:0}}>
          <button onClick={() => setIsDark(v => !v)} title={isDark?'Modo claro':'Modo escuro'} style={btnH1()}>
            {isDark ? '☀' : '🌙'}
          </button>

          {/* Config — só ícone ⚙ */}
          <div style={{position:'relative'}} ref={configRef}>
            <button onClick={() => setShowConfigPanel(v => !v)} title="Configurações" style={btnH1(showConfigPanel)}>
              ⚙
            </button>

            {showConfigPanel && (
              <div style={{
                position:'absolute', top:'100%', right:0, marginTop:6,
                background:hbg, border:`1px solid ${brd}`, borderRadius:12,
                width:320, boxShadow:'0 8px 40px rgba(0,0,0,.6)',
                zIndex:9999, overflow:'hidden',
              }}>
                {/* Header do painel */}
                <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',padding:'10px 16px',borderBottom:`1px solid ${brd}`}}>
                  <span style={{fontSize:12,fontWeight:800,color:txt,letterSpacing:'.5px'}}>⚙ CONFIGURAÇÕES</span>
                  <button onClick={() => setShowConfigPanel(false)} style={{background:'none',border:'none',color:txtD,cursor:'pointer',fontSize:18,lineHeight:1}}>✕</button>
                </div>

                {/* Usuário */}
                <div style={{padding:'12px 16px',borderBottom:`1px solid ${brd}`,display:'flex',alignItems:'center',gap:10}}>
                  <div style={{width:36,height:36,borderRadius:'50%',background:'#1e3a8a',display:'flex',alignItems:'center',justifyContent:'center',fontSize:16,flexShrink:0}}>👤</div>
                  <div style={{minWidth:0,flex:1}}>
                    <div style={{fontSize:12,fontWeight:700,color:txt,overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{user?.email || 'Usuário'}</div>
                    <div style={{fontSize:10,color:txtM,overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{user?.email || ''}</div>
                    <div style={{fontSize:9,color:'#4ade80',marginTop:2}}>● Acesso ativo</div>
                  </div>
                  <button onClick={handleLogout} style={{background:'none',border:`1px solid ${brd}`,borderRadius:6,color:txtD,cursor:'pointer',fontSize:10,padding:'4px 8px',fontFamily:'inherit',whiteSpace:'nowrap'}}>Sair</button>
                </div>

                {/* Abas */}
                <div style={{display:'flex',borderBottom:`1px solid ${brd}`}}>
                  {(['CONTA','FINANCEIRO','PAGINAÇÃO'] as const).map(t => (
                    <button key={t} style={cfgTabStyle(configTab===t)} onClick={() => setConfigTab(t)}>{t}</button>
                  ))}
                </div>

                {/* Conteúdo da aba */}
                <div style={{padding:16,display:'flex',flexDirection:'column',gap:12,maxHeight:380,overflowY:'auto'}}>

                  {configTab === 'CONTA' && (
                    <div style={{fontSize:11,color:txtM,lineHeight:1.7}}>
                      <div><strong style={{color:txt}}>Nome:</strong> {user?.name || '—'}</div>
                      <div><strong style={{color:txt}}>Email:</strong> {user?.email || '—'}</div>
                      <div><strong style={{color:txt}}>Status:</strong> <span style={{color:'#4ade80'}}>{user?.status || '—'}</span></div>
                      <div><strong style={{color:txt}}>Role:</strong> <span style={{color:isAdmin?'#ffe600':'#60a5fa',fontWeight:700}}>{(user?.role||'user').toUpperCase()}</span></div>
                      <div style={{marginTop:8,fontSize:9,color:txtVD}}>Versão: 0.19.0 · ARCA SYSTEMS LTDA</div>
                    </div>
                  )}

                  {configTab === 'FINANCEIRO' && (
                    <>
                      <div>
                        <div style={{fontSize:11,fontWeight:600,color:txt,marginBottom:4}}>% Imposto</div>
                        <div style={{fontSize:9,color:txtVD,marginBottom:8}}>Aplicado sobre o PREÇO de cada item</div>
                        <div style={{display:'flex',alignItems:'center',gap:8}}>
                          <input type="number" min={0} max={100} step={0.1} value={imposto}
                            onChange={e => setImposto(parseFloat(e.target.value)||0)}
                            style={cfgInputStyle}/>
                          <span style={{fontSize:13,color:txtM,fontWeight:700}}>%</span>
                        </div>
                      </div>
                      <div>
                        <div style={{fontSize:11,fontWeight:600,color:txt,marginBottom:4}}>% ROI Padrão</div>
                        <div style={{fontSize:9,color:txtVD,marginBottom:8}}>Pré-preenchido na Calculadora (pode ser alterado)</div>
                        <div style={{display:'flex',alignItems:'center',gap:8}}>
                          <input type="number" min={0} max={1000} step={0.1} value={roi}
                            onChange={e => setRoi(parseFloat(e.target.value)||0)}
                            style={cfgInputStyle}/>
                          <span style={{fontSize:13,color:txtM,fontWeight:700}}>%</span>
                        </div>
                      </div>
                      <div style={{fontSize:9,color:txtVD,lineHeight:1.5,padding:8,background:bg,borderRadius:6}}>
                        📌 TAXA VENDA e FRETE VENDA = R$ 0,00 (em breve)<br/>
                        📌 PREÇO CUSTO: edite direto na célula da tabela
                      </div>
                      <button
                        onClick={() => showToast(`✓ Imposto: ${imposto}% · ROI: ${roi}%`)}
                        style={{background:'#1e3a8a',border:'1px solid #163470',borderRadius:8,color:'#fff',padding:'8px',cursor:'pointer',fontFamily:'inherit',fontSize:12,fontWeight:700}}>
                        ✓ Salvar Financeiro
                      </button>
                    </>
                  )}

                  {configTab === 'PAGINAÇÃO' && (
                    <div style={{fontSize:11,color:txtM,lineHeight:1.7}}>
                      <div style={{color:txtVD,marginBottom:8,fontSize:10}}>Configuração de paginação por canal (em breve)</div>
                      {CHANNELS.filter(c => c.id !== null).map(ch => (
                        <div key={ch.id} style={{display:'flex',alignItems:'center',gap:8,padding:'6px 0',borderBottom:`1px solid ${brd2}`}}>
                          <span style={{fontSize:10,color:ch.color,fontWeight:700,minWidth:110}}>{ch.label}</span>
                          <span style={{fontSize:11,color:txt}}>2 páginas</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Sair */}
          <button onClick={handleLogout} title="Sair" style={btnH1(false, true)}>✕</button>
        </div>
      </div>

      {/* ══ Conteúdo ══════════════════════════════════════ */}
      <div style={{flex:1,overflow:'hidden',minHeight:0}}>
        {tabs.map(tab => {
          const {hc, hcs} = getHeaderColor(tab.id)
          return (
            <div key={tab.id} style={{display:activeTab===tab.id?'flex':'none',flexDirection:'column',height:'100%'}}>
              <DataTable
                rows={data[tab.id]}
                colDefs={colDefs[tab.id]}
                onColDefsChange={cols => setColDefs(c => ({...c,[tab.id]:cols}))}
                headerColor={hc}
                headerColorSorted={hcs}
                fixedKeys={FIXED_KEYS[tab.id]}
                countLabel={COUNT_LABEL[tab.id]}
                tableId={`atk-${chKey}-${tab.id}`}
                loading={loading[tab.id]}
                searchKeys={SEARCH_KEYS[tab.id]}
                isDark={isDark}
                rowBg={rowBg} rowAlt={rowAlt} hoverBg={hoverBg}
                h2bg={h2bg} brd={brd} brd2={brd2}
                txt={txt} txtM={txtM} txtD={txtD} txtVD={txtVD}
                isAdmin={isAdmin}
              />
            </div>
          )
        })}
      </div>

      {/* ══ Footer ════════════════════════════════════════ */}
      <div style={{
        display:'flex',justifyContent:'space-between',alignItems:'center',
        padding:'0 12px',height:48,flexShrink:0,
        background:bg, borderTop:`1px solid ${brd}`,
        fontSize:11,color:txtD,gap:8,
      }}>
        <div style={{display:'flex',flexDirection:'column',gap:2,flex:1,minWidth:0,overflow:'hidden'}}>
          <span>ANALYTRICK · {channel===null?'Home':currentCh.label} · 1 clique = ordenar · Ctrl+clique = filtrar</span>
          <span style={{fontSize:9,color:txtVD,opacity:.7}}>💡 ⚙ Páginas (1–4) · PREÇO CUSTO = clique na célula para editar · % Imposto = aplica sobre o preço</span>
        </div>
        <div style={{display:'flex',alignItems:'center',gap:6,flexShrink:0}}>
          <button style={footerBtn} title="Ajuda">❓ AJUDA</button>
          <button style={footerBtn} title="Tabela de Taxas">💰 TAXAS</button>
          <button style={footerBtn} title="Tabela de Frete">🚚 FRETES</button>
          <button style={footerBtn} title="Calculadora de Preço">🧮 CALCULADORA</button>
          <button style={footerBtn} title="Atualizações">🆕 UPDATES</button>
          {isAdmin && <button style={footerBtn} title="Ver logs">📋 LOG</button>}
        </div>
      </div>

      {toast && (
        <div style={{
          position:'fixed',bottom:20,right:20,
          background:hbg,border:`1px solid ${brd}`,
          color:txt,padding:'10px 16px',borderRadius:8,
          fontSize:12,fontWeight:600,zIndex:9999,
          boxShadow:'0 4px 20px rgba(0,0,0,.4)',
          animation:'fadeInUp .2s ease',
        }}>{toast}</div>
      )}
      <style>{`@keyframes fadeInUp{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:translateY(0)}}`}</style>
    </div>
  )
}