'use client'

import React, { useState, useRef, useEffect, useCallback } from 'react'
import { ColDef } from '@/types'
import { renderCell } from '@/lib/renderCell'

interface DataTableProps {
  hasDinamica?: boolean
  hasCadastro?: boolean
  isAdmin?: boolean
  onCadastrar?: () => void
  onEditar?: (row: Record<string, unknown>) => void
  rows: Record<string, unknown>[]
  colDefs: ColDef[]
  onColDefsChange: (cols: ColDef[]) => void
  headerColor?: string
  headerColorSorted?: string
  fixedKeys?: Set<string>
  pageSize?: number
  countLabel?: string
  tableId?: string
  loading?: boolean
  searchKeys?: string[]
  isDark?: boolean
  rowBg?: string; rowAlt?: string; hoverBg?: string
  h2bg?: string; brd?: string; brd2?: string
  txt?: string; txtM?: string; txtD?: string; txtVD?: string
  isAdmin?: boolean
}

type View = 'analitica' | 'dinamica' | 'graficos'

const PV_VIEWS = [
  { id:'marca',     lbl1:'MARCA',       lbl2:'MODELO',
    key1:(p:Record<string,unknown>) => String(p.attributes_brand||p.brand||'(sem marca)'),
    key2:(p:Record<string,unknown>) => String(p.attributes_model||'(sem modelo)') },
  { id:'categoria', lbl1:'CATEG. PAI',  lbl2:'CATEGORIA',
    key1:(p:Record<string,unknown>) => String(p.category_parent||'(sem categ. pai)'),
    key2:(p:Record<string,unknown>) => String(p.category_name||'(sem categoria)') },
  { id:'loja',      lbl1:'LOJA OFICIAL',lbl2:'APELIDO',
    key1:(p:Record<string,unknown>) => String(p.official_store||'(sem loja oficial)'),
    key2:(p:Record<string,unknown>) => String(p.seller_name||'(sem apelido)') },
  { id:'estado',    lbl1:'ESTADO',      lbl2:'CIDADE',
    key1:(p:Record<string,unknown>) => String(p.address_state||'(sem estado)'),
    key2:(p:Record<string,unknown>) => String(p.address_city||'(sem cidade)') },
  { id:'reputacao', lbl1:'REPUTAÇÃO',   lbl2:'MEDALHA',
    key1:(p:Record<string,unknown>) => String(p.reputation_level||'(sem reputação)'),
    key2:(p:Record<string,unknown>) => String(p.power_seller_status||'(sem medalha)') },
  { id:'modo',      lbl1:'MODO',        lbl2:'LOGÍSTICA',
    key1:(p:Record<string,unknown>) => {
      const m = String(p.shipping_mode||'(sem modo)')
      if (m==='me1'||m==='ME1') return 'ME1'; if (m==='me2'||m==='ME2') return 'ME2'; return m
    },
    key2:(p:Record<string,unknown>) => {
      const l = String(p.shipping_logistic_type||'(sem logística)')
      if (l==='fulfillment'||l==='FULL') return 'ME FULL'
      if (l==='cross_docking') return 'ME PLACES'
      if (l==='xd_drop_off')   return 'ME COLETA'
      if (l==='drop_off')      return 'MERCADO ENVIOS'
      if (l==='not_specified') return 'N/A'
      return l
    } },
]

function fmtR(v:number) { if (!v && v!==0) return '—'; const abs=Math.abs(v); const fmt=abs.toLocaleString('pt-BR',{minimumFractionDigits:2,maximumFractionDigits:2}); return (v<0?'-':'')+'R$\u00a0'+fmt }
function fmtN(v:number) { return v!=null ? v.toLocaleString('pt-BR') : '—' }

function buildPivotData(rows:Record<string,unknown>[], pvView:string) {
  const vw = PV_VIEWS.find(v => v.id===pvView) || PV_VIEWS[0]
  const map = new Map<string, {
    k1:string; sub:Map<string,{k2:string;anuncios:number;sellerSet:Set<string>;prices:number[];vendas:number;receita:number;rows:Record<string,unknown>[];sellers:number;price_min:number;price_max:number;price_med:number;ticket:number;vs:number}>;
    anuncios:number;sellerSet:Set<string>;prices:number[];vendas:number;receita:number;
    sellers:number;price_min:number;price_max:number;price_med:number;ticket:number;vs:number;
  }>()
  rows.forEach(p => {
    const k1 = vw.key1(p), k2 = vw.key2(p)
    if (!map.has(k1)) map.set(k1, {k1,sub:new Map(),anuncios:0,sellerSet:new Set(),prices:[],vendas:0,receita:0,sellers:0,price_min:0,price_max:0,price_med:0,ticket:0,vs:0})
    const g = map.get(k1)!
    if (!g.sub.has(k2)) g.sub.set(k2, {k2,anuncios:0,sellerSet:new Set(),prices:[],vendas:0,receita:0,rows:[],sellers:0,price_min:0,price_max:0,price_med:0,ticket:0,vs:0})
    const s = g.sub.get(k2)!
    s.rows.push(p); s.anuncios++
    const sid = String(p.seller_id||''); if (sid) { s.sellerSet.add(sid); g.sellerSet.add(sid) }
    const pr = parseFloat(String(p.price||0)); if (pr>0) { s.prices.push(pr); g.prices.push(pr) }
    const vn = Number(p.sold_quantity||0), rc = Number(p.receita||0)
    s.vendas+=vn; s.receita+=rc; g.vendas+=vn; g.receita+=rc; g.anuncios++
  })
  function calc(g:{prices:number[];sellerSet:Set<string>;vendas:number;anuncios:number;sellers:number;price_min:number;price_max:number;price_med:number;ticket:number;vs:number}) {
    const sorted=[...g.prices].sort((a,b)=>a-b)
    const mid=Math.floor(sorted.length/2)
    g.sellers=g.sellerSet.size
    g.price_min=sorted.length?sorted[0]:0
    g.price_max=sorted.length?sorted[sorted.length-1]:0
    g.price_med=sorted.length?sorted.reduce((a,b)=>a+b,0)/sorted.length:0
    g.ticket=sorted.length?(sorted.length%2===0?(sorted[mid-1]+sorted[mid])/2:sorted[mid]):0
    g.vs=g.sellers>0?g.vendas/g.sellers:0
  }
  const arr=[...map.values()]
  arr.forEach(g=>{calc(g);g.sub.forEach(s=>calc(s))})
  arr.sort((a,b)=>b.vendas-a.vendas)
  return arr
}

