'use client'

import React, { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'

type TabId = 'produtos' | 'categorias' | 'marcas' | 'fornecedores'
interface Atributo { nome: string; valor: string }
interface Variacao { nome: string; valores: string[] }
interface VarRow { [key: string]: string }

interface Props {
  tabId: TabId
  editRow?: Record<string, unknown> | null
  isDark: boolean
  brd: string; txt: string; txtM: string; txtD: string; txtVD: string
  hbg: string; bg: string; inputBg: string
  onClose: () => void
  onSaved: () => void
}

function genCombos(vars: Variacao[]): Record<string,string>[] {
  if (!vars.length) return []
  let result: Record<string,string>[] = [{}]
  for (const v of vars) {
    const next: Record<string,string>[] = []
    for (const ex of result)
      for (const val of v.valores)
        next.push({ ...ex, [v.nome]: val })
    result = next
  }
  return result
}

// Converte objeto JSON de atributos → "Chave:Valor;Chave:Valor"
function attrsToStr(obj: Record<string,string>): string {
  return Object.entries(obj).map(([k,v]) => `${k}:${v}`).join(';')
}
// Converte "Chave:Valor;Chave:Valor" → array de Atributo
function strToAttrs(s: string): Atributo[] {
  if (!s) return [{ nome:'', valor:'' }]
  return s.split(';').map(p => {
    const [nome, ...rest] = p.split(':')
    return { nome: nome?.trim()||'', valor: rest.join(':').trim() }
  }).filter(a => a.nome)
}

export default function CadastroModal({ tabId, editRow, isDark, brd, txt, txtM, txtD, txtVD, hbg, bg, inputBg, onClose, onSaved }: Props) {
  const supabase = createClient()
  const [aba, setAba]       = useState<'ident'|'attrs'|'vars'>('ident')
  const [saving, setSaving] = useState(false)
  const [error, setError]   = useState('')

  // Dropdowns
  const [cats, setCats] = useState<string[]>([])
  const [brands, setBrands] = useState<string[]>([])

  // Produto
  const [sku,      setSku]      = useState('')
  const [cat,      setCat]      = useState('')
  const [brand,    setBrand]    = useState('')
  const [model,    setModel]    = useState('')
  const [line,     setLine]     = useState('')
  const [version,  setVersion]  = useState('')
  const [serie,    setSerie]    = useState('')
  const [origin,   setOrigin]   = useState('')
  const [gtin,     setGtin]     = useState('')
  const [spu,      setSpu]      = useState('')
  const [skc,      setSkc]      = useState('')
  const [attrs,    setAttrs]    = useState<Atributo[]>([{ nome:'', valor:'' }])
  const [vars,     setVars]     = useState<Variacao[]>([])
  const [varRows,  setVarRows]  = useState<VarRow[]>([])
  const [newVNome, setNewVNome] = useState('')
  const [newVVal,  setNewVVal]  = useState('')

  // Marca
  const [bName,    setBName]    = useState('')
  const [bUrl,     setBUrl]     = useState('')
  const [bInsta,   setBInsta]   = useState('')
  const [bFb,      setBFb]      = useState('')
  const [bYt,      setBYt]      = useState('')
  const [bTt,      setBTt]      = useState('')
  const [bCountry, setBCountry] = useState('')

  // Categoria
  const [cName,   setCName]   = useState('')
  const [cMl,     setCMl]     = useState('')
  const [cShopee, setCShopee] = useState('')
  const [cAmazon, setCAmazon] = useState('')
  const [cMagalu, setCMagalu] = useState('')

  // Fornecedor
  const [supName, setSupName] = useState('')

  // Carrega opções e dados de edição
  useEffect(() => {
    supabase.from('categories').select('category').order('category').then(({data}) =>
      setCats(data?.map(r => String(r.category)) || []))
    supabase.from('brands').select('brand').order('brand').then(({data}) =>
      setBrands(data?.map(r => String(r.brand)) || []))

    if (!editRow) return
    if (tabId === 'produtos') {
      setSku(String(editRow.sku||''))
      setCat(String(editRow.category||''))
      setBrand(String(editRow.brand||''))
      setModel(String(editRow.model||''))
      setLine(String(editRow.line||''))
      setVersion(String(editRow.version||''))
      setSerie(String(editRow.serie||''))
      setOrigin(String(editRow.origin||''))
      setGtin(String(editRow.gtin||''))
      setSpu(String(editRow.spu||''))
      setSkc(String(editRow.skc||''))

      // Carrega atributos: aceita JSON objeto ou string "Chave:Valor;..."
      const rawAttr = String(editRow.attributes||'')
      try {
        const parsed = JSON.parse(rawAttr)
        if (parsed && typeof parsed === 'object' && !Array.isArray(parsed)) {
          const arr = Object.entries(parsed as Record<string,string>).map(([nome,valor]) => ({nome, valor}))
          setAttrs(arr.length ? arr : [{nome:'',valor:''}])
        }
      } catch {
        setAttrs(strToAttrs(rawAttr))
      }

      // Carrega variações: o campo variations é uma string "NomeVar:Valor"
      // Cada linha é uma variação — reconstruímos o estado de vars a partir das linhas irmãs
      // Mas aqui temos só uma linha — mostramos a variação desta linha para editar
      const rawVar = String(editRow.variations||'')
      if (rawVar) {
        try {
          const vobj = JSON.parse(rawVar) as Record<string,string>
          const rebuilt = Object.entries(vobj).map(([nome, val]) => ({nome, valores:[val]}))
          setVars(rebuilt)
        } catch {}
      }
    } else if (tabId === 'marcas') {
      setBName(String(editRow.brand||''))
      setBUrl(String(editRow.brand_url||''))
      setBInsta(String(editRow.brand_instagram||''))
      setBFb(String(editRow.brand_facebook||''))
      setBYt(String(editRow.brand_youtube||''))
      setBTt(String(editRow.brand_tiktok||''))
      setBCountry(String(editRow.country||''))
    } else if (tabId === 'categorias') {
      setCName(String(editRow.category||''))
      setCMl(String(editRow.mercadolibre_category_id||''))
      setCShopee(String(editRow.shopee_category_id||''))
      setCAmazon(String(editRow.amazon_category_id||''))
      setCMagalu(String(editRow.magazineluiza_category_id||''))
    } else if (tabId === 'fornecedores') {
      setSupName(String(editRow.supplier||''))
    }
  }, [])

  // Recalcula varRows quando vars muda (só se não for edição)
  useEffect(() => {
    if (editRow) return // na edição não recalcula
    const combos = genCombos(vars)
    setVarRows(combos.map(c => ({ ...c, codigo:'', preco:'' })))
  }, [vars])

  const inp: React.CSSProperties = {
    background:inputBg, border:`1px solid ${brd}`, borderRadius:6,
    color:txt, fontSize:12, padding:'7px 10px', fontFamily:'inherit',
    outline:'none', width:'100%', boxSizing:'border-box',
  }
  const lbl: React.CSSProperties = {
    fontSize:10, fontWeight:700, color:txtVD, letterSpacing:'.4px', marginBottom:3, display:'block',
  }
  const abaBtn = (active: boolean): React.CSSProperties => ({
    padding:'7px 16px', border:'none', cursor:'pointer', fontFamily:'inherit',
    fontSize:11, fontWeight:700, background:'none',
    color: active ? txt : txtVD,
    borderBottom: active ? '2px solid #3b82f6' : '2px solid transparent',
  })

  function addVar() {
    if (!newVNome.trim()) return
    const vals = newVVal.split(',').map(v => v.trim()).filter(Boolean)
    if (!vals.length) return
    setVars(v => [...v, { nome: newVNome.trim(), valores: vals }])
    setNewVNome(''); setNewVVal('')
  }

  async function handleSave() {
    setError(''); setSaving(true)
    try {
      if (tabId === 'produtos') {
        if (!sku || !cat || !brand || !model) {
          setError('SKU, Categoria, Marca e Modelo são obrigatórios.')
          setSaving(false); return
        }
        // Atributos: salva como JSON objeto {"Chave":"Valor",...}
        const attrsJson = JSON.stringify(
          attrs.filter(a => a.nome && a.valor)
               .reduce((acc, a) => ({...acc, [a.nome]: a.valor}), {} as Record<string,string>)
        )
        const base = { category:cat, brand, model, line, version:version, serie, origin, gtin, spu, skc, attributes:attrsJson }

        if (vars.length > 0 && !editRow) {
          // Cadastro com variações: uma linha por combinação
          const rows = varRows.map(vr => ({
            ...base,
            sku: vr.codigo || sku,
            variations: JSON.stringify(
              vars.reduce((acc, v) => ({...acc, [v.nome]: vr[v.nome]||''}), {} as Record<string,string>)
            ),
          }))
          const { error: e } = await supabase.from('products').insert(rows)
          if (e) throw new Error(e.message)
        } else if (editRow) {
          // Edição: atualiza só esta linha
          const varJson = vars.length
            ? JSON.stringify(vars.reduce((acc, v) => ({...acc, [v.nome]: v.valores[0]||''}), {} as Record<string,string>))
            : null
          const { error: e } = await supabase.from('products').update({ ...base, sku, variations: varJson }).eq('sku', String(editRow.sku))
          if (e) throw new Error(e.message)
        } else {
          // Cadastro sem variações
          const { error: e } = await supabase.from('products').insert([{ ...base, sku, variations: null }])
          if (e) throw new Error(e.message)
        }
      } else if (tabId === 'marcas') {
        if (!bName) { setError('Nome da marca é obrigatório.'); setSaving(false); return }
        const row = { brand:bName, brand_url:bUrl, brand_instagram:bInsta, brand_facebook:bFb, brand_youtube:bYt, brand_tiktok:bTt, country:bCountry }
        const { error: e } = editRow
          ? await supabase.from('brands').update(row).eq('id', editRow.id)
          : await supabase.from('brands').insert([row])
        if (e) throw new Error(e.message)
      } else if (tabId === 'categorias') {
        if (!cName) { setError('Nome da categoria é obrigatório.'); setSaving(false); return }
        const row = { category:cName, mercadolibre_category_id:cMl, shopee_category_id:cShopee, amazon_category_id:cAmazon, magazineluiza_category_id:cMagalu }
        const { error: e } = editRow
          ? await supabase.from('categories').update(row).eq('id', editRow.id)
          : await supabase.from('categories').insert([row])
        if (e) throw new Error(e.message)
      } else if (tabId === 'fornecedores') {
        if (!supName) { setError('Nome do fornecedor é obrigatório.'); setSaving(false); return }
        const { error: e } = editRow
          ? await supabase.from('suppliers').update({ supplier: supName }).eq('id', editRow.id)
          : await supabase.from('suppliers').insert([{ supplier: supName }])
        if (e) throw new Error(e.message)
      }
      onSaved()
      onClose()
    } catch(e) {
      setError(e instanceof Error ? e.message : 'Erro ao salvar')
    } finally {
      setSaving(false)
    }
  }

  const TITLES: Record<TabId,string> = { produtos:'Produto', categorias:'Categoria', marcas:'Marca', fornecedores:'Fornecedor' }

  return (
    <div style={{ position:'fixed', inset:0, zIndex:10001, background:'rgba(0,0,0,.75)', display:'flex', alignItems:'center', justifyContent:'center' }}
      onClick={e => { if (e.target === e.currentTarget) onClose() }}>
      <div style={{ width: tabId==='produtos' ? 'min(760px,95vw)' : 'min(480px,95vw)', maxHeight:'90vh', background:hbg, border:`1px solid ${brd}`, borderRadius:12, display:'flex', flexDirection:'column', boxShadow:'0 20px 60px rgba(0,0,0,.8)' }}>

        {/* Header */}
        <div style={{ padding:'12px 20px', borderBottom:`1px solid ${brd}`, display:'flex', justifyContent:'space-between', alignItems:'center', flexShrink:0 }}>
          <span style={{ fontSize:13, fontWeight:800, color:txt }}>{editRow ? '✏️ Editar' : '➕ Cadastrar'} {TITLES[tabId]}</span>
          <button onClick={onClose} style={{ background:'none', border:'none', color:txtD, cursor:'pointer', fontSize:20 }}>✕</button>
        </div>

        {/* Abas (só produto) */}
        {tabId === 'produtos' && (
          <div style={{ display:'flex', borderBottom:`1px solid ${brd}`, flexShrink:0 }}>
            <button style={abaBtn(aba==='ident')} onClick={() => setAba('ident')}>IDENTIFICAÇÃO</button>
            <button style={abaBtn(aba==='attrs')} onClick={() => setAba('attrs')}>ATRIBUTOS</button>
            <button style={abaBtn(aba==='vars')}  onClick={() => setAba('vars')}>VARIAÇÕES {vars.length > 0 && `(${varRows.length})`}</button>
          </div>
        )}

        {/* Conteúdo */}
        <div style={{ overflowY:'auto', flex:1, padding:20 }}>

          {/* PRODUTO — IDENTIFICAÇÃO */}
          {tabId==='produtos' && aba==='ident' && (
            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:12 }}>
              <div><label style={lbl}>SKU *</label><input style={inp} value={sku} onChange={e=>setSku(e.target.value)} placeholder="Ex: PROD-001" /></div>
              <div><label style={lbl}>CATEGORIA *</label>
                <select style={inp} value={cat} onChange={e=>setCat(e.target.value)}>
                  <option value="">Selecione...</option>
                  {cats.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              <div><label style={lbl}>MARCA *</label>
                <select style={inp} value={brand} onChange={e=>setBrand(e.target.value)}>
                  <option value="">Selecione...</option>
                  {brands.map(b => <option key={b} value={b}>{b}</option>)}
                </select>
              </div>
              <div><label style={lbl}>MODELO *</label><input style={inp} value={model} onChange={e=>setModel(e.target.value)} /></div>
              <div><label style={lbl}>LINHA</label><input style={inp} value={line} onChange={e=>setLine(e.target.value)} /></div>
              <div><label style={lbl}>VERSÃO</label><input style={inp} value={version} onChange={e=>setVersion(e.target.value)} /></div>
              <div><label style={lbl}>SÉRIE</label><input style={inp} value={serie} onChange={e=>setSerie(e.target.value)} /></div>
              <div><label style={lbl}>ORIGEM</label>
                <select style={inp} value={origin} onChange={e=>setOrigin(e.target.value)}>
                  <option value="">Selecione...</option>
                  <option value="Nacional">Nacional</option>
                  <option value="Importado">Importado</option>
                </select>
              </div>
              <div><label style={lbl}>GTIN / EAN</label><input style={inp} value={gtin} onChange={e=>setGtin(e.target.value)} /></div>
              <div><label style={lbl}>SPU</label><input style={inp} value={spu} onChange={e=>setSpu(e.target.value)} /></div>
              <div><label style={lbl}>SKC</label><input style={inp} value={skc} onChange={e=>setSkc(e.target.value)} /></div>
            </div>
          )}

          {/* PRODUTO — ATRIBUTOS */}
          {tabId==='produtos' && aba==='attrs' && (
            <div>
              <div style={{ fontSize:11, color:txtVD, marginBottom:12 }}>
                Características fixas (voltagem, material, peso). Exibido como <strong style={{color:txtM}}>Chave:Valor;Chave:Valor</strong>
              </div>
              {attrs.map((a, i) => (
                <div key={i} style={{ display:'flex', gap:8, marginBottom:8, alignItems:'center' }}>
                  <input style={{...inp, flex:1}} placeholder="Chave (ex: Voltagem)" value={a.nome} onChange={e=>setAttrs(at=>at.map((x,j)=>j===i?{...x,nome:e.target.value}:x))} />
                  <span style={{ color:txtD, flexShrink:0 }}>:</span>
                  <input style={{...inp, flex:1}} placeholder="Valor (ex: 110V/220V)" value={a.valor} onChange={e=>setAttrs(at=>at.map((x,j)=>j===i?{...x,valor:e.target.value}:x))} />
                  <button onClick={()=>setAttrs(at=>at.filter((_,j)=>j!==i))} style={{ background:'none', border:'none', color:'#ef4444', cursor:'pointer', fontSize:16, flexShrink:0 }}>✕</button>
                </div>
              ))}
              <button onClick={()=>setAttrs(a=>[...a,{nome:'',valor:''}])} style={{ background:'none', border:`1px dashed ${brd}`, borderRadius:6, color:txtM, cursor:'pointer', fontSize:11, padding:'7px 14px', fontFamily:'inherit', width:'100%', marginTop:4 }}>
                + Adicionar atributo
              </button>
              {/* Preview */}
              {attrs.some(a=>a.nome&&a.valor) && (
                <div style={{ marginTop:12, padding:'8px 12px', background:isDark?'#0f172a':'#f8fafc', borderRadius:6, fontSize:11, color:txtM }}>
                  <span style={{ color:txtVD, marginRight:6 }}>Preview:</span>
                  {attrs.filter(a=>a.nome&&a.valor).map(a=>`${a.nome}:${a.valor}`).join(';')}
                </div>
              )}
            </div>
          )}

          {/* PRODUTO — VARIAÇÕES */}
          {tabId==='produtos' && aba==='vars' && (
            <div>
              <div style={{ fontSize:11, color:txtVD, marginBottom:12 }}>
                {editRow ? 'Editando variação desta linha específica.' : 'Cada combinação gera uma linha separada no banco.'}
              </div>
              {/* Variações definidas */}
              {vars.map((v, i) => (
                <div key={i} style={{ display:'flex', alignItems:'center', gap:8, marginBottom:8, padding:'8px 12px', background:isDark?'#0f172a':'#f8fafc', borderRadius:8, border:`1px solid ${brd}` }}>
                  <span style={{ fontSize:12, fontWeight:700, color:txt, minWidth:80 }}>{v.nome}</span>
                  <div style={{ display:'flex', gap:4, flexWrap:'wrap', flex:1 }}>
                    {v.valores.map(val => (
                      <span key={val} style={{ background:'#1e3a8a', color:'#93c5fd', borderRadius:20, padding:'2px 10px', fontSize:11, fontWeight:600 }}>
                        {val}
                        <span style={{ cursor:'pointer', marginLeft:4 }} onClick={()=>{
                          const newVals = v.valores.filter(x=>x!==val)
                          if (!newVals.length) setVars(vs=>vs.filter((_,j)=>j!==i))
                          else setVars(vs=>vs.map((x,j)=>j===i?{...x,valores:newVals}:x))
                        }}>×</span>
                      </span>
                    ))}
                  </div>
                  <button onClick={()=>setVars(vs=>vs.filter((_,j)=>j!==i))} style={{ background:'none', border:'none', color:'#ef4444', cursor:'pointer', fontSize:14 }}>✕</button>
                </div>
              ))}
              {/* Adicionar */}
              {!editRow && (
                <div style={{ display:'flex', gap:8, marginBottom:16, alignItems:'flex-end' }}>
                  <div style={{ flex:1 }}>
                    <label style={lbl}>NOME DA VARIAÇÃO</label>
                    <input style={inp} placeholder="Ex: Cor" value={newVNome} onChange={e=>setNewVNome(e.target.value)} />
                  </div>
                  <div style={{ flex:2 }}>
                    <label style={lbl}>VALORES (separados por vírgula)</label>
                    <input style={inp} placeholder="Ex: Azul, Branco, Preto" value={newVVal} onChange={e=>setNewVVal(e.target.value)} onKeyDown={e=>{if(e.key==='Enter')addVar()}} />
                  </div>
                  <button onClick={addVar} style={{ background:'#1e3a8a', border:'none', borderRadius:6, color:'#fff', cursor:'pointer', fontSize:12, padding:'8px 14px', fontFamily:'inherit', fontWeight:700, flexShrink:0 }}>+ Adicionar</button>
                </div>
              )}
              {/* Tabela de combinações */}
              {varRows.length > 0 && !editRow && (
                <div>
                  <div style={{ fontSize:11, fontWeight:700, color:txt, marginBottom:8 }}>{varRows.length} combinações — cada uma vira uma linha no banco</div>
                  <div style={{ overflowX:'auto' }}>
                    <table style={{ width:'100%', borderCollapse:'collapse', fontSize:11 }}>
                      <thead>
                        <tr>
                          <th style={{ padding:'6px 8px', background:'#1e3a8a', color:'#fff', textAlign:'left', fontSize:10, fontWeight:700 }}>#</th>
                          {vars.map(v => <th key={v.nome} style={{ padding:'6px 8px', background:'#1e3a8a', color:'#fff', textAlign:'left', fontSize:10, fontWeight:700 }}>{v.nome.toUpperCase()}</th>)}
                          <th style={{ padding:'6px 8px', background:'#1e3a8a', color:'#fff', textAlign:'left', fontSize:10, fontWeight:700 }}>CÓDIGO (SKU)</th>
                          <th style={{ padding:'6px 8px', background:'#1e3a8a', color:'#fff', textAlign:'left', fontSize:10, fontWeight:700 }}>PREÇO</th>
                        </tr>
                      </thead>
                      <tbody>
                        {varRows.map((row, i) => (
                          <tr key={i} style={{ background: i%2===0 ? (isDark?'#111827':'#fff') : (isDark?'#1a2234':'#f8fafc') }}>
                            <td style={{ padding:'5px 8px', color:txtD, borderBottom:`1px solid ${brd}` }}>{i+1}</td>
                            {vars.map(v => <td key={v.nome} style={{ padding:'5px 8px', color:txt, borderBottom:`1px solid ${brd}`, fontWeight:600 }}>{row[v.nome]}</td>)}
                            <td style={{ padding:'3px 6px', borderBottom:`1px solid ${brd}` }}>
                              <input style={{...inp, padding:'4px 8px', width:100}} placeholder={`${sku}-${String(i+1).padStart(2,'0')}`}
                                value={row.codigo||''} onChange={e=>setVarRows(rs=>rs.map((r,j)=>j===i?{...r,codigo:e.target.value}:r))} />
                            </td>
                            <td style={{ padding:'3px 6px', borderBottom:`1px solid ${brd}` }}>
                              <input style={{...inp, padding:'4px 8px', width:90}} placeholder="0,00"
                                value={row.preco||''} onChange={e=>setVarRows(rs=>rs.map((r,j)=>j===i?{...r,preco:e.target.value}:r))} />
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

          {/* MARCA */}
          {tabId==='marcas' && (
            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:12 }}>
              <div style={{ gridColumn:'1/-1' }}><label style={lbl}>MARCA *</label><input style={inp} value={bName} onChange={e=>setBName(e.target.value)} placeholder="Ex: Samsung" /></div>
              <div><label style={lbl}>PAÍS</label><input style={inp} value={bCountry} onChange={e=>setBCountry(e.target.value)} /></div>
              <div><label style={lbl}>SITE</label><input style={inp} value={bUrl} onChange={e=>setBUrl(e.target.value)} placeholder="https://..." /></div>
              <div><label style={lbl}>INSTAGRAM</label><input style={inp} value={bInsta} onChange={e=>setBInsta(e.target.value)} placeholder="@marca" /></div>
              <div><label style={lbl}>FACEBOOK</label><input style={inp} value={bFb} onChange={e=>setBFb(e.target.value)} /></div>
              <div><label style={lbl}>YOUTUBE</label><input style={inp} value={bYt} onChange={e=>setBYt(e.target.value)} /></div>
              <div><label style={lbl}>TIKTOK</label><input style={inp} value={bTt} onChange={e=>setBTt(e.target.value)} /></div>
            </div>
          )}

          {/* CATEGORIA */}
          {tabId==='categorias' && (
            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:12 }}>
              <div style={{ gridColumn:'1/-1' }}><label style={lbl}>CATEGORIA *</label><input style={inp} value={cName} onChange={e=>setCName(e.target.value)} placeholder="Ex: Smartphones" /></div>
              <div><label style={lbl}>ID MERCADO LIVRE</label><input style={inp} value={cMl} onChange={e=>setCMl(e.target.value)} /></div>
              <div><label style={lbl}>ID SHOPEE</label><input style={inp} value={cShopee} onChange={e=>setCShopee(e.target.value)} /></div>
              <div><label style={lbl}>ID AMAZON</label><input style={inp} value={cAmazon} onChange={e=>setCAmazon(e.target.value)} /></div>
              <div><label style={lbl}>ID MAGAZINE LUIZA</label><input style={inp} value={cMagalu} onChange={e=>setCMagalu(e.target.value)} /></div>
            </div>
          )}

          {/* FORNECEDOR */}
          {tabId==='fornecedores' && (
            <div><label style={lbl}>FORNECEDOR *</label><input style={inp} value={supName} onChange={e=>setSupName(e.target.value)} placeholder="Nome do fornecedor" /></div>
          )}

          {error && (
            <div style={{ marginTop:12, padding:'8px 12px', background:'rgba(239,68,68,.1)', border:'1px solid rgba(239,68,68,.3)', borderRadius:6, color:'#f87171', fontSize:11 }}>
              ❌ {error}
            </div>
          )}
        </div>

        {/* Footer */}
        <div style={{ padding:'12px 20px', borderTop:`1px solid ${brd}`, display:'flex', justifyContent:'flex-end', gap:8, flexShrink:0 }}>
          <button onClick={onClose} style={{ background:'none', border:`1px solid ${brd}`, borderRadius:7, color:txtM, cursor:'pointer', fontSize:12, padding:'8px 20px', fontFamily:'inherit', fontWeight:600 }}>Cancelar</button>
          <button onClick={handleSave} disabled={saving} style={{ background:'#1e3a8a', border:'none', borderRadius:7, color:'#fff', cursor:saving?'not-allowed':'pointer', fontSize:12, padding:'8px 24px', fontFamily:'inherit', fontWeight:700, opacity:saving?.7:1 }}>
            {saving ? 'Salvando...' : editRow ? '✓ Salvar alterações' : '✓ Cadastrar'}
          </button>
        </div>
      </div>
    </div>
  )
}
