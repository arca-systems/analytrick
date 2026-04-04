'use client'

import React, { useState, useRef, useCallback, useEffect } from 'react'
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
  isDark?: boolean
  rowBg?: string
  rowAlt?: string
  hoverBg?: string
  onReload?: () => void
}

type SortDir = 1 | -1

interface FilterState {
  [key: string]: Set<string>
}

const PAGE_SIZE_DEFAULT = 100

export function DataTable({
  rows,
  colDefs,
  onColDefsChange,
  headerColor = '#2563eb',
  headerColorSorted = '#1d4ed8',
  fixedKeys = new Set(),
  pageSize = PAGE_SIZE_DEFAULT,
  countLabel = 'registros',
  tableId = 'atk-tbl',
  loading = false,
  searchKeys = [],
  isDark = true,
  rowBg = '#111827',
  rowAlt = '#1a2234',
  hoverBg = '#1e3a5f',
  onReload,
}: DataTableProps) {
  const [sortCol, setSortCol] = useState<string>('')
  const [sortDir, setSortDir] = useState<SortDir>(1)
  const [filters, setFilters] = useState<FilterState>({})
  const [page, setPage] = useState(1)
  const [search, setSearch] = useState('')
  const [dropdown, setDropdown] = useState<{ key: string; rect: DOMRect } | null>(null)
  const [tempFilter, setTempFilter] = useState<Set<string>>(new Set())
  const [filterSearch, setFilterSearch] = useState('')
  const [showColManager, setShowColManager] = useState(false)
  const ddRef = useRef<HTMLDivElement>(null)
  const scrollRef = useRef<HTMLDivElement>(null)

  const visCols = colDefs.filter(c => c.visible || fixedKeys.has(c.key))

  // ── filtro + sort ────────────────────────────────────────
  const filtered = React.useMemo(() => {
    let r = rows
    if (search && searchKeys.length) {
      const q = search.toLowerCase()
      r = r.filter(row => searchKeys.some(k => String(row[k] ?? '').toLowerCase().includes(q)))
    }
    if (Object.keys(filters).length) {
      r = r.filter(row =>
        Object.entries(filters).every(([k, vals]) =>
          !vals.size || vals.has(String(row[k] ?? ''))
        )
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
      return String(av ?? '').localeCompare(String(bv ?? ''), 'pt-BR') * sortDir
    })
  }, [filtered, sortCol, sortDir])

  const totalPages = Math.ceil(sorted.length / pageSize)
  const pageRows = sorted.slice((page - 1) * pageSize, page * pageSize)

  // ── handlers ────────────────────────────────────────────
  function handleThClick(e: React.MouseEvent<HTMLTableCellElement>, col: ColDef) {
    if (e.ctrlKey || e.metaKey) {
      // filtro
      const rect = e.currentTarget.getBoundingClientRect()
      const vals = new Set(rows.map(r => String(r[col.key] ?? '')))
      setTempFilter(new Set(filters[col.key] ?? []))
      setFilterSearch('')
      setDropdown({ key: col.key, rect })
    } else {
      // sort
      if (sortCol === col.key) setSortDir(d => (d === 1 ? -1 : 1))
      else { setSortCol(col.key); setSortDir(-1) }
      setPage(1)
    }
  }

  function applyFilter() {
    if (!dropdown) return
    setFilters(f => {
      const next = { ...f }
      if (!tempFilter.size) delete next[dropdown.key]
      else next[dropdown.key] = new Set(tempFilter)
      return next
    })
    setDropdown(null)
    setPage(1)
  }

  function clearFilter() {
    if (!dropdown) return
    setFilters(f => { const next = { ...f }; delete next[dropdown.key]; return next })
    setDropdown(null)
    setPage(1)
  }

  function clearAllFilters() {
    setFilters({})
    setSearch('')
    setPage(1)
  }

  // close dropdown on outside click
  useEffect(() => {
    if (!dropdown) return
    function handler(e: MouseEvent) {
      if (ddRef.current && !ddRef.current.contains(e.target as Node)) setDropdown(null)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [dropdown])

  const uniqueVals = dropdown
    ? [...new Set(rows.map(r => String(r[dropdown.key] ?? '')))].filter(v =>
        !filterSearch || v.toLowerCase().includes(filterSearch.toLowerCase())
      ).sort()
    : []

  const hasFilters = Object.values(filters).some(s => s.size > 0) || search

  // ── Col Manager ──────────────────────────────────────────
  function toggleCol(key: string) {
    if (fixedKeys.has(key)) return
    onColDefsChange(colDefs.map(c => c.key === key ? { ...c, visible: !c.visible } : c))
  }

  // ── Sticky left calc ────────────────────────────────────
  const stickyLeft: Record<string, number> = {}
  let left = 0
  visCols.filter(c => fixedKeys.has(c.key)).forEach(c => {
    stickyLeft[c.key] = left
    left += parseInt(c.w) || 90
  })

  // ── Download CSV ────────────────────────────────────────
  function downloadCSV() {
    const headers = visCols.map(c => c.label).join(';')
    const csvRows = sorted.map(row =>
      visCols.map(c => {
        const v = row[c.key]
        if (v == null) return ''
        return '"' + String(v).replace(/"/g, '""') + '"'
      }).join(';')
    )
    const blob = new Blob(['\uFEFF' + [headers, ...csvRows].join('\n')], { type: 'text/csv;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url; a.download = `analytrick-${tableId}.csv`; a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', overflow: 'hidden', minHeight: 0 }}>

      {/* ── H2 toolbar ─────────────────────────────────── */}
      <div style={{
        display: 'flex', alignItems: 'center', gap: 6, padding: '0 10px',
        height: 38, flexShrink: 0,
        background: isDark ? '#111827' : '#f8fafc',
        borderBottom: `2px solid ${isDark ? '#2d3748' : '#e5e7eb'}`,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, flex: 1, minWidth: 0 }}>
          {searchKeys.length > 0 && (
            <input
              type="text"
              placeholder="🔍 Buscar..."
              value={search}
              onChange={e => { setSearch(e.target.value); setPage(1) }}
              style={{
                background: '#0f172a', border: '1px solid #374151', borderRadius: 6,
                color: '#f9fafb', fontSize: 11, padding: '4px 10px',
                fontFamily: 'inherit', outline: 'none', width: 200,
              }}
            />
          )}
          <span style={{ fontSize: 12, color: '#4b5563', fontWeight: 600, whiteSpace: 'nowrap' }}>
            {sorted.length.toLocaleString('pt-BR')} {countLabel}
            {hasFilters && <span style={{ color: '#f59e0b', marginLeft: 6 }}>filtrado</span>}
          </span>
        </div>
        <div style={{ display: 'flex', gap: 4, alignItems: 'center' }}>
          {hasFilters && (
            <button className="atk-btn" onClick={clearAllFilters}>✕ Filtros</button>
          )}
          <button className="atk-btn" onClick={() => setShowColManager(v => !v)}>⊞ Colunas</button>
          <div style={{ width: 1, height: 20, background: '#374151', margin: '0 2px' }} />
          <button className="atk-btn" onClick={downloadCSV} title="Baixar CSV">⬇ CSV</button>
          {onReload && (
            <button className="atk-btn" onClick={onReload} title="Recarregar dados">↻</button>
          )}
        </div>
        <span style={{ fontSize: 11, color: '#4b5563' }}>
          1 clique = ordenar · Ctrl+clique = filtrar
        </span>
      </div>

      {/* ── Table ──────────────────────────────────────── */}
      <div style={{ flex: 1, overflow: 'auto', minHeight: 0, position: 'relative' }} ref={scrollRef}>
        {loading ? (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', gap: 12 }}>
            <div style={{ width: 28, height: 28, border: '3px solid #374151', borderTopColor: '#3b82f6', borderRadius: '50%', animation: 'spin 0.7s linear infinite' }} />
            <span style={{ color: '#6b7280', fontSize: 13 }}>Carregando...</span>
          </div>
        ) : (
          <table id={tableId} className="atk-table">
            <thead>
              <tr style={{ position: 'sticky', top: 0, zIndex: 10 }}>
                {visCols.map(col => {
                  const isFixed = fixedKeys.has(col.key)
                  const isSorted = sortCol === col.key
                  const hasFilter = filters[col.key]?.size > 0
                  return (
                    <th
                      key={col.key}
                      data-key={col.key}
                      title="1 clique = ordenar · Ctrl+clique = filtrar"
                      onClick={e => handleThClick(e, col)}
                      style={{
                        minWidth: col.w, maxWidth: col.w, width: col.w,
                        background: isSorted ? headerColorSorted : headerColor,
                        position: isFixed ? 'sticky' : undefined,
                        left: isFixed ? stickyLeft[col.key] : undefined,
                        zIndex: isFixed ? 15 : undefined,
                        userSelect: 'none',
                        cursor: 'pointer',
                        borderRight: '1px solid rgba(255,255,255,0.08)',
                        padding: '8px 10px',
                        textAlign: 'left',
                        fontSize: 10,
                        fontWeight: 700,
                        color: '#fff',
                        whiteSpace: 'nowrap',
                        letterSpacing: '0.4px',
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                        <span>{col.label}</span>
                        {hasFilter && <span style={{ color: '#fbbf24' }}>▼</span>}
                        {isSorted && <span>{sortDir === 1 ? '↑' : '↓'}</span>}
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
                      <td
                        key={col.key}
                        data-key={col.key}
                        style={{
                          minWidth: col.w, maxWidth: col.w, width: col.w,
                          position: isFixed ? 'sticky' : undefined,
                          left: isFixed ? stickyLeft[col.key] : undefined,
                          zIndex: isFixed ? 5 : undefined,
                          padding: '7px 10px',
                          borderBottom: '1px solid #2d3748',
                          verticalAlign: 'middle',
                          overflow: 'hidden',
                          whiteSpace: 'nowrap',
                          textOverflow: 'ellipsis',
                          fontSize: 11,
                        }}
                      >
                        {renderCell(row as Record<string, unknown>, col.key)}
                      </td>
                    )
                  })}
                </tr>
              ))}
              {pageRows.length === 0 && (
                <tr>
                  <td colSpan={visCols.length} style={{ textAlign: 'center', padding: 40, color: '#4b5563' }}>
                    Nenhum resultado
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        )}
      </div>

      {/* ── Pager ──────────────────────────────────────── */}
      {totalPages > 1 && (
        <div className="atk-pager">
          <button onClick={() => setPage(1)} disabled={page === 1}>«</button>
          <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}>‹</button>
          {Array.from({ length: Math.min(7, totalPages) }, (_, i) => {
            let p = i + 1
            if (totalPages > 7) {
              const start = Math.max(1, page - 3)
              p = Math.min(start + i, totalPages - 6 + i)
            }
            return (
              <button key={p} onClick={() => setPage(p)} className={page === p ? 'active' : ''}>
                {p}
              </button>
            )
          })}
          <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages}>›</button>
          <button onClick={() => setPage(totalPages)} disabled={page === totalPages}>»</button>
          <span style={{ marginLeft: 'auto', color: '#4b5563' }}>
            Pág. {page}/{totalPages} · {sorted.length.toLocaleString('pt-BR')} {countLabel}
          </span>
        </div>
      )}

      {/* ── Filter Dropdown ────────────────────────────── */}
      {dropdown && (
        <div
          ref={ddRef}
          style={{
            position: 'fixed',
            top: Math.min(dropdown.rect.bottom + 4, window.innerHeight - 380),
            left: Math.min(dropdown.rect.left, window.innerWidth - 300),
            width: 280,
            background: '#1f2937',
            border: '1px solid #374151',
            borderRadius: 10,
            zIndex: 9999,
            boxShadow: '0 8px 32px rgba(0,0,0,0.6)',
            display: 'flex',
            flexDirection: 'column',
          }}
        >
          <div style={{ padding: '10px 12px', borderBottom: '1px solid #374151', display: 'flex', justifyContent: 'space-between' }}>
            <span style={{ fontSize: 11, fontWeight: 700, color: '#f9fafb' }}>
              ▼ {colDefs.find(c => c.key === dropdown.key)?.label || dropdown.key}
            </span>
            <span style={{ fontSize: 10, color: '#4b5563' }}>{uniqueVals.length} valores</span>
          </div>
          <div style={{ padding: '8px 12px', borderBottom: '1px solid #374151' }}>
            <input
              autoFocus
              type="text"
              placeholder="🔍 Buscar..."
              value={filterSearch}
              onChange={e => setFilterSearch(e.target.value)}
              style={{
                width: '100%', background: '#0f172a', border: '1px solid #374151',
                borderRadius: 6, color: '#f9fafb', fontSize: 11, padding: '5px 10px',
                fontFamily: 'inherit', outline: 'none',
              }}
            />
          </div>
          <div style={{ maxHeight: 240, overflowY: 'auto', padding: '4px 0' }}>
            {uniqueVals.map(val => (
              <label key={val} style={{
                display: 'flex', alignItems: 'center', gap: 8,
                padding: '5px 12px', cursor: 'pointer', fontSize: 11, color: '#d1d5db',
              }}
                onMouseEnter={e => (e.currentTarget.style.background = '#273549')}
                onMouseLeave={e => (e.currentTarget.style.background = '')}
              >
                <input
                  type="checkbox"
                  checked={tempFilter.has(val)}
                  onChange={() => {
                    const next = new Set(tempFilter)
                    next.has(val) ? next.delete(val) : next.add(val)
                    setTempFilter(next)
                  }}
                  style={{ accentColor: '#3b82f6' }}
                />
                <span className="atk-trunc">{val || '(vazio)'}</span>
              </label>
            ))}
          </div>
          <div style={{ display: 'flex', gap: 6, padding: 10, borderTop: '1px solid #374151' }}>
            <button onClick={() => setTempFilter(new Set(uniqueVals))} className="atk-btn" style={{ flex: 1 }}>☑ Todos</button>
            <button onClick={applyFilter} className="atk-btn active" style={{ flex: 1 }}>✓ Aplicar</button>
            <button onClick={clearFilter} className="atk-btn" style={{ flex: 1 }}>✕ Limpar</button>
          </div>
        </div>
      )}

      {/* ── Col Manager ────────────────────────────────── */}
      {showColManager && (
        <div style={{
          position: 'fixed', inset: 0, zIndex: 9998, background: 'rgba(0,0,0,0.5)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }} onClick={e => e.target === e.currentTarget && setShowColManager(false)}>
          <div style={{
            background: '#1f2937', border: '1px solid #374151', borderRadius: 12,
            width: 420, maxHeight: '80vh', display: 'flex', flexDirection: 'column',
            boxShadow: '0 8px 40px rgba(0,0,0,0.7)',
          }}>
            <div style={{ padding: '12px 16px', borderBottom: '1px solid #374151', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: 12, fontWeight: 800, color: '#f9fafb', letterSpacing: '.5px' }}>⊞ GERENCIAR COLUNAS</span>
              <button onClick={() => setShowColManager(false)} style={{ background: 'none', border: 'none', color: '#6b7280', cursor: 'pointer', fontSize: 18 }}>✕</button>
            </div>
            <div style={{ overflowY: 'auto', padding: '8px 0' }}>
              {colDefs.map(col => (
                <label key={col.key} style={{
                  display: 'flex', alignItems: 'center', gap: 10, padding: '7px 16px',
                  cursor: fixedKeys.has(col.key) ? 'not-allowed' : 'pointer',
                  opacity: fixedKeys.has(col.key) ? 0.5 : 1, fontSize: 12, color: '#d1d5db',
                }}
                  onMouseEnter={e => { if (!fixedKeys.has(col.key)) e.currentTarget.style.background = '#273549' }}
                  onMouseLeave={e => { e.currentTarget.style.background = '' }}
                >
                  <input
                    type="checkbox"
                    checked={col.visible}
                    disabled={fixedKeys.has(col.key)}
                    onChange={() => toggleCol(col.key)}
                    style={{ accentColor: '#3b82f6' }}
                  />
                  <span style={{ flex: 1 }}>{col.label}</span>
                  <span style={{ fontSize: 10, color: '#4b5563' }}>{col.w}</span>
                </label>
              ))}
            </div>
            <div style={{ padding: 12, borderTop: '1px solid #374151', display: 'flex', gap: 8 }}>
              <button className="atk-btn" style={{ flex: 1 }}
                onClick={() => onColDefsChange(colDefs.map(c => fixedKeys.has(c.key) ? c : { ...c, visible: true }))}>
                ☑ Todas
              </button>
              <button className="atk-btn" style={{ flex: 1 }}
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
        #${tableId} thead th:first-child { border-radius: 0; }
      `}</style>
    </div>
  )
}