export function DataTable({
  rows, colDefs, onColDefsChange,
  headerColor='#2563eb', headerColorSorted='#1d4ed8',
  fixedKeys=new Set(), pageSize=100,
  countLabel='registros', tableId='atk-tbl',
  loading=false, searchKeys=[], isDark=true,
  rowBg='#111827', rowAlt='#1a2234', hoverBg='#1e3a5f',
  h2bg='#111827', brd='#374151', brd2='#2d3748',
  txt='#f9fafb', txtM='#9ca3af', txtD='#6b7280', txtVD='#4b5563',
  isAdmin=false,
  hasDinamica=false,
  hasCadastro=false,
  onCadastrar,
  onEditar,
}: DataTableProps) {
  const [sortCol, setSortCol]       = useState('')
  const [sortDir, setSortDir]       = useState<1|-1>(-1)
  const [filters, setFilters]       = useState<Record<string,Set<string>>>({})
  const [page, setPage]             = useState(1)
  const [search, setSearch]         = useState('')
  const [dropdown, setDropdown]     = useState<{key:string;rect:DOMRect}|null>(null)
  const [tempFilter, setTempFilter] = useState<Set<string>>(new Set())
  const [filterSearch, setFilterSearch] = useState('')
  const [showCols, setShowCols]     = useState(false)
  const [view, setView]             = useState<View>('analitica')
  const [pvView, setPvView]         = useState('marca')
  const [pvExpanded, setPvExpanded] = useState<Set<string>>(new Set())
  const [pvSortCol, setPvSortCol]   = useState('vendas')
  const [pvSortDir, setPvSortDir]   = useState<1|-1>(-1)
  const [selectedRow, setSelectedRow] = useState<Record<string,unknown>|null>(null)
  const [dragIdx, setDragIdx]       = useState<number|null>(null)
  const [dragOver, setDragOver]     = useState<number|null>(null)
  const ddRef = useRef<HTMLDivElement>(null)

  const visCols = colDefs.filter(c => c.visible || fixedKeys.has(c.key))

  // Sticky left
  const stickyLeft: Record<string,number> = {}
  let leftAcc = 0
  visCols.filter(c => fixedKeys.has(c.key)).forEach(c => {
    stickyLeft[c.key] = leftAcc; leftAcc += parseInt(c.w)||90
  })

  // Filter+sort
  const filtered = React.useMemo(() => {
    let r = rows
    if (search && searchKeys.length) {
      const q = search.toLowerCase()
      r = r.filter(row => searchKeys.some(k => String(row[k]??'').toLowerCase().includes(q)))
    }
    if (Object.keys(filters).length) {
      r = r.filter(row => Object.entries(filters).every(([k,vals]) => !vals.size||vals.has(String(row[k]??''))))
    }
    return r
  }, [rows, search, filters, searchKeys])

  const sorted = React.useMemo(() => {
    if (!sortCol) return filtered
    return [...filtered].sort((a,b) => {
      const av=a[sortCol],bv=b[sortCol]
      const an=parseFloat(String(av)),bn=parseFloat(String(bv))
      if (!isNaN(an)&&!isNaN(bn)) return (an-bn)*sortDir
      return String(av??'').localeCompare(String(bv??''),'pt-BR')*sortDir
    })
  }, [filtered, sortCol, sortDir])

  const totalPages = Math.ceil(sorted.length/pageSize)
  const pageRows   = sorted.slice((page-1)*pageSize, page*pageSize)
  const hasFilters = Object.values(filters).some(s=>s.size>0)||search.length>0

  function handleThClick(e:React.MouseEvent<HTMLTableCellElement>, col:ColDef) {
    if (e.ctrlKey||e.metaKey) {
      const rect = e.currentTarget.getBoundingClientRect()
      setTempFilter(new Set(filters[col.key]??[]))
      setFilterSearch(''); setDropdown({key:col.key,rect})
    } else {
      if (sortCol===col.key) setSortDir(d=>d===1?-1:1)
      else { setSortCol(col.key); setSortDir(-1) }
      setPage(1)
    }
  }

  function clearAll() { setFilters({}); setSearch(''); setPage(1) }
  function applyFilter() {
    if (!dropdown) return
    setFilters(f => { const n={...f}; if (!tempFilter.size) delete n[dropdown.key]; else n[dropdown.key]=new Set(tempFilter); return n })
    setDropdown(null); setPage(1)
  }
  function clearFilter() {
    if (!dropdown) return
    setFilters(f => { const n={...f}; delete n[dropdown.key]; return n })
    setDropdown(null); setPage(1)
  }

  useEffect(() => {
    if (!dropdown) return
    const handler = (e:MouseEvent) => {
      if (ddRef.current && !ddRef.current.contains(e.target as Node)) setDropdown(null)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [dropdown])

  const uniqueVals = dropdown
    ? [...new Set(rows.map(r=>String(r[dropdown.key]??'')))].filter(v=>!filterSearch||v.toLowerCase().includes(filterSearch.toLowerCase())).sort()
    : []

  function downloadCSV() {
    const hdr = visCols.map(c=>c.label).join(';')
    const csv = sorted.map(row=>visCols.map(c=>{const v=row[c.key];return v==null?'':'"'+String(v).replace(/"/g,'""')+'"'}).join(';'))
    const blob = new Blob(['\uFEFF'+[hdr,...csv].join('\n')],{type:'text/csv;charset=utf-8'})
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a'); a.href=url; a.download=`analytrick-${tableId}.csv`; a.click()
    URL.revokeObjectURL(url)
  }

  // Drag to reorder columns
  function onDragStart(idx:number) { setDragIdx(idx) }
  function onDragOver(e:React.DragEvent, idx:number) { e.preventDefault(); setDragOver(idx) }
  function onDrop(idx:number) {
    if (dragIdx===null||dragIdx===idx) { setDragIdx(null); setDragOver(null); return }
    const next = [...colDefs]
    const [moved] = next.splice(dragIdx, 1)
    next.splice(idx, 0, moved)
    onColDefsChange(next)
    setDragIdx(null); setDragOver(null)
  }

  // Pivot data
  const pivotData = React.useMemo(() => {
    if (view !== 'dinamica') return []
    const data = buildPivotData(rows, pvView)
    return [...data].sort((a,b) => {
      const av = (a as Record<string,unknown>)[pvSortCol]
      const bv = (b as Record<string,unknown>)[pvSortCol]
      const an = parseFloat(String(av??0)), bn = parseFloat(String(bv??0))
      if (!isNaN(an) && !isNaN(bn)) return (an - bn) * pvSortDir
      return String(av??'').localeCompare(String(bv??''), 'pt-BR') * pvSortDir
    })
  }, [view, pvView, rows, pvSortCol, pvSortDir])

  const pvTotals = React.useMemo(() => {
    if (!pivotData.length) return null
    const allPrices = rows.map(r=>parseFloat(String(r.price||0))).filter(v=>v>0).sort((a,b)=>a-b)
    const mid = Math.floor(allPrices.length/2)
    return {
      anuncios: rows.length,
      sellers: new Set(rows.map(r=>String(r.seller_id||'')).filter(Boolean)).size,
      vendas: rows.reduce((s,r)=>s+Number(r.sold_quantity||0),0),
      receita: rows.reduce((s,r)=>s+Number(r.receita||0),0),
      price_min: allPrices[0]||0,
      price_max: allPrices[allPrices.length-1]||0,
      price_med: allPrices.length?allPrices.reduce((a,b)=>a+b,0)/allPrices.length:0,
      ticket: allPrices.length?(allPrices.length%2===0?(allPrices[mid-1]+allPrices[mid])/2:allPrices[mid]):0,
    }
  }, [pivotData, rows])

  const btnStyle = (active=false): React.CSSProperties => ({
    height:28, padding:'0 10px', borderRadius:5, fontSize:11, fontWeight:600,
    cursor:'pointer', fontFamily:'inherit',
    display:'inline-flex', alignItems:'center', gap:4, whiteSpace:'nowrap',
    background: active ? '#1e3a8a' : isDark ? '#374151' : '#e5e7eb',
    color: active ? '#fff' : isDark ? '#d1d5db' : '#374151',
    border: active ? '1px solid #163470' : `1px solid ${brd2}`,
    transition:'background .15s',
  })
  const dlBtn: React.CSSProperties = {
    ...btnStyle(false), background:'#fff', color:'#1e3a8a', fontWeight:700, border:'1px solid #c7d2fe',
  }
  const pvColStyle: React.CSSProperties = {
    padding:'8px 10px', fontSize:10, fontWeight:700, color:'#fff',
    whiteSpace:'nowrap', borderRight:'1px solid rgba(255,255,255,.08)', cursor:'pointer',
    background:headerColor, position:'sticky', top:0, zIndex:10,
  }

  return (
    <div style={{display:'flex',flexDirection:'column',height:'100%',overflow:'hidden',minHeight:0}}>

      {/* ══ H2 toolbar ══════════════════════════════════ */}
      <div style={{display:'flex',alignItems:'center',height:38,flexShrink:0,background:h2bg,borderBottom:`2px solid ${brd2}`,padding:'0 10px',gap:6}}>
        {/* Esquerda: busca + count */}
        <div style={{display:'flex',alignItems:'center',gap:8,flex:1,minWidth:0,overflow:'hidden'}}>
          {view!=='dinamica' && searchKeys.length>0 && (
            <input type="text" placeholder="🔍 Buscar..."
              value={search} onChange={e=>{setSearch(e.target.value);setPage(1)}}
              style={{background:isDark?'#0f172a':'#fff',border:`1px solid ${brd}`,borderRadius:6,color:txt,fontSize:11,padding:'4px 10px',fontFamily:'inherit',outline:'none',width:180}}
            />
          )}
          <span style={{fontSize:12,color:txtVD,fontWeight:600,whiteSpace:'nowrap'}}>
            {view==='dinamica'
              ? `${pivotData.length} grupos · ${rows.length.toLocaleString('pt-BR')} itens`
              : `${sorted.length.toLocaleString('pt-BR')} ${countLabel}${hasFilters?' ● filtrado':''}`
            }
          </span>
        </div>
        {/* Direita: botões */}
        <div style={{display:'flex',gap:4,alignItems:'center',flexShrink:0}}>
          {view!=='dinamica' && <>
            <button style={btnStyle(hasFilters)} onClick={clearAll} title="Limpar filtros">✕ Filtros</button>
            <button style={btnStyle(showCols)} onClick={()=>setShowCols(v=>!v)} title="Gerenciar colunas">⊞ Colunas</button>
          </>}
          {/* Seletor de agrupamento — aparece ao lado de Analítica quando Dinâmica está ativa */}
          {view==='dinamica' && (
            <select value={pvView} onChange={e=>setPvView(e.target.value)}
              style={{background:isDark?'#1f2937':'#fff',border:`1px solid ${brd}`,borderRadius:6,color:txt,fontSize:11,padding:'4px 10px',fontFamily:'inherit',cursor:'pointer',outline:'none',fontWeight:600,marginRight:4}}>
              {PV_VIEWS.map(v=>(
                <option key={v.id} value={v.id}>{v.lbl1} / {v.lbl2}</option>
              ))}
            </select>
          )}
          <div style={{width:1,height:20,background:brd,flexShrink:0,margin:'0 2px'}}/>
          <button style={btnStyle(view==='analitica')} onClick={()=>setView('analitica')}>≡ Analítica</button>
          <button style={{...btnStyle(view==='dinamica'),opacity:hasDinamica?1:.35,cursor:hasDinamica?'pointer':'not-allowed'}} onClick={()=>hasDinamica&&setView('dinamica')} title={hasDinamica?'Tabela Dinâmica':'Disponível apenas em Anúncios'}>⊞ Dinâmica</button>
          <button style={btnStyle(view==='graficos')}  onClick={()=>setView('graficos')}>📈 Gráficos</button>
          <div style={{width:1,height:20,background:brd,flexShrink:0,margin:'0 2px'}}/>
          {hasCadastro && isAdmin ? (
            <>
              {selectedRow ? (
                <button style={{...btnStyle(true), background:'#0369a1', border:'1px solid #0284c7', color:'#fff'}}
                  onClick={()=>onEditar?.(selectedRow)}>
                  ✏️ Editar
                </button>
              ) : (
                <button style={{...btnStyle(false), background:'#15803d', border:'1px solid #166534', color:'#fff'}}
                  onClick={onCadastrar}>
                  ➕ Cadastrar
                </button>
              )}
            </>
          ) : (
            <button style={dlBtn} onClick={downloadCSV} title="Baixar CSV">⬇↑ Dados</button>
          )}
        </div>
      </div>

      {/* ══ Conteúdo por view ═══════════════════════════ */}
      <div style={{flex:1,overflow:'hidden',minHeight:0,display:'flex',flexDirection:'column'}}>

        {/* ANALÍTICA */}
        {view==='analitica' && (
          <div style={{flex:1,overflow:'auto',minHeight:0}}>
            {loading ? (
              <div style={{display:'flex',alignItems:'center',justifyContent:'center',height:'100%',gap:12}}>
                <div style={{width:28,height:28,border:'3px solid #374151',borderTopColor:'#3b82f6',borderRadius:'50%',animation:'spin .7s linear infinite'}}/>
                <span style={{color:txtD,fontSize:13}}>Carregando...</span>
              </div>
            ) : (
              <table id={tableId} style={{borderCollapse:'collapse',fontSize:11,tableLayout:'fixed',width:'max-content',minWidth:'100%'}}>
                <thead>
                  <tr style={{position:'sticky',top:0,zIndex:10}}>
                    {hasCadastro && isAdmin && (
                      <th style={{width:32,minWidth:32,background:headerColor,padding:'8px 6px',position:'sticky',left:0,zIndex:16,borderRight:`1px solid rgba(255,255,255,.08)`}}/>
                    )}
                    {visCols.map(col => {
                      const isFixed=fixedKeys.has(col.key), isSorted=sortCol===col.key, hasFilter=(filters[col.key]?.size??0)>0
                      return (
                        <th key={col.key} data-key={col.key}
                          title="1 clique = ordenar · Ctrl+clique = filtrar"
                          onClick={e=>handleThClick(e,col)}
                          style={{
                            minWidth:col.w,maxWidth:col.w,width:col.w,
                            background:isSorted?headerColorSorted:headerColor,
                            position:isFixed?'sticky':undefined,
                            left:isFixed?stickyLeft[col.key]:undefined,
                            zIndex:isFixed?15:undefined,
                            padding:'8px 10px',textAlign:'left',
                            fontSize:10,fontWeight:700,color:'#fff',
                            whiteSpace:'nowrap',letterSpacing:'.4px',
                            userSelect:'none',cursor:'pointer',
                            borderRight:'1px solid rgba(255,255,255,.08)',
                          }}>
                          <div style={{display:'flex',alignItems:'center',gap:3,overflow:'hidden'}}>
                            <span style={{overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap',minWidth:0}}>{col.label}</span>
                            <span style={{flexShrink:0}}>
                              {hasFilter && <span style={{color:'#fbbf24'}}>▼</span>}
                              {isSorted && <span>{sortDir===1?'↑':'↓'}</span>}
                              {!isSorted&&!hasFilter&&col.sortable && <span style={{opacity:.35,fontSize:9}}>↕</span>}
                            </span>
                          </div>
                        </th>
                      )
                    })}
                  </tr>
                </thead>
                <tbody>
                  {pageRows.map((row,i) => (
                    <tr key={i} style={{outline: selectedRow===row ? '2px solid #3b82f6' : 'none', outlineOffset:-1}}>
                      {hasCadastro && isAdmin && (
                        <td style={{width:32,minWidth:32,padding:'4px 6px',borderBottom:`1px solid ${brd2}`,textAlign:'center',position:'sticky',left:0,zIndex:4,background:selectedRow===row?(isDark?'#1e3a5f':'#dbeafe'):i%2===0?rowBg:rowAlt}}>
                          <input type="radio" checked={selectedRow===row}
                            onChange={()=>setSelectedRow(selectedRow===row?null:row)}
                            style={{accentColor:'#3b82f6',cursor:'pointer',width:14,height:14}}/>
                        </td>
                      )}
                      {visCols.map(col => {
                        const isFixed=fixedKeys.has(col.key)
                        return (
                          <td key={col.key} data-key={col.key} style={{
                            minWidth:col.w,maxWidth:col.w,width:col.w,
                            position:isFixed?'sticky':undefined,
                            left:isFixed?stickyLeft[col.key]:undefined,
                            zIndex:isFixed?5:undefined,
                            padding:'7px 10px',borderBottom:`1px solid ${brd2}`,
                            verticalAlign:'middle',overflow:'hidden',
                            whiteSpace:'nowrap',textOverflow:'ellipsis',
                          }}>
                            {renderCell(row as Record<string,unknown>, col.key)}
                          </td>
                        )
                      })}
                    </tr>
                  ))}
                  {pageRows.length===0 && (
                    <tr><td colSpan={visCols.length} style={{textAlign:'center',padding:40,color:txtD}}>Nenhum resultado</td></tr>
                  )}
                </tbody>
              </table>
            )}
          </div>
        )}

        {/* DINÂMICA (PIVOT) */}
        {view==='dinamica' && (
          <div style={{flex:1,display:'flex',flexDirection:'column',overflow:'hidden',minHeight:0}}>
            {/* Tabela pivot */}
            <div style={{flex:1,overflow:'auto',minHeight:0}}>
              <table style={{width:'100%',borderCollapse:'collapse',fontSize:12,tableLayout:'fixed'}}>
                <colgroup>
                  <col style={{width:'28%'}}/><col style={{width:'72px'}}/><col style={{width:'65px'}}/>
                  <col style={{width:'85px'}}/><col style={{width:'85px'}}/><col style={{width:'85px'}}/>
                  <col style={{width:'85px'}}/><col style={{width:'80px'}}/><col style={{width:'110px'}}/>
                  <col style={{width:'72px'}}/><col style={{width:'72px'}}/>
                </colgroup>
                <thead>
                  <tr>
                    {[{k:'k1',l:PV_VIEWS.find(v=>v.id===pvView)?.lbl1||'GRUPO',align:'left'},{k:'anuncios',l:'ANÚNCIOS',align:'right'},{k:'sellers',l:'SELLERS',align:'right'},{k:'price_min',l:'PREÇO MIN',align:'right'},{k:'price_med',l:'PREÇO MED',align:'right'},{k:'price_max',l:'PREÇO MAX',align:'right'},{k:'ticket',l:'TICKET',align:'right'},{k:'vendas',l:'VENDAS',align:'right'},{k:'receita',l:'RECEITA',align:'right'},{k:'vs',l:'V/S',align:'right',title:'Vendas / Sellers'},{k:'as',l:'A/S',align:'right',title:'Anúncios / Sellers'}].map((col,ci)=>{
                      const isSorted=pvSortCol===col.k
                      return (
                        <th key={col.k}
                          title={col.title||col.l}
                          onClick={()=>{if(col.k==='k1')return;if(pvSortCol===col.k)setPvSortDir(d=>d===1?-1:1);else{setPvSortCol(col.k);setPvSortDir(-1)}}}
                          style={{...pvColStyle,textAlign:col.align as 'left'|'right',background:isSorted?headerColorSorted:headerColor,cursor:col.k==='k1'?'default':'pointer'}}>
                          <span>{col.l}</span>
                          {isSorted && <span style={{marginLeft:3,fontSize:9}}>{pvSortDir===1?'↑':'↓'}</span>}
                          {!isSorted && col.k!=='k1' && <span style={{opacity:.35,fontSize:9,marginLeft:3}}>↕</span>}
                        </th>
                      )
                    })}
                  </tr>
                </thead>
                <tbody>
                  {pivotData.map((g,gi) => {
                    const gid = `g${gi}`
                    const expanded = pvExpanded.has(gid)
                    return (
                      <React.Fragment key={gid}>
                        <tr style={{background:isDark?'#1a2234':'#f0f4ff',cursor:'pointer'}}
                          onClick={()=>setPvExpanded(s=>{const n=new Set(s);n.has(gid)?n.delete(gid):n.add(gid);return n})}>
                          <td style={{padding:'8px 10px',borderBottom:`1px solid ${brd2}`,fontWeight:700,color:txt}}>
                            <span style={{marginRight:6,color:'#6b7280',fontSize:10}}>{expanded?'−':'+'}</span>{g.k1}
                          </td>
                          <td style={{padding:'8px 10px',borderBottom:`1px solid ${brd2}`,color:txtM,textAlign:'right'}}>{g.anuncios}</td>
                          <td style={{padding:'8px 10px',borderBottom:`1px solid ${brd2}`,textAlign:'right'}}>{g.sellers}</td>
                          <td style={{padding:'8px 10px',borderBottom:`1px solid ${brd2}`,color:'#4ade80',textAlign:'right'}}>{fmtR(g.price_min)}</td>
                          <td style={{padding:'8px 10px',borderBottom:`1px solid ${brd2}`,color:txtM,textAlign:'right'}}>{fmtR(g.price_med)}</td>
                          <td style={{padding:'8px 10px',borderBottom:`1px solid ${brd2}`,color:'#ef4444',textAlign:'right'}}>{fmtR(g.price_max)}</td>
                          <td style={{padding:'8px 10px',borderBottom:`1px solid ${brd2}`,color:'#38bdf8',textAlign:'right'}}>{fmtR(g.ticket)}</td>
                          <td style={{padding:'8px 10px',borderBottom:`1px solid ${brd2}`,color:'#fb923c',fontWeight:700,textAlign:'right'}}>{fmtN(g.vendas)}</td>
                          <td style={{padding:'8px 10px',borderBottom:`1px solid ${brd2}`,color:'#4ade80',fontWeight:700,textAlign:'right'}}>{fmtR(g.receita)}</td>
                          <td style={{padding:'8px 10px',borderBottom:`1px solid ${brd2}`,color:'#a78bfa',fontWeight:700,textAlign:'right'}}>{fmtN(Math.round(g.vs))}</td>
                          <td style={{padding:'8px 10px',borderBottom:`1px solid ${brd2}`,color:'#60a5fa',fontWeight:700,textAlign:'right'}}>{g.sellers>0?(g.anuncios/g.sellers).toFixed(1):'—'}</td>
                        </tr>
                        {expanded && [...g.sub.values()].map((s,si) => {
                          const sid=`${gid}s${si}`
                          const exp2=pvExpanded.has(sid)
                          return (
                            <React.Fragment key={sid}>
                              <tr style={{background:isDark?'#111827':'#f8fafc',cursor:'pointer'}}
                                onClick={e=>{e.stopPropagation();setPvExpanded(st=>{const n=new Set(st);n.has(sid)?n.delete(sid):n.add(sid);return n})}}>
                                <td style={{padding:'7px 10px 7px 28px',borderBottom:`1px solid ${brd2}`,color:txtM,fontSize:11}}>
                                  <span style={{marginRight:6,color:'#4b5563',fontSize:10}}>{exp2?'−':'+'}</span>{s.k2}
                                </td>
                                <td style={{padding:'7px 10px',borderBottom:`1px solid ${brd2}`,color:txtD,fontSize:11,textAlign:'right'}}>{s.anuncios}</td>
                                <td style={{padding:'7px 10px',borderBottom:`1px solid ${brd2}`,color:txtD,fontSize:11,textAlign:'right'}}>{s.sellers}</td>
                                <td style={{padding:'7px 10px',borderBottom:`1px solid ${brd2}`,color:'#4ade80',fontSize:11,textAlign:'right'}}>{fmtR(s.price_min)}</td>
                                <td style={{padding:'7px 10px',borderBottom:`1px solid ${brd2}`,color:txtD,fontSize:11,textAlign:'right'}}>{fmtR(s.price_med)}</td>
                                <td style={{padding:'7px 10px',borderBottom:`1px solid ${brd2}`,color:'#ef4444',fontSize:11,textAlign:'right'}}>{fmtR(s.price_max)}</td>
                                <td style={{padding:'7px 10px',borderBottom:`1px solid ${brd2}`,color:'#38bdf8',fontSize:11,textAlign:'right'}}>{fmtR(s.ticket)}</td>
                                <td style={{padding:'7px 10px',borderBottom:`1px solid ${brd2}`,color:'#fb923c',fontWeight:700,fontSize:11,textAlign:'right'}}>{fmtN(s.vendas)}</td>
                                <td style={{padding:'7px 10px',borderBottom:`1px solid ${brd2}`,color:'#4ade80',fontWeight:700,fontSize:11,textAlign:'right'}}>{fmtR(s.receita)}</td>
                                <td style={{padding:'7px 10px',borderBottom:`1px solid ${brd2}`,color:'#a78bfa',fontSize:11,textAlign:'right'}}>{fmtN(Math.round(s.vs))}</td>
                                <td style={{padding:'7px 10px',borderBottom:`1px solid ${brd2}`,color:'#60a5fa',fontSize:11,textAlign:'right'}}>{s.sellers>0?(s.anuncios/s.sellers).toFixed(1):'—'}</td>
                              </tr>
                              {exp2 && s.rows.map((p,pi) => (
                                <tr key={pi} style={{background:isDark?'#0f172a':'#ffffff'}}>
                                  <td style={{padding:'5px 10px 5px 48px',borderBottom:`1px solid ${brd2}`,fontSize:10,color:txtD,overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>
                                    <a href={String(p.permalink||'#')} target="_blank" rel="noopener noreferrer" style={{color:'#60a5fa',textDecoration:'none',fontSize:10}}>
                                      {String(p.title||'').substring(0,60)}
                                    </a>
                                  </td>
                                  <td style={{padding:'5px 10px',borderBottom:`1px solid ${brd2}`,color:txtVD,fontSize:10,textAlign:'right'}}>1</td>
                                  <td style={{padding:'5px 10px',borderBottom:`1px solid ${brd2}`,color:txtVD,fontSize:10,textAlign:'right'}}>1</td>
                                  <td colSpan={3} style={{padding:'5px 10px',borderBottom:`1px solid ${brd2}`,color:'#4ade80',fontSize:10,textAlign:'right'}}>{fmtR(parseFloat(String(p.price||0)))}</td>
                                  <td style={{padding:'5px 10px',borderBottom:`1px solid ${brd2}`,color:'#38bdf8',fontSize:10,textAlign:'right'}}>{fmtR(parseFloat(String(p.price||0)))}</td>
                                  <td style={{padding:'5px 10px',borderBottom:`1px solid ${brd2}`,color:'#fb923c',fontSize:10,fontWeight:700,textAlign:'right'}}>{fmtN(Number(p.sold_quantity||0))}</td>
                                  <td style={{padding:'5px 10px',borderBottom:`1px solid ${brd2}`,color:'#4ade80',fontSize:10,fontWeight:700,textAlign:'right'}}>{fmtR(Number(p.receita||0))}</td>
                                  <td colSpan={2} style={{padding:'5px 10px',borderBottom:`1px solid ${brd2}`,color:txtVD,fontSize:10}}/>
                                </tr>
                              ))}
                            </React.Fragment>
                          )
                        })}
                      </React.Fragment>
                    )
                  })}
                </tbody>
              </table>
            </div>

            {/* Total geral — fixo no rodapé */}
            {pvTotals && (
              <table style={{width:'100%',borderCollapse:'collapse',fontSize:12,tableLayout:'fixed',flexShrink:0,borderTop:`2px solid ${brd}`}}>
                <colgroup>
                  <col style={{width:'28%'}}/><col style={{width:'72px'}}/><col style={{width:'65px'}}/>
                  <col style={{width:'85px'}}/><col style={{width:'85px'}}/><col style={{width:'85px'}}/>
                  <col style={{width:'85px'}}/><col style={{width:'80px'}}/><col style={{width:'110px'}}/>
                  <col style={{width:'72px'}}/><col style={{width:'72px'}}/>
                </colgroup>
                <tbody>
                  <tr style={{background:isDark?'#1a2035':'#e8edf8'}}>
                    <td style={{padding:'8px 10px',fontWeight:700,color:txt}}>📊 Total geral</td>
                    <td style={{padding:'8px 10px',color:txtM,textAlign:'right'}}>{pvTotals.anuncios}</td>
                    <td style={{padding:'8px 10px',textAlign:'right'}}>{pvTotals.sellers}</td>
                    <td style={{padding:'8px 10px',color:'#4ade80',textAlign:'right'}}>{fmtR(pvTotals.price_min)}</td>
                    <td style={{padding:'8px 10px',color:txtM,textAlign:'right'}}>{fmtR(pvTotals.price_med)}</td>
                    <td style={{padding:'8px 10px',color:'#ef4444',textAlign:'right'}}>{fmtR(pvTotals.price_max)}</td>
                    <td style={{padding:'8px 10px',color:'#38bdf8',textAlign:'right'}}>{fmtR(pvTotals.ticket)}</td>
                    <td style={{padding:'8px 10px',color:'#fb923c',fontWeight:700,textAlign:'right'}}>{fmtN(pvTotals.vendas)}</td>
                    <td style={{padding:'8px 10px',color:'#4ade80',fontWeight:700,textAlign:'right'}}>{fmtR(pvTotals.receita)}</td>
                    <td style={{padding:'8px 10px',color:'#a78bfa',textAlign:'right'}}>—</td>
                    <td style={{padding:'8px 10px',color:'#60a5fa',textAlign:'right'}}>—</td>
                  </tr>
                </tbody>
              </table>
            )}
          </div>
        )}

        {/* GRÁFICOS */}
        {view==='graficos' && (
          <div style={{flex:1,display:'flex',alignItems:'center',justifyContent:'center',flexDirection:'column',gap:12,color:txtD}}>
            <div style={{fontSize:40,opacity:.3}}>📈</div>
            <div style={{fontSize:16,fontWeight:700}}>Gráficos em desenvolvimento</div>
            <div style={{fontSize:12,color:txtVD}}>Em breve disponível</div>
          </div>
        )}
      </div>

      {/* ══ Pager centralizado — fiel à extensão ════════ */}
      {view==='analitica' && (
        <div style={{display:'flex',alignItems:'center',justifyContent:'center',gap:4,padding:'5px 12px',borderTop:`1px solid ${brd}`,background:h2bg,flexShrink:0,fontSize:11,color:txtD,position:'relative'}}>
          <button style={btnStyle()} onClick={()=>setPage(1)} disabled={page===1} title="Primeira página">«</button>
          <button style={btnStyle()} onClick={()=>setPage(p=>Math.max(1,p-1))} disabled={page===1} title="Página anterior">‹</button>
          <span style={{padding:'0 12px',color:txtM,fontWeight:600,minWidth:80,textAlign:'center'}}>
            {page} / {totalPages||1}
          </span>
          <button style={btnStyle()} onClick={()=>setPage(p=>Math.min(totalPages||1,p+1))} disabled={page>=(totalPages||1)} title="Próxima página">›</button>
          <button style={btnStyle()} onClick={()=>setPage(totalPages||1)} disabled={page>=(totalPages||1)} title="Última página">»</button>
          <span style={{position:'absolute',right:12,color:txtVD,fontSize:10}}>
            {sorted.length.toLocaleString('pt-BR')} {countLabel}
          </span>
        </div>
      )}

      {/* ══ Filter Dropdown ══════════════════════════════ */}
      {dropdown && (
        <div ref={ddRef} style={{
          position:'fixed',
          top:Math.min(dropdown.rect.bottom+4,window.innerHeight-380),
          left:Math.min(dropdown.rect.left,window.innerWidth-300),
          width:280, background:isDark?'#1f2937':'#fff',
          border:`1px solid ${brd}`, borderRadius:10, zIndex:9999,
          boxShadow:'0 8px 32px rgba(0,0,0,.6)',
          display:'flex',flexDirection:'column',
        }}>
          <div style={{padding:'10px 12px',borderBottom:`1px solid ${brd}`,display:'flex',justifyContent:'space-between'}}>
            <span style={{fontSize:11,fontWeight:700,color:txt}}>▼ {colDefs.find(c=>c.key===dropdown.key)?.label||dropdown.key}</span>
            <span style={{fontSize:10,color:txtVD}}>{uniqueVals.length} valores</span>
          </div>
          <div style={{padding:'8px 12px',borderBottom:`1px solid ${brd}`}}>
            <input autoFocus type="text" placeholder="🔍 Buscar..."
              value={filterSearch} onChange={e=>setFilterSearch(e.target.value)}
              style={{width:'100%',background:isDark?'#0f172a':'#f3f4f6',border:`1px solid ${brd}`,borderRadius:6,color:txt,fontSize:11,padding:'5px 10px',fontFamily:'inherit',outline:'none'}}
            />
          </div>
          <div style={{maxHeight:240,overflowY:'auto',padding:'4px 0'}}>
            {uniqueVals.map(val=>(
              <label key={val} style={{display:'flex',alignItems:'center',gap:8,padding:'5px 12px',cursor:'pointer',fontSize:11,color:txt}}
                onMouseEnter={e=>e.currentTarget.style.background=isDark?'#273549':'#f3f4f6'}
                onMouseLeave={e=>e.currentTarget.style.background=''}>
                <input type="checkbox" checked={tempFilter.has(val)}
                  onChange={()=>{const n=new Set(tempFilter);n.has(val)?n.delete(val):n.add(val);setTempFilter(n)}}
                  style={{accentColor:'#3b82f6'}}/>
                <span style={{overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{val||'(vazio)'}</span>
              </label>
            ))}
          </div>
          <div style={{display:'flex',gap:6,padding:10,borderTop:`1px solid ${brd}`}}>
            <button onClick={()=>setTempFilter(new Set(uniqueVals))} style={{...btnStyle(),flex:1}}>☑ Todos</button>
            <button onClick={applyFilter} style={{...btnStyle(true),flex:1}}>✓ Aplicar</button>
            <button onClick={clearFilter} style={{...btnStyle(),flex:1}}>✕ Limpar</button>
          </div>
        </div>
      )}

      {/* ══ Col Manager — fiel à extensão ══════════════ */}
      {showCols && (
        <div style={{
          position:'absolute', top:88, right:16, zIndex:9999,
          background:isDark?'#1f2937':'#fff',
          border:`1px solid ${brd}`, borderRadius:10,
          width:240, maxHeight:'calc(100% - 110px)',
          boxShadow:'0 8px 40px rgba(0,0,0,.8)',
          display:'flex', flexDirection:'column', overflow:'hidden',
        }}>
          {/* Header */}
          <div style={{padding:'9px 12px',borderBottom:`1px solid ${brd}`,fontSize:11,fontWeight:700,color:'#93c5fd',display:'flex',justifyContent:'space-between',alignItems:'center',flexShrink:0}}>
            <span>⊞ COLUNAS · {colDefs.filter(c=>c.visible||fixedKeys.has(c.key)).length} visíveis</span>
            <button onClick={()=>setShowCols(false)} style={{background:'none',border:'none',color:txtM,cursor:'pointer',fontSize:14,lineHeight:1,padding:0}}>✕</button>
          </div>
          {/* Lista */}
          <div style={{overflowY:'auto',flex:1,padding:'4px 0'}}>
            {colDefs.map((col, idx) => {
              const isFixed = fixedKeys.has(col.key)
              const isOn = col.visible || isFixed
              return (
                <div key={col.key}
                  draggable={!isFixed}
                  onDragStart={()=>onDragStart(idx)}
                  onDragOver={e=>onDragOver(e,idx)}
                  onDrop={()=>onDrop(idx)}
                  style={{
                    display:'flex', alignItems:'center', gap:8,
                    padding:'7px 10px', cursor:'default',
                    fontSize:11, color:txtM,
                    borderBottom:'1px solid rgba(255,255,255,.04)',
                    background: dragOver===idx ? 'rgba(30,58,138,.2)' : '',
                    transition:'background .1s',
                  }}
                >
                  {/* Drag handle */}
                  <span style={{color:txtVD,fontSize:11,flexShrink:0,cursor:isFixed?'default':'grab',opacity:.5,userSelect:'none'}}>⠿</span>
                  {/* Toggle switch — input escondido + slider CSS igual extensão */}
                  <label style={{position:'relative',width:30,height:16,flexShrink:0,cursor:isFixed?'not-allowed':'pointer',display:'inline-block'}}>
                    <input
                      type="checkbox"
                      checked={isOn}
                      disabled={isFixed}
                      onChange={()=>{
                        if(isFixed) return
                        onColDefsChange(colDefs.map(c=>c.key===col.key?{...c,visible:!c.visible}:c))
                      }}
                      style={{opacity:0,width:0,height:0,position:'absolute'}}
                    />
                    <span style={{
                      position:'absolute', inset:0, borderRadius:8,
                      background: isOn ? '#3b82f6' : (isDark?'#374151':'#d1d5db'),
                      transition:'background .2s',
                    }}/>
                    <span style={{
                      position:'absolute', top:2,
                      left: isOn ? 14 : 2,
                      width:12, height:12, borderRadius:'50%',
                      background:'#fff', transition:'left .2s',
                      boxShadow:'0 1px 2px rgba(0,0,0,.3)',
                    }}/>
                  </label>
                  {/* Label */}
                  <span style={{flex:1, opacity:isOn?1:.4, textDecoration:isOn?'none':'line-through'}}>
                    {col.label}
                  </span>
                </div>
              )
            })}
          </div>
          {/* Footer */}
          <div style={{padding:'8px 10px',borderTop:`1px solid ${brd}`,flexShrink:0,display:'flex',gap:6}}>
            <button onClick={()=>onColDefsChange(colDefs.map(c=>fixedKeys.has(c.key)?c:{...c,visible:true}))}
              style={{flex:1,padding:'5px',borderRadius:4,border:'none',background:isDark?'#374151':'#e5e7eb',color:txtM,fontSize:10,fontFamily:'inherit',cursor:'pointer',fontWeight:700}}>
              ☑ Todos
            </button>
            <button onClick={()=>onColDefsChange(colDefs.map(c=>fixedKeys.has(c.key)?c:{...c,visible:false}))}
              style={{flex:1,padding:'5px',borderRadius:4,border:'none',background:isDark?'#374151':'#e5e7eb',color:txtM,fontSize:10,fontFamily:'inherit',cursor:'pointer',fontWeight:700}}>
              ☐ Nenhum
            </button>
            <button onClick={()=>{
              const defaults = colDefs.map(c=>({...c, visible:!!c.fixed}))
              onColDefsChange(defaults)
            }}
              style={{flex:1,padding:'5px',borderRadius:4,border:'none',background:isDark?'#374151':'#e5e7eb',color:txtM,fontSize:10,fontFamily:'inherit',cursor:'pointer',fontWeight:700}}>
              ↺ Padrão
            </button>
          </div>
        </div>
      )}

      <style>{`
        @keyframes spin{to{transform:rotate(360deg)}}
        #${tableId} tbody tr:nth-child(odd)  td{background:${rowBg}}
        #${tableId} tbody tr:nth-child(even) td{background:${rowAlt}}
        #${tableId} tbody tr:hover           td{background:${hoverBg}!important}
      `}</style>
    </div>
  )
}
