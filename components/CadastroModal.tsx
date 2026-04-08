'use client'

import React, { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'

type TabId = 'produtos' | 'categorias' | 'marcas' | 'fornecedores'

interface Atributo { nome: string; valor: string }
interface Variacao { nome: string; valores: string[] }
interface VarRow { [key: string]: string; codigo: string; preco: string; situacao: string }

interface CadastroModalProps {
  tabId: TabId
  editRow?: Record<string, unknown> | null
  isDark: boolean
  brd: string; txt: string; txtM: string; txtD: string; txtVD: string
  hbg: string; bg: string; inputBg: string
  onClose: () => void
  onSaved: () => void
}

function genCombinations(variacoes: Variacao[]): Record<string, string>[] {
  if (!variacoes.length) return []
  const result: Record<string, string>[] = [{}]
  for (const v of variacoes) {
    const next: Record<string, string>[] = []
    for (const existing of result) {
      for (const val of v.valores) {
        next.push({ ...existing, [v.nome]: val })
      }
    }
    result.splice(0, result.length, ...next)
  }
  return result
}

export default function CadastroModal({
  tabId, editRow, isDark, brd, txt, txtM, txtD, txtVD, hbg, bg, inputBg,
  onClose, onSaved,
}: CadastroModalProps) {
  const supabase = createClient()
  const [aba, setAba] = useState<'ident'|'attrs'|'vars'>('ident')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  // Opções para dropdowns
  const [categorias, setCategorias] = useState<string[]>([])
  const [marcas, setMarcas]         = useState<string[]>([])

  // Campos produto
  const [sku,      setSku]      = useState('')
  const [categoria,setCategoria]= useState('')
  const [marca,    setMarca]    = useState('')
  const [modelo,   setModelo]   = useState('')
  const [linha,    setLinha]    = useState('')
  const [versao,   setVersao]   = useState('')
  const [serie,    setSerie]    = useState('')
  const [origem,   setOrigem]   = useState('')
  const [gtin,     setGtin]     = useState('')
  const [spu,      setSpu]      = useState('')
  const [skc,      setSkc]      = useState('')

  // Atributos (JSON)
  const [atributos, setAtributos] = useState<Atributo[]>([{ nome: '', valor: '' }])

  // Variações
  const [variacoes, setVariacoes] = useState<Variacao[]>([])
  const [varRows,   setVarRows]   = useState<VarRow[]>([])
  const [newVarNome, setNewVarNome] = useState('')
  const [newVarValor, setNewVarValor] = useState('')

  // Campos marca
  const [brandName,  setBrandName]  = useState('')
  const [brandUrl,   setBrandUrl]   = useState('')
  const [brandInsta, setBrandInsta] = useState('')
  const [brandFb,    setBrandFb]    = useState('')
  const [brandYt,    setBrandYt]    = useState('')
  const [brandTt,    setBrandTt]    = useState('')
  const [brandCountry, setBrandCountry] = useState('')

  // Campos categoria
  const [catName,   setCatName]   = useState('')
  const [catMl,     setCatMl]     = useState('')
  const [catShopee, setCatShopee] = useState('')
  const [catAmazon, setCatAmazon] = useState('')
  const [catMagalu, setCatMagalu] = useState('')

  // Campos fornecedor
  const [supName, setSupName] = useState('')

  // Carrega opções e preenche edição
  useEffect(() => {
    supabase.from('categories').select('category').order('category').then(({data}) => {
      setCategorias(data?.map(r => r.category as string) || [])
    })
    supabase.from('brands').select('brand').order('brand').then(({data}) => {
      setMarcas(data?.map(r => r.brand as string) || [])
    })
    if (editRow) {
      if (tabId === 'produtos') {
        setSku(String(editRow.sku||''))
        setCategoria(String(editRow.category||''))
        setMarca(String(editRow.brand||''))
        setModelo(String(editRow.model||''))
        setLinha(String(editRow.line||''))
        setVersao(String(editRow.version||''))
        setSerie(String(editRow.serie||''))
        setOrigem(String(editRow.origin||''))
        setGtin(String(editRow.gtin||''))
        setSpu(String(editRow.spu||''))
        setSkc(String(editRow.skc||''))
        try {
          const a = JSON.parse(String(editRow.attributes||'[]'))
          if (Array.isArray(a) && a.length) setAtributos(a)
        } catch {}
      } else if (tabId === 'marcas') {
        setBrandName(String(editRow.brand||''))
        setBrandUrl(String(editRow.brand_url||''))
        setBrandInsta(String(editRow.brand_instagram||''))
        setBrandFb(String(editRow.brand_facebook||''))
        setBrandYt(String(editRow.brand_youtube||''))
        setBrandTt(String(editRow.brand_tiktok||''))
        setBrandCountry(String(editRow.country||''))
      } else if (tabId === 'categorias') {
        setCatName(String(editRow.category||''))
        setCatMl(String(editRow.mercadolibre_category_id||''))
        setCatShopee(String(editRow.shopee_category_id||''))
        setCatAmazon(String(editRow.amazon_category_id||''))
        setCatMagalu(String(editRow.magazineluiza_category_id||''))
      } else if (tabId === 'fornecedores') {
        setSupName(String(editRow.supplier||''))
      }
    }
  }, [editRow, tabId])

  // Recalcula varRows quando variacoes muda
  useEffect(() => {
    const combos = genCombinations(variacoes)
    setVarRows(combos.map(c => ({ ...c, codigo: '', preco: '', situacao: 'ativo' })))
  }, [variacoes])

  // ── Helpers ──────────────────────────────────────────────
  const inputStyle: React.CSSProperties = {
    background: inputBg, border: `1px solid ${brd}`, borderRadius: 6,
    color: txt, fontSize: 12, padding: '7px 10px', fontFamily: 'inherit',
    outline: 'none', width: '100%', boxSizing: 'border-box',
  }
  const labelStyle: React.CSSProperties = {
    fontSize: 10, fontWeight: 700, color: txtVD, letterSpacing: '.4px', marginBottom: 3, display: 'block',
  }
  const abaStyle = (active: boolean): React.CSSProperties => ({
    padding: '7px 16px', border: 'none', cursor: 'pointer', fontFamily: 'inherit',
    fontSize: 11, fontWeight: 700, background: 'none',
    color: active ? txt : txtVD,
    borderBottom: active ? '2px solid #3b82f6' : '2px solid transparent',
    transition: 'color .15s',
  })

  function addAtributo() { setAtributos(a => [...a, { nome: '', valor: '' }]) }
  function removeAtributo(i: number) { setAtributos(a => a.filter((_, j) => j !== i)) }
  function updateAtributo(i: number, field: 'nome'|'valor', val: string) {
    setAtributos(a => a.map((x, j) => j === i ? { ...x, [field]: val } : x))
  }

  function addVariacao() {
    if (!newVarNome.trim()) return
    const vals = newVarValor.split(',').map(v => v.trim()).filter(Boolean)
    if (!vals.length) return
    setVariacoes(v => [...v, { nome: newVarNome.trim(), valores: vals }])
    setNewVarNome(''); setNewVarValor('')
  }
  function removeVariacao(i: number) {
    setVariacoes(v => v.filter((_, j) => j !== i))
  }

  // ── Salvar ────────────────────────────────────────────────
  async function handleSave() {
    setError(''); setSaving(true)
    try {
      if (tabId === 'produtos') {
        if (!sku || !categoria || !marca || !modelo) {
          setError('SKU, Categoria, Marca e Modelo são obrigatórios.'); setSaving(false); return
        }
        const attrsJson = JSON.stringify(
          atributos.filter(a => a.nome && a.valor).reduce((acc, a) => ({ ...acc, [a.nome]: a.valor }), {})
        )
        if (variacoes.length > 0) {
          // Salva uma linha por variação
          const rows = varRows.map(vr => {
            const varObj: Record<string, string> = {}
            variacoes.forEach(v => { varObj[v.nome] = vr[v.nome] || '' })
            return {
              sku: vr.codigo || sku,
              category: categoria, brand: marca, model: modelo,
              line: linha, version: versao, serie, origin: origem,
              gtin, spu, skc,
              attributes: attrsJson,
              variations: JSON.stringify(varObj),
            }
          })
          if (editRow) {
            await supabase.from('products').update(rows[0]).eq('sku', String(editRow.sku))
          } else {
            await supabase.from('products').insert(rows)
          }
        } else {
          const row = {
            sku, category: categoria, brand: marca, model: modelo,
            line: linha, version: versao, serie, origin: origem,
            gtin, spu, skc, attributes: attrsJson, variations: null,
          }
          if (editRow) {
            await supabase.from('products').update(row).eq('sku', String(editRow.sku))
          } else {
            await supabase.from('products').insert([row])
          }
        }
      } else if (tabId === 'marcas') {
        if (!brandName) { setError('Nome da marca é obrigatório.'); setSaving(false); return }
        const row = {
          brand: brandName, brand_url: brandUrl, brand_instagram: brandInsta,
          brand_facebook: brandFb, brand_youtube: brandYt, brand_tiktok: brandTt,
          country: brandCountry,
        }
        if (editRow) {
          await supabase.from('brands').update(row).eq('id', editRow.id)
        } else {
          await supabase.from('brands').insert([row])
        }
      } else if (tabId === 'categorias') {
        if (!catName) { setError('Nome da categoria é obrigatório.'); setSaving(false); return }
        const row = {
          category: catName, mercadolibre_category_id: catMl,
          shopee_category_id: catShopee, amazon_category_id: catAmazon,
          magazineluiza_category_id: catMagalu,
        }
        if (editRow) {
          await supabase.from('categories').update(row).eq('id', editRow.id)
        } else {
          await supabase.from('categories').insert([row])
        }
      } else if (tabId === 'fornecedores') {
        if (!supName) { setError('Nome do fornecedor é obrigatório.'); setSaving(false); return }
        if (editRow) {
          await supabase.from('suppliers').update({ supplier: supName }).eq('id', editRow.id)
        } else {
          await supabase.from('suppliers').insert([{ supplier: supName }])
        }
      }
      onSaved()
      onClose()
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Erro ao salvar')
    } finally {
      setSaving(false)
    }
  }

  const TITLES: Record<TabId, string> = {
    produtos: 'Produto', categorias: 'Categoria', marcas: 'Marca', fornecedores: 'Fornecedor',
  }

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 10001,
      background: 'rgba(0,0,0,.75)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
    }} onClick={e => { if (e.target === e.currentTarget) onClose() }}>
      <div style={{
        width: tabId === 'produtos' ? 'min(760px, 95vw)' : 'min(480px, 95vw)',
        maxHeight: '90vh', background: hbg, border: `1px solid ${brd}`,
        borderRadius: 12, display: 'flex', flexDirection: 'column',
        boxShadow: '0 20px 60px rgba(0,0,0,.8)',
      }}>
        {/* Header */}
        <div style={{ padding: '12px 20px', borderBottom: `1px solid ${brd}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexShrink: 0 }}>
          <span style={{ fontSize: 13, fontWeight: 800, color: txt }}>
            {editRow ? '✏️ Editar' : '➕ Cadastrar'} {TITLES[tabId]}
          </span>
          <button onClick={onClose} style={{ background: 'none', border: 'none', color: txtD, cursor: 'pointer', fontSize: 20 }}>✕</button>
        </div>

        {/* Abas — só para produtos */}
        {tabId === 'produtos' && (
          <div style={{ display: 'flex', borderBottom: `1px solid ${brd}`, flexShrink: 0 }}>
            <button style={abaStyle(aba === 'ident')} onClick={() => setAba('ident')}>IDENTIFICAÇÃO</button>
            <button style={abaStyle(aba === 'attrs')} onClick={() => setAba('attrs')}>ATRIBUTOS</button>
            <button style={abaStyle(aba === 'vars')}  onClick={() => setAba('vars')}>VARIAÇÕES</button>
          </div>
        )}

        {/* Conteúdo */}
        <div style={{ overflowY: 'auto', flex: 1, padding: 20 }}>

          {/* ── PRODUTO: IDENTIFICAÇÃO ── */}
          {tabId === 'produtos' && aba === 'ident' && (
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <div>
                <label style={labelStyle}>SKU *</label>
                <input style={inputStyle} value={sku} onChange={e => setSku(e.target.value)} placeholder="Ex: PROD-001" />
              </div>
              <div>
                <label style={labelStyle}>CATEGORIA *</label>
                <select style={inputStyle} value={categoria} onChange={e => setCategoria(e.target.value)}>
                  <option value="">Selecione...</option>
                  {categorias.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              <div>
                <label style={labelStyle}>MARCA *</label>
                <select style={inputStyle} value={marca} onChange={e => setMarca(e.target.value)}>
                  <option value="">Selecione...</option>
                  {marcas.map(m => <option key={m} value={m}>{m}</option>)}
                </select>
              </div>
              <div>
                <label style={labelStyle}>MODELO *</label>
                <input style={inputStyle} value={modelo} onChange={e => setModelo(e.target.value)} placeholder="Ex: Galaxy S24" />
              </div>
              <div>
                <label style={labelStyle}>LINHA</label>
                <input style={inputStyle} value={linha} onChange={e => setLinha(e.target.value)} />
              </div>
              <div>
                <label style={labelStyle}>VERSÃO</label>
                <input style={inputStyle} value={versao} onChange={e => setVersao(e.target.value)} />
              </div>
              <div>
                <label style={labelStyle}>SÉRIE</label>
                <input style={inputStyle} value={serie} onChange={e => setSerie(e.target.value)} />
              </div>
              <div>
                <label style={labelStyle}>ORIGEM</label>
                <select style={inputStyle} value={origem} onChange={e => setOrigem(e.target.value)}>
                  <option value="">Selecione...</option>
                  <option value="Nacional">Nacional</option>
                  <option value="Importado">Importado</option>
                </select>
              </div>
              <div>
                <label style={labelStyle}>GTIN / EAN</label>
                <input style={inputStyle} value={gtin} onChange={e => setGtin(e.target.value)} />
              </div>
              <div>
                <label style={labelStyle}>SPU</label>
                <input style={inputStyle} value={spu} onChange={e => setSpu(e.target.value)} />
              </div>
              <div>
                <label style={labelStyle}>SKC</label>
                <input style={inputStyle} value={skc} onChange={e => setSkc(e.target.value)} />
              </div>
            </div>
          )}

          {/* ── PRODUTO: ATRIBUTOS ── */}
          {tabId === 'produtos' && aba === 'attrs' && (
            <div>
              <div style={{ fontSize: 11, color: txtVD, marginBottom: 12 }}>
                Características fixas do produto (voltagem, material, peso, etc). Salvo em JSON.
              </div>
              {atributos.map((a, i) => (
                <div key={i} style={{ display: 'flex', gap: 8, marginBottom: 8, alignItems: 'center' }}>
                  <input
                    style={{ ...inputStyle, flex: 1 }}
                    placeholder="Nome (ex: Voltagem)"
                    value={a.nome} onChange={e => updateAtributo(i, 'nome', e.target.value)}
                  />
                  <input
                    style={{ ...inputStyle, flex: 1 }}
                    placeholder="Valor (ex: 110V/220V)"
                    value={a.valor} onChange={e => updateAtributo(i, 'valor', e.target.value)}
                  />
                  <button onClick={() => removeAtributo(i)} style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer', fontSize: 16, flexShrink: 0 }}>✕</button>
                </div>
              ))}
              <button onClick={addAtributo} style={{ background: 'none', border: `1px dashed ${brd}`, borderRadius: 6, color: txtM, cursor: 'pointer', fontSize: 11, padding: '7px 14px', fontFamily: 'inherit', width: '100%', marginTop: 4 }}>
                + Adicionar atributo
              </button>
            </div>
          )}

          {/* ── PRODUTO: VARIAÇÕES ── */}
          {tabId === 'produtos' && aba === 'vars' && (
            <div>
              <div style={{ fontSize: 11, color: txtVD, marginBottom: 12 }}>
                Defina os atributos variáveis. O sistema gera automaticamente todas as combinações.
              </div>

              {/* Variações cadastradas */}
              {variacoes.map((v, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8, padding: '8px 12px', background: isDark ? '#0f172a' : '#f8fafc', borderRadius: 8, border: `1px solid ${brd}` }}>
                  <span style={{ fontSize: 12, fontWeight: 700, color: txt, minWidth: 80 }}>{v.nome}</span>
                  <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap', flex: 1 }}>
                    {v.valores.map(val => (
                      <span key={val} style={{ background: '#1e3a8a', color: '#93c5fd', borderRadius: 20, padding: '2px 10px', fontSize: 11, fontWeight: 600 }}>
                        {val} <span style={{ cursor: 'pointer', marginLeft: 4 }} onClick={() => {
                          const newVals = v.valores.filter(x => x !== val)
                          if (newVals.length === 0) removeVariacao(i)
                          else setVariacoes(vars => vars.map((x, j) => j === i ? { ...x, valores: newVals } : x))
                        }}>×</span>
                      </span>
                    ))}
                  </div>
                  <button onClick={() => removeVariacao(i)} style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer', fontSize: 14 }}>✕</button>
                </div>
              ))}

              {/* Adicionar nova variação */}
              <div style={{ display: 'flex', gap: 8, marginBottom: 16, alignItems: 'flex-end' }}>
                <div style={{ flex: 1 }}>
                  <label style={labelStyle}>NOME DA VARIAÇÃO</label>
                  <input style={inputStyle} placeholder="Ex: Cor" value={newVarNome} onChange={e => setNewVarNome(e.target.value)} />
                </div>
                <div style={{ flex: 2 }}>
                  <label style={labelStyle}>VALORES (separados por vírgula)</label>
                  <input style={inputStyle} placeholder="Ex: Azul, Branco, Preto" value={newVarValor} onChange={e => setNewVarValor(e.target.value)}
                    onKeyDown={e => { if (e.key === 'Enter') addVariacao() }} />
                </div>
                <button onClick={addVariacao} style={{ background: '#1e3a8a', border: 'none', borderRadius: 6, color: '#fff', cursor: 'pointer', fontSize: 12, padding: '8px 14px', fontFamily: 'inherit', fontWeight: 700, flexShrink: 0 }}>
                  + Adicionar
                </button>
              </div>

              {/* Tabela de combinações */}
              {varRows.length > 0 && (
                <div>
                  <div style={{ fontSize: 11, fontWeight: 700, color: txt, marginBottom: 8 }}>
                    {varRows.length} combinações geradas
                  </div>
                  <div style={{ overflowX: 'auto' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 11 }}>
                      <thead>
                        <tr>
                          <th style={{ padding: '6px 8px', background: isDark ? '#1e3a8a' : '#1e3a8a', color: '#fff', textAlign: 'left', fontWeight: 700, fontSize: 10 }}>#</th>
                          {variacoes.map(v => (
                            <th key={v.nome} style={{ padding: '6px 8px', background: '#1e3a8a', color: '#fff', textAlign: 'left', fontWeight: 700, fontSize: 10 }}>{v.nome.toUpperCase()}</th>
                          ))}
                          <th style={{ padding: '6px 8px', background: '#1e3a8a', color: '#fff', textAlign: 'left', fontWeight: 700, fontSize: 10 }}>CÓDIGO</th>
                          <th style={{ padding: '6px 8px', background: '#1e3a8a', color: '#fff', textAlign: 'left', fontWeight: 700, fontSize: 10 }}>PREÇO</th>
                        </tr>
                      </thead>
                      <tbody>
                        {varRows.map((row, i) => (
                          <tr key={i} style={{ background: i % 2 === 0 ? (isDark ? '#111827' : '#fff') : (isDark ? '#1a2234' : '#f8fafc') }}>
                            <td style={{ padding: '5px 8px', color: txtD, borderBottom: `1px solid ${brd}` }}>{i + 1}</td>
                            {variacoes.map(v => (
                              <td key={v.nome} style={{ padding: '5px 8px', color: txt, borderBottom: `1px solid ${brd}`, fontWeight: 600 }}>
                                {row[v.nome]}
                              </td>
                            ))}
                            <td style={{ padding: '3px 6px', borderBottom: `1px solid ${brd}` }}>
                              <input
                                style={{ ...inputStyle, padding: '4px 8px', width: 90 }}
                                placeholder="SKU-001"
                                value={row.codigo}
                                onChange={e => setVarRows(rows => rows.map((r, j) => j === i ? { ...r, codigo: e.target.value } : r))}
                              />
                            </td>
                            <td style={{ padding: '3px 6px', borderBottom: `1px solid ${brd}` }}>
                              <input
                                style={{ ...inputStyle, padding: '4px 8px', width: 90 }}
                                placeholder="0,00"
                                value={row.preco}
                                onChange={e => setVarRows(rows => rows.map((r, j) => j === i ? { ...r, preco: e.target.value } : r))}
                              />
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ── MARCA ── */}
          {tabId === 'marcas' && (
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <div style={{ gridColumn: '1 / -1' }}>
                <label style={labelStyle}>MARCA *</label>
                <input style={inputStyle} value={brandName} onChange={e => setBrandName(e.target.value)} placeholder="Ex: Samsung" />
              </div>
              <div>
                <label style={labelStyle}>PAÍS</label>
                <input style={inputStyle} value={brandCountry} onChange={e => setBrandCountry(e.target.value)} placeholder="Ex: Coreia do Sul" />
              </div>
              <div>
                <label style={labelStyle}>SITE</label>
                <input style={inputStyle} value={brandUrl} onChange={e => setBrandUrl(e.target.value)} placeholder="https://..." />
              </div>
              <div>
                <label style={labelStyle}>INSTAGRAM</label>
                <input style={inputStyle} value={brandInsta} onChange={e => setBrandInsta(e.target.value)} placeholder="@marca" />
              </div>
              <div>
                <label style={labelStyle}>FACEBOOK</label>
                <input style={inputStyle} value={brandFb} onChange={e => setBrandFb(e.target.value)} />
              </div>
              <div>
                <label style={labelStyle}>YOUTUBE</label>
                <input style={inputStyle} value={brandYt} onChange={e => setBrandYt(e.target.value)} />
              </div>
              <div>
                <label style={labelStyle}>TIKTOK</label>
                <input style={inputStyle} value={brandTt} onChange={e => setBrandTt(e.target.value)} />
              </div>
            </div>
          )}

          {/* ── CATEGORIA ── */}
          {tabId === 'categorias' && (
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <div style={{ gridColumn: '1 / -1' }}>
                <label style={labelStyle}>CATEGORIA *</label>
                <input style={inputStyle} value={catName} onChange={e => setCatName(e.target.value)} placeholder="Ex: Smartphones" />
              </div>
              <div>
                <label style={labelStyle}>ID MERCADO LIVRE</label>
                <input style={inputStyle} value={catMl} onChange={e => setCatMl(e.target.value)} />
              </div>
              <div>
                <label style={labelStyle}>ID SHOPEE</label>
                <input style={inputStyle} value={catShopee} onChange={e => setCatShopee(e.target.value)} />
              </div>
              <div>
                <label style={labelStyle}>ID AMAZON</label>
                <input style={inputStyle} value={catAmazon} onChange={e => setCatAmazon(e.target.value)} />
              </div>
              <div>
                <label style={labelStyle}>ID MAGAZINE LUIZA</label>
                <input style={inputStyle} value={catMagalu} onChange={e => setCatMagalu(e.target.value)} />
              </div>
            </div>
          )}

          {/* ── FORNECEDOR ── */}
          {tabId === 'fornecedores' && (
            <div>
              <label style={labelStyle}>FORNECEDOR *</label>
              <input style={inputStyle} value={supName} onChange={e => setSupName(e.target.value)} placeholder="Nome do fornecedor" />
            </div>
          )}

          {/* Erro */}
          {error && (
            <div style={{ marginTop: 12, padding: '8px 12px', background: 'rgba(239,68,68,.1)', border: '1px solid rgba(239,68,68,.3)', borderRadius: 6, color: '#f87171', fontSize: 11 }}>
              ❌ {error}
            </div>
          )}
        </div>

        {/* Footer */}
        <div style={{ padding: '12px 20px', borderTop: `1px solid ${brd}`, display: 'flex', justifyContent: 'flex-end', gap: 8, flexShrink: 0 }}>
          <button onClick={onClose} style={{ background: 'none', border: `1px solid ${brd}`, borderRadius: 7, color: txtM, cursor: 'pointer', fontSize: 12, padding: '8px 20px', fontFamily: 'inherit', fontWeight: 600 }}>
            Cancelar
          </button>
          <button onClick={handleSave} disabled={saving} style={{ background: '#1e3a8a', border: 'none', borderRadius: 7, color: '#fff', cursor: saving ? 'not-allowed' : 'pointer', fontSize: 12, padding: '8px 24px', fontFamily: 'inherit', fontWeight: 700, opacity: saving ? .7 : 1 }}>
            {saving ? 'Salvando...' : editRow ? '✓ Salvar alterações' : '✓ Cadastrar'}
          </button>
        </div>
      </div>
    </div>
  )
}
