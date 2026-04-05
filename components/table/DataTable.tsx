'use client'

import React, { useState, useRef, useEffect } from 'react'
import { ColDef } from '@/types'
import { renderCell } from '@/lib/renderCell'

interface DataTableProps {
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
  onReload?: () => void
  // tema
  isDark?: boolean
  rowBg?: string
  rowAlt?: string
  hoverBg?: string
  h2bg?: string
  brd?: string
  brd2?: string
  txt?: string
  txtD?: string
  txtVD?: string
}

type SortDir = 1 | -1

const PAGE_SIZE = 100

export function DataTable({
  rows, colDefs, onColDefsChange,
  headerColor = '#2563eb', headerColorSorted = '#1d4ed8',
  fixedKeys = new Set(), pageSize = PAGE_SIZE,
  countLabel = 'registros', tableId = 'atk-tbl',
  loading = false, searchKeys = [], onReload,
  isDark = true,
  rowBg = '#111827', rowAlt = '#1a2234', hoverBg = '#1e3a5f',
  h2bg = '#111827', brd = '#374151', brd2 = '#2d3748',
  txt = '#f9fafb', txtD = '#6b7280', txtVD = '#4b5563',
}: DataTableProps) {
  const [sortCol, setSortCol]     = useState('')
  const [sortDir, setSortDir]     = useState<SortDir>(-1)
  const [filters, setFilters]     = useState<Record<string, Set<string>>>({})
  const [page, setPage]           = useState(1)
  const [search, setSearch]       = useState('')
  const [dropdown, setDropdown]   = useState<{ key: string; rect: DOMRect } | null>(null)
  const [tempFilter, setTempFilter] = useState<Set<string>>(new Set())
  const [filterSearch, setFilterSearch] = useState('')
  const [showCols, setShowCols]   = useState(false)
  const [view, setView]           = useState<'analitica'|'dinamica'|'graficos'>('analitica')
  const ddRef  = useRef<HTMLDivElement>(null)

  const visCols = colDefs.filter(c => c.visible || fixedKeys.has(c.key))

  // ── Stickyy left ─────────────────────────────────────────
  const stickyLeft: Record<string, number> = {}
  let leftAcc = 0
  visCols.filter(c => fixedKeys.has(c.key)).forEach(c => {
    stickyLeft[c.key] = leftAcc
    leftAcc += parseInt(c.w) || 90
  })

  // ── Filtro + sort ─────────────────────────────────────────
  const filtered = React.useMemo(() => {
    let r = rows
    if (search && searchKeys.length) {
      const q = search.toLowerCase()
      r = r.filter(row => searchKeys.some(k => String(row[k]??'').toLowerCase().includes(q)))
    }
    if (Object.keys(filters).length) {
      r = r.filter(row =>
        Object.entries(filters).every(([k, vals]) => !vals.size || vals.has(String(row[k]??'')))
      )
    }
    return r
  }, [rows, search, filters, searchKeys])

  const sorted = React.useMemo(() => {
    if (!sortCol) return filtered
    return [...filtered].sort((a, b) => {
      const av = a[sortCol], bv = b[sortCol]
      const an = parseFloat(String(av)), bn = parseFloat(String(bv))
      if (!isNaN(an) && !isNaN(bn)) return (an - bn) * sortDir
      return String(av??'').localeCompare(String(bv??''), 'pt-BR') * sortDir
    })
  }, [filtered, sortCol, sortDir])

  const totalPages = Math.ceil(sorted.length / pageSize)
  const pageRows   = sorted.slice((page - 1) * pageSize, page * pageSize)
  const hasFilters = Object.values(filters).some(s => s.size > 0) || search.length > 0

  function handleThClick(e: React.MouseEvent<HTMLTableCellElement>, col: ColDef) {
    if (e.ctrlKey || e.metaKey) {
      const rect = e.currentTarget.getBoundingClientRect()
      setTempFilter(new Set(filters[col.key] ?? []))
      setFilterSearch('')
      setDropdown({ key: col.key, rect })
    } else {
      if (sortCol === col.key) setSortDir(d => d === 1 ? -1 : 1)
      else { setSortCol(col.key); setSortDir(-1) }
      setPage(1)
    }
  }

  function clearAll() {
    setFilters({})
    setSearch('')
    setPage(1)
  }

  function applyFilter() {
    if (!dropdown) return
    setFilters(f => {
      const n = { ...f }
      if (!tempFilter.size) delete n[dropdown.key]
      else n[dropdown.key] = new Set(tempFilter)
      return n
    })
    setDropdown(null); setPage(1)
  }

  function clearFilter() {
    if (!dropdown) return
    setFilters(f => { const n = { ...f }; delete n[dropdown.key]; return n })
    setDropdown(null); setPage(1)
  }

  useEffect(() => {
    if (!dropdown) return
    const handler = (e: MouseEvent) => {
      if (ddRef.current && !ddRef.current.contains(e.target as Node)) setDropdown(null)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [dropdown])

  const uniqueVals = dropdown
    ? [...new Set(rows.map(r => String(r[dropdown.key]??'')))].filter(v =>
        !filterSearch || v.toLowerCase().includes(filterSearch.toLowerCase())
      ).sort()
    : []

  function downloadCSV() {
    const hdr = visCols.map(c => c.label).join(';')
    const csvRows = sorted.map(row =>
      visCols.map(c => {
        const v = row[c.key]
        return v == null ? '' : '"' + String(v).replace(/"/g,'""') + '"'
      }).join(';')
    )
    const blob = new Blob(['\uFEFF' + [hdr, ...csvRows].join('\n')], { type: 'text/csv;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url; a.download = `analytrick-${tableId}.csv`; a.click()
    URL.revokeObjectURL(url)
  }

  const btnStyle = (active = false): React.CSSProperties => ({
    height: 28, padding: '0 10px', borderRadius: 5, fontSize: 11, fontWeight: 600,
    cursor: 'pointer', fontFamily: 'inherit',
    display: 'inline-flex', alignItems: 'center', gap: 4, whiteSpace: 'nowrap',
    background: active ? '#1e3a8a' : isDark ? '#374151' : '#e5e7eb',
    color: active ? '#fff' : isDark ? '#d1d5db' : '#374151',
    border: active ? '1px solid #163470' : `1px solid ${brd2}`,
    transition: 'background .15s',
  })

  const dlBtnStyle: React.CSSProperties = {
    ...btnStyle(false),
    background: '#fff', color: '#1e3a8a', fontWeight: 700, border: '1px solid #c7d2fe',
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', overflow: 'hidden', minHeight: 0 }}>

      {/* ══ H2 toolbar — fiel à extensão ════════════════ */}
      <div style={{
        display: 'flex', alignItems: 'center', height: 38, flexShrink: 0,
        background: h2bg, borderBottom: `2px solid ${brd2}`,
        padding: '0 10px', gap: 6,
      }}>
        {/* Esquerda: breadcrumb / busca / count */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, flex: 1, minWidth: 0, overflow: 'hidden' }}>
          {searchKeys.length > 0 && (
            <input
              type="text" placeholder="🔍 Buscar..."
              value={search} onChange={e => { setSearch(e.target.value); setPage(1) }}
              style={{
                background: isDark ? '#0f172a' : '#fff',
                border: `1px solid ${brd}`, borderRadius: 6,
                color: txt, fontSize: 11, padding: '4px 10px',
                fontFamily: 'inherit', outline: 'none', width: 180,
              }}
            />
          )}
          <span style={{ fontSize: 12, color: txtVD, fontWeight: 600, whiteSpace: 'nowrap' }}>
            {sorted.length.toLocaleString('pt-BR')} {countLabel}
            {hasFilters && <span style={{ color: '#f59e0b', marginLeft: 6 }}>● filtrado</span>}
          </span>
        </div>

        {/* Direita: botões H2 */}
        <div style={{ display: 'flex', gap: 4, alignItems: 'center', flexShrink: 0 }}>
          {/* Filtros */}
          <button style={btnStyle(hasFilters)} onClick={clearAll} title="Limpar filtros">
            ✕ Filtros
          </button>

          {/* Colunas */}
          <button style={btnStyle(showCols)} onClick={() => setShowCols(v => !v)} title="Gerenciar colunas">
            ⊞ Colunas
          </button>

          <div style={{ width: 1, height: 20, background: brd, flexShrink: 0, margin: '0 2px' }} />

          {/* Views */}
          <button style={btnStyle(view === 'analitica')} onClick={() => setView('analitica')} title="Tabela Analítica">
            ≡ Analítica
          </button>
          <button style={btnStyle(view === 'dinamica')} onClick={() => setView('dinamica')} title="Tabela Dinâmica">
            ⊞ Dinâmica
          </button>
          <button style={btnStyle(view === 'graficos')} onClick={() => setView('graficos')} title="Gráficos">
            📈 Gráficos
          </button>

          <div style={{ width: 1, height: 20, background: brd, flexShrink: 0, margin: '0 2px' }} />

          {/* Dados / Download */}
          <button style={dlBtnStyle} onClick={downloadCSV} title="Baixar CSV">
            ⬇↑ Dados
          </button>

          {onReload && (
            <button style={btnStyle()} onClick={onReload} title="Recarregar dados">↻</button>
          )}
        </div>
      </div>

      {/* ══ Tabela ══════════════════════════════════════ */}
      <div style={{ flex: 1, overflow: 'auto', minHeight: 0, position: 'relative' }}>
        {loading ? (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', gap: 12 }}>
            <div style={{ width: 28, height: 28, border: '3px solid #374151', borderTopColor: '#3b82f6', borderRadius: '50%', animation: 'spin .7s linear infinite' }} />
            <span style={{ color: txtD, fontSize: 13 }}>Carregando...</span>
          </div>
        ) : (
          <table id={tableId} style={{ borderCollapse: 'collapse', fontSize: 11, tableLayout: 'fixed', width: 'max-content', minWidth: '100%' }}>
            <thead>
              <tr style={{ position: 'sticky', top: 0, zIndex: 10 }}>
                {visCols.map(col => {
                  const isFixed  = fixedKeys.has(col.key)
                  const isSorted = sortCol === col.key
                  const hasFilter = (filters[col.key]?.size ?? 0) > 0
                  return (
                    <th
                      key={col.key} data-key={col.key}
                      title="1 clique = ordenar · Ctrl+clique = filtrar"
                      onClick={e => handleThClick(e, col)}
                      style={{
                        minWidth: col.w, maxWidth: col.w, width: col.w,
                        background: isSorted ? headerColorSorted : headerColor,
                        position: isFixed ? 'sticky' : undefined,
                        left: isFixed ? stickyLeft[col.key] : undefined,
                        zIndex: isFixed ? 15 : undefined,
                        padding: '8px 10px', textAlign: 'left',
                        fontSize: 10, fontWeight: 700, color: '#fff',
                        whiteSpace: 'nowrap', letterSpacing: '.4px',
                        userSelect: 'none', cursor: 'pointer',
                        borderRight: '1px solid rgba(255,255,255,.08)',
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                        <span>{col.label}</span>
                        {hasFilter && <span style={{ color: '#fbbf24' }}>▼</span>}
                        {isSorted && <span>{sortDir === 1 ? '↑' : '↓'}</span>}
                        {!isSorted && !hasFilter && col.sortable && <span style={{ opacity: .4 }}>↕</span>}
                      </div>
                    </th>
                  )
                })}
              </tr>
            </thead>
            <tbody>
              {pageRows.map((row, i) => (
                <tr key={i}>
                  {visCols.map(col => {
                    const isFixed = fixedKeys.has(col.key)
                    return (
                      <td key={col.key} data-key={col.key} style={{
                        minWidth: col.w, maxWidth: col.w, width: col.w,
                        position: isFixed ? 'sticky' : undefined,
                        left: isFixed ? stickyLeft[col.key] : undefined,
                        zIndex: isFixed ? 5 : undefined,
                        padding: '7px 10px',
                        borderBottom: `1px solid ${brd2}`,
                        verticalAlign: 'middle',
                        overflow: 'hidden', whiteSpace: 'nowrap', textOverflow: 'ellipsis',
                      }}>
                        {renderCell(row as Record<string, unknown>, col.key)}
                      </td>
                    )
                  })}
                </tr>
              ))}
              {pageRows.length === 0 && (
                <tr>
                  <td colSpan={visCols.length} style={{ textAlign: 'center', padding: 40, color: txtD }}>
                    Nenhum resultado
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        )}
      </div>

      {/* ══ Pager ══════════════════════════════════════ */}
      {totalPages > 1 && (
        <div style={{
          display: 'flex', alignItems: 'center', gap: 6,
          padding: '5px 12px', borderTop: `1px solid ${brd}`,
          background: h2bg, flexShrink: 0, fontSize: 11, color: txtD,
        }}>
          <button style={btnStyle()} onClick={() => setPage(1)} disabled={page === 1}>«</button>
          <button style={btnStyle()} onClick={() => setPage(p => Math.max(1, p-1))} disabled={page === 1}>‹</button>
          {Array.from({ length: Math.min(7, totalPages) }, (_, i) => {
            const start = Math.max(1, Math.min(page - 3, totalPages - 6))
            const p = start + i
            return p <= totalPages ? (
              <button key={p} style={btnStyle(page === p)} onClick={() => setPage(p)}>{p}</button>
            ) : null
          })}
          <button style={btnStyle()} onClick={() => setPage(p => Math.min(totalPages, p+1))} disabled={page === totalPages}>›</button>
          <button style={btnStyle()} onClick={() => setPage(totalPages)} disabled={page === totalPages}>»</button>
          <span style={{ marginLeft: 'auto' }}>
            Pág. {page}/{totalPages} · {sorted.length.toLocaleString('pt-BR')} {countLabel}
          </span>
        </div>
      )}

      {/* ══ Filter Dropdown ════════════════════════════ */}
      {dropdown && (
        <div ref={ddRef} style={{
          position: 'fixed',
          top: Math.min(dropdown.rect.bottom + 4, window.innerHeight - 380),
          left: Math.min(dropdown.rect.left, window.innerWidth - 300),
          width: 280, background: isDark ? '#1f2937' : '#fff',
          border: `1px solid ${brd}`, borderRadius: 10, zIndex: 9999,
          boxShadow: '0 8px 32px rgba(0,0,0,.6)', display: 'flex', flexDirection: 'column',
        }}>
          <div style={{ padding: '10px 12px', borderBottom: `1px solid ${brd}`, display: 'flex', justifyContent: 'space-between' }}>
            <span style={{ fontSize: 11, fontWeight: 700, color: txt }}>
              ▼ {colDefs.find(c => c.key === dropdown.key)?.label || dropdown.key}
            </span>
            <span style={{ fontSize: 10, color: txtVD }}>{uniqueVals.length} valores</span>
          </div>
          <div style={{ padding: '8px 12px', borderBottom: `1px solid ${brd}` }}>
            <input autoFocus type="text" placeholder="🔍 Buscar..."
              value={filterSearch} onChange={e => setFilterSearch(e.target.value)}
              style={{ width: '100%', background: isDark ? '#0f172a' : '#f3f4f6', border: `1px solid ${brd}`, borderRadius: 6, color: txt, fontSize: 11, padding: '5px 10px', fontFamily: 'inherit', outline: 'none' }}
            />
          </div>
          <div style={{ maxHeight: 240, overflowY: 'auto', padding: '4px 0' }}>
            {uniqueVals.map(val => (
              <label key={val} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '5px 12px', cursor: 'pointer', fontSize: 11, color: txt }}
                onMouseEnter={e => e.currentTarget.style.background = isDark ? '#273549' : '#f3f4f6'}
                onMouseLeave={e => e.currentTarget.style.background = ''}>
                <input type="checkbox" checked={tempFilter.has(val)}
                  onChange={() => {
                    const n = new Set(tempFilter)
                    n.has(val) ? n.delete(val) : n.add(val)
                    setTempFilter(n)
                  }} style={{ accentColor: '#3b82f6' }} />
                <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{val || '(vazio)'}</span>
              </label>
            ))}
          </div>
          <div style={{ display: 'flex', gap: 6, padding: 10, borderTop: `1px solid ${brd}` }}>
            <button onClick={() => setTempFilter(new Set(uniqueVals))} style={{ ...btnStyle(), flex: 1 }}>☑ Todos</button>
            <button onClick={applyFilter} style={{ ...btnStyle(true), flex: 1 }}>✓ Aplicar</button>
            <button onClick={clearFilter} style={{ ...btnStyle(), flex: 1 }}>✕ Limpar</button>
          </div>
        </div>
      )}

      {/* ══ Col Manager ════════════════════════════════ */}
      {showCols && (
        <div style={{
          position: 'fixed', inset: 0, zIndex: 9998, background: 'rgba(0,0,0,.5)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }} onClick={e => e.target === e.currentTarget && setShowCols(false)}>
          <div style={{
            background: isDark ? '#1f2937' : '#fff', border: `1px solid ${brd}`,
            borderRadius: 12, width: 420, maxHeight: '80vh',
            display: 'flex', flexDirection: 'column',
            boxShadow: '0 8px 40px rgba(0,0,0,.7)',
          }}>
            <div style={{ padding: '12px 16px', borderBottom: `1px solid ${brd}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: 12, fontWeight: 800, color: txt, letterSpacing: '.5px' }}>⊞ GERENCIAR COLUNAS</span>
              <button onClick={() => setShowCols(false)} style={{ background: 'none', border: 'none', color: txtD, cursor: 'pointer', fontSize: 18 }}>✕</button>
            </div>
            <div style={{ overflowY: 'auto', padding: '8px 0' }}>
              {colDefs.map(col => (
                <label key={col.key} style={{
                  display: 'flex', alignItems: 'center', gap: 10,
                  padding: '7px 16px', cursor: fixedKeys.has(col.key) ? 'not-allowed' : 'pointer',
                  opacity: fixedKeys.has(col.key) ? .5 : 1, fontSize: 12, color: txt,
                }}
                  onMouseEnter={e => { if (!fixedKeys.has(col.key)) e.currentTarget.style.background = isDark ? '#273549' : '#f3f4f6' }}
                  onMouseLeave={e => { e.currentTarget.style.background = '' }}>
                  <input type="checkbox" checked={col.visible} disabled={fixedKeys.has(col.key)}
                    onChange={() => {
                      if (fixedKeys.has(col.key)) return
                      onColDefsChange(colDefs.map(c => c.key === col.key ? { ...c, visible: !c.visible } : c))
                    }} style={{ accentColor: '#3b82f6' }} />
                  <span style={{ flex: 1 }}>{col.label}</span>
                  <span style={{ fontSize: 10, color: txtVD }}>{col.w}</span>
                </label>
              ))}
            </div>
            <div style={{ padding: 12, borderTop: `1px solid ${brd}`, display: 'flex', gap: 8 }}>
              <button style={{ ...btnStyle(), flex: 1 }}
                onClick={() => onColDefsChange(colDefs.map(c => fixedKeys.has(c.key) ? c : { ...c, visible: true }))}>
                ☑ Todas
              </button>
              <button style={{ ...btnStyle(), flex: 1 }}
                onClick={() => onColDefsChange(colDefs.map(c => fixedKeys.has(c.key) ? c : { ...c, visible: false }))}>
                ☐ Nenhuma
              </button>
            </div>
          </div>
        </div>
      )}

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        #${tableId} tbody tr:nth-child(odd)  td { background: ${rowBg}; }
        #${tableId} tbody tr:nth-child(even) td { background: ${rowAlt}; }
        #${tableId} tbody tr:hover           td { background: ${hoverBg} !important; }
      `}</style>
    </div>
  )
}
