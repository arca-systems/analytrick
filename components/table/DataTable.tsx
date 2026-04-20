'use client'

import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react'
import { ColDef } from '@/lib/colDefs'
import { renderCell } from '@/lib/renderCell'
import { getFilterValue } from '@/lib/getFilterValue'

interface DataTableProps {
  cols: ColDef[]
  data: Record<string, unknown>[]
  isDark: boolean
  brd: string; txt: string; txtM: string; txtD: string; txtVD: string
  hbg: string; bg: string; inputBg: string
  headerBg?: string
  onColsChange?: (cols: ColDef[]) => void
}

const PAGE_SIZE = 100

export function DataTable({
  cols: initialCols,
  data,
  isDark,
  brd, txt, txtM, txtD, txtVD,
  hbg, bg, inputBg,
  headerBg = '#0f766e',
  onColsChange,
}: DataTableProps) {
  const [cols, setCols]               = useState<ColDef[]>(initialCols)
  const [sortKey, setSortKey]         = useState<string | null>(null)
  const [sortDir, setSortDir]         = useState<1 | -1>(1)
  const [filters, setFilters]         = useState<Record<string, Set<string>>>({})
  const [page, setPage]               = useState(1)
  const [search, setSearch]           = useState('')
  const [showColMgr, setShowColMgr]   = useState(false)
  const [filterDrop, setFilterDrop]   = useState<{ key: string; anchor: DOMRect } | null>(null)
  const [tempSel, setTempSel]         = useState<Set<string>>(new Set())
  const [dropSearch, setDropSearch]   = useState('')
  const [selected, setSelected]       = useState<string | null>(null)

  // Drag reorder
  const dragIdx   = useRef<number | null>(null)
  const dragOver  = useRef<number | null>(null)

  const visCols = useMemo(() => cols.filter(c => c.visible), [cols])

  // Sync cols when parent pushes new defs
  useEffect(() => { setCols(initialCols) }, [initialCols])

  // ── Computed filter value (usa getFilterValue) ─────────────
  const getVal = useCallback((row: Record<string, unknown>, key: string): string | number => {
    return getFilterValue(row as Record<string, unknown>, key)
  }, [])

  // ── Unique values for filter dropdown (already translated) ──
  const uniqueVals = useCallback((key: string): (string | number)[] => {
    const col = cols.find(c => c.key === key)
    const isNum = col?.numeric ?? false
    const set = new Set<string | number>()
    data.forEach(row => {
      const v = getVal(row, key)
      if (v !== '—' && v !== '' && v != null) set.add(v)
    })
    const arr = Array.from(set)
    if (isNum) {
      return arr
        .map(v => (typeof v === 'string' ? parseFloat(v) : v))
        .filter(v => !isNaN(v as number))
        .sort((a, b) => (a as number) - (b as number))
    }
    return arr.sort((a, b) => String(a).localeCompare(String(b), 'pt-BR'))
  }, [data, cols, getVal])

  // ── Sort + filter + search ─────────────────────────────────
  const processed = useMemo(() => {
    let rows = [...data]

    // search
    if (search.trim()) {
      const q = search.toLowerCase()
      rows = rows.filter(r =>
        Object.values(r).some(v => String(v ?? '').toLowerCase().includes(q))
      )
    }

    // column filters — compare against translated value
    Object.entries(filters).forEach(([key, sel]) => {
      if (!sel.size) return
      rows = rows.filter(r => {
        const v = getVal(r, key)
        return sel.has(String(v))
      })
    })

    // sort
    if (sortKey) {
      const col = cols.find(c => c.key === sortKey)
      const isNum = col?.numeric ?? false
      rows.sort((a, b) => {
        const av = isNum
          ? (parseFloat(String(a[sortKey] ?? '')) || -Infinity)
          : String(a[sortKey] ?? '').toLowerCase()
        const bv = isNum
          ? (parseFloat(String(b[sortKey] ?? '')) || -Infinity)
          : String(b[sortKey] ?? '').toLowerCase()
        if (av < bv) return -1 * sortDir
        if (av > bv) return  1 * sortDir
        return 0
      })
    }

    return rows
  }, [data, search, filters, sortKey, sortDir, cols, getVal])

  const totalPages = Math.max(1, Math.ceil(processed.length / PAGE_SIZE))
  const pageData   = processed.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)

  function handleSort(key: string) {
    const col = cols.find(c => c.key === key)
    if (!col?.sortable) return
    if (sortKey === key) setSortDir(d => (d === 1 ? -1 : 1))
    else { setSortKey(key); setSortDir(-1) }
    setPage(1)
  }

  function openFilter(key: string, anchor: DOMRect) {
    const sel = filters[key] || new Set<string>()
    setTempSel(new Set(sel))
    setDropSearch('')
    setFilterDrop({ key, anchor })
  }

  function applyFilter() {
    if (!filterDrop) return
    setFilters(f => {
      const n = { ...f }
      if (tempSel.size === 0) delete n[filterDrop.key]
      else n[filterDrop.key] = new Set(tempSel)
      return n
    })
    setFilterDrop(null)
    setPage(1)
  }

  function clearFilter() {
    if (!filterDrop) return
    setFilters(f => { const n = { ...f }; delete n[filterDrop.key]; return n })
    setFilterDrop(null)
    setPage(1)
  }

  function clearAllFilters() {
    setFilters({})
    setSearch('')
    setPage(1)
  }

  // ── Col manager ───────────────────────────────────────────
  function toggleCol(key: string) {
    setCols(cs => {
      const n = cs.map(c => c.key === key && !c.fixed ? { ...c, visible: !c.visible } : c)
      onColsChange?.(n)
      return n
    })
  }

  function onDragStart(i: number) { dragIdx.current = i }
  function onDragEnter(i: number) { dragOver.current = i }
  function onDragEnd() {
    if (dragIdx.current === null || dragOver.current === null) return
    if (dragIdx.current === dragOver.current) return
    setCols(cs => {
      const n = [...cs]
      const [moved] = n.splice(dragIdx.current!, 1)
      n.splice(dragOver.current!, 0, moved)
      onColsChange?.(n)
      return n
    })
    dragIdx.current = null; dragOver.current = null
  }

  // ── Styles ────────────────────────────────────────────────
  const thStyle = (key: string, w: string): React.CSSProperties => ({
    background: sortKey === key ? (isDark ? '#134e4a' : '#0d9488') : headerBg,
    color: '#fff', fontSize: 10, fontWeight: 700, letterSpacing: '.4px',
    padding: '7px 8px', textAlign: 'left', whiteSpace: 'nowrap',
    position: 'sticky', top: 0, zIndex: 2,
    minWidth: w, maxWidth: w, width: w,
    userSelect: 'none', cursor: 'pointer',
    borderRight: `1px solid ${headerBg}88`,
  })

  const tdStyle = (key: string): React.CSSProperties => ({
    padding: '5px 8px', fontSize: 11,
    borderBottom: `1px solid ${brd}`,
    // title: white-space normal (quebra linha)
    whiteSpace: key === 'title' ? 'normal' : 'nowrap',
    lineHeight: key === 'title' ? '1.4' : undefined,
    overflow: key === 'title' ? 'visible' : 'hidden',
    textOverflow: key === 'title' ? 'clip' : 'ellipsis',
    verticalAlign: 'top',
  })

  const activeFilters = Object.keys(filters).filter(k => filters[k]?.size > 0)

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', minHeight: 0 }}>

      {/* ── H2: search + info + buttons ── */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '6px 12px', flexShrink: 0, flexWrap: 'wrap', borderBottom: `1px solid ${brd}` }}>
        <input
          value={search} onChange={e => { setSearch(e.target.value); setPage(1) }}
          placeholder="🔍 Buscar..."
          style={{ background: inputBg, border: `1px solid ${brd}`, borderRadius: 6, color: txt, fontSize: 11, padding: '5px 10px', fontFamily: 'inherit', outline: 'none', width: 180 }}
        />
        <span style={{ fontSize: 11, color: txtD }}>
          {processed.length.toLocaleString('pt-BR')} registros
        </span>
        {activeFilters.length > 0 && (
          <button onClick={clearAllFilters} style={{ background: 'rgba(239,68,68,.15)', border: '1px solid rgba(239,68,68,.3)', borderRadius: 6, color: '#f87171', cursor: 'pointer', fontSize: 10, padding: '4px 10px', fontFamily: 'inherit', fontWeight: 700 }}>
            ✕ Limpar {activeFilters.length} filtro{activeFilters.length > 1 ? 's' : ''}
          </button>
        )}
        <div style={{ flex: 1 }} />
        <button onClick={() => setShowColMgr(v => !v)} style={{ background: showColMgr ? '#1e3a8a' : 'none', border: `1px solid ${brd}`, borderRadius: 6, color: txtM, cursor: 'pointer', fontSize: 11, padding: '5px 12px', fontFamily: 'inherit', fontWeight: 600 }}>
          ⚙ Colunas
        </button>
      </div>

      {/* ── Main area: table + col manager ── */}
      <div style={{ display: 'flex', flex: 1, minHeight: 0, overflow: 'hidden' }}>

        {/* ── Table ── */}
        <div style={{ flex: 1, overflow: 'auto', minHeight: 0 }}>
          <table style={{ borderCollapse: 'collapse', fontSize: 11, tableLayout: 'fixed', width: 'max-content', minWidth: '100%' }}>
            <thead>
              <tr>
                {/* Radio select col */}
                <th style={{ ...thStyle('_sel', '30px'), cursor: 'default' }} />
                {visCols.map(col => {
                  const canFilter = col.filterable !== false
                  const isFiltered = !!(filters[col.key]?.size)
                  return (
                    <th
                      key={col.key}
                      style={thStyle(col.key, col.w)}
                      onClick={() => handleSort(col.key)}
                      onContextMenu={e => {
                        if (!canFilter) return
                        e.preventDefault()
                        openFilter(col.key, e.currentTarget.getBoundingClientRect())
                      }}
                      title={canFilter ? 'Clique: ordenar | Ctrl+clique: filtrar' : 'Clique: ordenar'}
                      onClickCapture={e => {
                        if (canFilter && e.ctrlKey) {
                          e.preventDefault()
                          openFilter(col.key, (e.currentTarget as HTMLElement).getBoundingClientRect())
                        }
                      }}
                    >
                      <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                        {isFiltered && <span style={{ color: '#fbbf24' }}>▼</span>}
                        {col.label}
                        {col.sortable && sortKey === col.key && (
                          <span>{sortDir === 1 ? ' ↑' : ' ↓'}</span>
                        )}
                      </span>
                    </th>
                  )
                })}
              </tr>
            </thead>
            <tbody>
              {pageData.map((row, ri) => {
                const rowKey = String(row.item_id || row.id || row.sku || row.user_id || row.category_id || ri)
                const isEven = ri % 2 === 0
                const isSelected = selected === rowKey
                return (
                  <tr
                    key={rowKey}
                    onClick={() => setSelected(s => s === rowKey ? null : rowKey)}
                    style={{
                      background: isSelected ? (isDark ? '#1e3a5f' : '#dbeafe') : isEven ? (isDark ? '#111827' : '#fff') : (isDark ? '#1a2234' : '#f8fafc'),
                      cursor: 'pointer',
                    }}
                  >
                    <td style={{ ...tdStyle('_sel'), width: 30, textAlign: 'center' }}>
                      <input type="radio" readOnly checked={isSelected} style={{ cursor: 'pointer' }} />
                    </td>
                    {visCols.map(col => (
                      <td key={col.key} style={tdStyle(col.key)}>
                        {renderCell(row as Record<string, unknown>, col.key)}
                      </td>
                    ))}
                  </tr>
                )
              })}
              {pageData.length === 0 && (
                <tr>
                  <td colSpan={visCols.length + 1} style={{ textAlign: 'center', padding: 40, color: txtVD }}>
                    Nenhum registro encontrado
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* ── Col manager ── */}
        {showColMgr && (
          <div style={{ width: 220, flexShrink: 0, borderLeft: `1px solid ${brd}`, overflowY: 'auto', background: hbg }}>
            <div style={{ padding: '8px 12px', borderBottom: `1px solid ${brd}`, fontSize: 10, fontWeight: 700, color: txtVD, letterSpacing: '.4px' }}>COLUNAS</div>
            {cols.filter(c => !c.fixed).map((col, i) => (
              <div
                key={col.key}
                draggable
                onDragStart={() => onDragStart(i)}
                onDragEnter={() => onDragEnter(i)}
                onDragEnd={onDragEnd}
                style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '5px 12px', cursor: 'grab', borderBottom: `1px solid ${brd}22` }}
              >
                <span style={{ color: txtD, fontSize: 12, cursor: 'grab' }}>⠿</span>
                <label style={{ display: 'flex', alignItems: 'center', gap: 6, flex: 1, cursor: 'pointer' }}>
                  {/* Toggle switch */}
                  <input type="checkbox" checked={col.visible} onChange={() => toggleCol(col.key)} style={{ display: 'none' }} id={`col-${col.key}`} />
                  <label htmlFor={`col-${col.key}`} style={{ position: 'relative', display: 'inline-block', width: 28, height: 16, flexShrink: 0 }}>
                    <span style={{
                      position: 'absolute', inset: 0, borderRadius: 8,
                      background: col.visible ? '#2563eb' : (isDark ? '#374151' : '#d1d5db'),
                      transition: 'background .15s',
                    }} />
                    <span style={{
                      position: 'absolute', top: 2, left: col.visible ? 14 : 2, width: 12, height: 12,
                      borderRadius: '50%', background: '#fff', transition: 'left .15s',
                    }} />
                  </label>
                  <span style={{ fontSize: 10, color: col.visible ? txt : txtD }}>{col.label}</span>
                </label>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ── Pager ── */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, padding: '6px 12px', borderTop: `1px solid ${brd}`, flexShrink: 0, position: 'relative' }}>
        {[
          { label: '«', to: 1, disabled: page === 1 },
          { label: '‹', to: page - 1, disabled: page === 1 },
          { label: '›', to: page + 1, disabled: page === totalPages },
          { label: '»', to: totalPages, disabled: page === totalPages },
        ].map(btn => (
          <button key={btn.label} onClick={() => { if (!btn.disabled) setPage(btn.to) }}
            disabled={btn.disabled}
            style={{ background: 'none', border: `1px solid ${brd}`, borderRadius: 5, color: btn.disabled ? txtD : txtM, cursor: btn.disabled ? 'not-allowed' : 'pointer', fontSize: 13, padding: '3px 9px', fontFamily: 'inherit', fontWeight: 700, opacity: btn.disabled ? .4 : 1 }}>
            {btn.label}
          </button>
        ))}
        <span style={{ fontSize: 11, color: txtM, margin: '0 8px' }}>
          {page} / {totalPages}
        </span>
        <span style={{ position: 'absolute', right: 12, fontSize: 11, color: txtD }}>
          {processed.length.toLocaleString('pt-BR')} total
        </span>
      </div>

      {/* ── Filter dropdown ── */}
      {filterDrop && (() => {
        const vals = uniqueVals(filterDrop.key)
        const filtered = vals.filter(v => String(v).toLowerCase().includes(dropSearch.toLowerCase()))
        const col = cols.find(c => c.key === filterDrop.key)
        return (
          <div
            style={{
              position: 'fixed',
              left: Math.min(filterDrop.anchor.left, window.innerWidth - 280),
              top: Math.min(filterDrop.anchor.bottom + 4, window.innerHeight - 360),
              width: 270, zIndex: 9999,
              background: hbg, border: `1px solid ${brd}`, borderRadius: 8,
              boxShadow: '0 8px 24px rgba(0,0,0,.6)',
            }}
            onClick={e => e.stopPropagation()}
          >
            <div style={{ padding: '8px 12px', borderBottom: `1px solid ${brd}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: 11, fontWeight: 700, color: txt }}>▼ {col?.label || filterDrop.key}</span>
              <span style={{ fontSize: 10, color: txtD }}>{vals.length} valores</span>
            </div>
            <div style={{ padding: '6px 10px', borderBottom: `1px solid ${brd}` }}>
              <input value={dropSearch} onChange={e => setDropSearch(e.target.value)} placeholder="🔍 Buscar..."
                style={{ background: inputBg, border: `1px solid ${brd}`, borderRadius: 5, color: txt, fontSize: 11, padding: '4px 8px', fontFamily: 'inherit', outline: 'none', width: '100%', boxSizing: 'border-box' }} />
            </div>
            <div style={{ maxHeight: 220, overflowY: 'auto', padding: '4px 0' }}>
              {filtered.map(val => {
                const s = String(val)
                const checked = tempSel.has(s)
                return (
                  <label key={s} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '4px 12px', cursor: 'pointer' }}>
                    <input type="checkbox" checked={checked} onChange={() => {
                      setTempSel(ts => { const n = new Set(ts); checked ? n.delete(s) : n.add(s); return n })
                    }} style={{ cursor: 'pointer' }} />
                    <span style={{ fontSize: 11, color: txt }}>{s}</span>
                  </label>
                )
              })}
              {filtered.length === 0 && <div style={{ padding: '12px', textAlign: 'center', color: txtD, fontSize: 11 }}>Sem resultados</div>}
            </div>
            <div style={{ display: 'flex', gap: 6, padding: '8px 10px', borderTop: `1px solid ${brd}` }}>
              <button onClick={() => setTempSel(new Set(vals.map(String)))}
                style={{ flex: 1, background: 'none', border: `1px solid ${brd}`, borderRadius: 5, color: txtM, cursor: 'pointer', fontSize: 10, padding: '5px', fontFamily: 'inherit', fontWeight: 700 }}>☑ Todos</button>
              <button onClick={applyFilter}
                style={{ flex: 1, background: '#2563eb', border: 'none', borderRadius: 5, color: '#fff', cursor: 'pointer', fontSize: 10, padding: '5px', fontFamily: 'inherit', fontWeight: 700 }}>✓ Aplicar</button>
              <button onClick={clearFilter}
                style={{ flex: 1, background: 'none', border: `1px solid ${brd}`, borderRadius: 5, color: '#f87171', cursor: 'pointer', fontSize: 10, padding: '5px', fontFamily: 'inherit', fontWeight: 700 }}>✕ Limpar</button>
            </div>
          </div>
        )
      })()}

      {/* Fecha dropdown ao clicar fora */}
      {filterDrop && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 9998 }} onClick={() => setFilterDrop(null)} />
      )}
    </div>
  )
}
