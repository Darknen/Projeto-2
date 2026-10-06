import './FornecedorEditar.css'
import { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { formatName } from '../../utils/text.js'

const API = 'https://api.sossecurity.com.br/api'
const vazio={condominio_id:'',cnpj:'',razao_social:'',nome_fantasia:'',contato:'',telefone:'',email:'',cep:'',logradouro:'',numero:'',complemento:'',bairro:'',cidade:'',uf:''}
const nums=v=>(v||'').replace(/\D/g,'')
const fmtCnpj=v=>nums(v).slice(0,14).replace(/^(\d{2})(\d)/,'$1.$2').replace(/^(\d{2})\.(\d{3})(\d)/,'$1.$2.$3').replace(/\.(\d{3})(\d)/,'.$1/$2').replace(/(\d{4})(\d)/,'$1-$2')
const fmtCep=v=>nums(v).slice(0,8).replace(/^(\d{5})(\d)/,'$1-$2')

function FornecedorEditar(){
 const {id}=useParams(),navigate=useNavigate()
 const [form,setForm]=useState(vazio),[condominios,setCondominios]=useState([]),[erro,setErro]=useState(''),[status,setStatus]=useState(''),[salvando,setSalvando]=useState(false)

 useEffect(()=>{(async()=>{try{
  const [rf,rc]=await Promise.all([fetch(`${API}/fornecedores.php?id=${id}`),fetch(`${API}/condominios.php`)])
  const [f,c]=await Promise.all([rf.json(),rc.json()])
  if(!rf.ok)throw new Error(f.erro||'Fornecedor não encontrado.')
  if(!rc.ok)throw new Error(c.erro||'Não foi possível carregar os condomínios.')
  setForm({...vazio,...f.dados,condominio_id:String(f.dados.condominio_id),cnpj:fmtCnpj(f.dados.cnpj),cep:fmtCep(f.dados.cep)})
  setCondominios((c.dados||[]).filter(x=>Number(x.ativo)===1))
 }catch(e){setErro(e.message)}})()},[id])

 async function buscarCnpj(){
  const cnpj=nums(form.cnpj);if(cnpj.length!==14){setStatus('Informe um CNPJ com 14 dígitos.');return}
  setStatus('Consultando CNPJ...')
  try{
   const r=await fetch(`https://brasilapi.com.br/api/cnpj/v1/${cnpj}`)
   if(!r.ok)throw new Error()
   const d=await r.json()
   setForm(a=>({...a,cnpj:fmtCnpj(d.cnpj||cnpj),razao_social:d.razao_social||a.razao_social,nome_fantasia:d.nome_fantasia||a.nome_fantasia,telefone:d.ddd_telefone_1||d.ddd_telefone_2||a.telefone,email:d.email||a.email,cep:fmtCep(d.cep||a.cep),logradouro:d.logradouro||a.logradouro,numero:d.numero||a.numero,complemento:d.complemento||a.complemento,bairro:d.bairro||a.bairro,cidade:d.municipio||a.cidade,uf:d.uf||a.uf}))
   setStatus('Dados preenchidos pela BrasilAPI.')
  }catch{setStatus('CNPJ não encontrado ou serviço indisponível.')}
 }

 async function buscarCep(){
  const cep=nums(form.cep);if(cep.length!==8)return
  try{
   const r=await fetch(`https://viacep.com.br/ws/${cep}/json/`);const d=await r.json()
   if(!r.ok||d.erro)throw new Error()
   setForm(a=>({...a,cep:fmtCep(cep),logradouro:d.logradouro||a.logradouro,bairro:d.bairro||a.bairro,cidade:d.localidade||a.cidade,uf:d.uf||a.uf}))
  }catch{setStatus('CEP não encontrado.')}
 }

 async function salvar(e){
  e.preventDefault();setSalvando(true);setErro('')
  try{
   const r=await fetch(`${API}/fornecedores.php?id=${id}`,{method:'PUT',headers:{'Content-Type':'application/json'},body:JSON.stringify({...form,condominio_id:Number(form.condominio_id)})})
   const d=await r.json().catch(()=>({}));if(!r.ok)throw new Error(d.erro||'Não foi possível salvar.')
   navigate('/fornecedores')
  }catch(e){setErro(e.message)}finally{setSalvando(false)}
 }

 return <main className="condominios-page">
  <div className="page-header"><div><h2>Editar fornecedor</h2><p>Atualize os dados do fornecedor.</p></div><Link className="btn-secondary" to="/fornecedores">Voltar</Link></div>
  {erro&&<div className="alert error">{erro}</div>}
  <form className="details-card funcionario-form" onSubmit={salvar}><div className="mini-grid">
   <label>Condomínio *<select required value={form.condominio_id} onChange={e=>setForm({...form,condominio_id:e.target.value})}><option value="">Selecione</option>{condominios.map(c=><option key={c.id} value={c.id}>{formatName(c.nome_fantasia||c.razao_social)}</option>)}</select></label>
   <label>CNPJ *<input required value={form.cnpj} onChange={e=>{setForm({...form,cnpj:fmtCnpj(e.target.value)});setStatus('')}} onBlur={buscarCnpj}/></label>
   <label className="wide">Razão social *<input required value={form.razao_social} onChange={e=>setForm({...form,razao_social:e.target.value})}/></label>
   <label className="wide">Nome fantasia<input value={form.nome_fantasia||''} onChange={e=>setForm({...form,nome_fantasia:e.target.value})}/></label>
   <label>Contato<input value={form.contato||''} onChange={e=>setForm({...form,contato:e.target.value})}/></label>
   <label>Telefone<input value={form.telefone||''} onChange={e=>setForm({...form,telefone:e.target.value})}/></label>
   <label className="wide">E-mail<input type="email" value={form.email||''} onChange={e=>setForm({...form,email:e.target.value})}/></label>
   <label>CEP<input value={form.cep||''} onChange={e=>setForm({...form,cep:fmtCep(e.target.value)})} onBlur={buscarCep}/></label>
   <label className="wide">Logradouro<input value={form.logradouro||''} onChange={e=>setForm({...form,logradouro:e.target.value})}/></label>
   <label>Número<input value={form.numero||''} onChange={e=>setForm({...form,numero:e.target.value})}/></label>
   <label>Complemento<input value={form.complemento||''} onChange={e=>setForm({...form,complemento:e.target.value})}/></label>
   <label>Bairro<input value={form.bairro||''} onChange={e=>setForm({...form,bairro:e.target.value})}/></label>
   <label>Cidade<input value={form.cidade||''} onChange={e=>setForm({...form,cidade:e.target.value})}/></label>
   <label>UF<input maxLength="2" value={form.uf||''} onChange={e=>setForm({...form,uf:e.target.value.toUpperCase()})}/></label>
  </div>{status&&<p className="form-hint">{status}</p>}<div className="form-actions"><Link className="btn-secondary" to="/fornecedores">Cancelar</Link><button className="btn-primary" disabled={salvando}>{salvando?'Salvando...':'Salvar alterações'}</button></div></form>
 </main>
}
export default FornecedorEditar
