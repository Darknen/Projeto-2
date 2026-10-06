import './FuncionarioEditar.css'
import { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { formatName } from '../../utils/text.js'
const API = 'https://api.sossecurity.com.br/api'
function FuncionarioEditar(){
 const {id}=useParams(),navigate=useNavigate(); const [f,setF]=useState(null),[erro,setErro]=useState('')
 useEffect(()=>{fetch(`${API}/funcionarios.php?id=${id}`).then(async r=>{const d=await r.json();if(!r.ok)throw new Error(d.erro);setF(d.dados)}).catch(e=>setErro(e.message))},[id])
 async function buscarCep(){
  const cep=(f?.cep||'').replace(/\D/g,'')
  if(cep.length!==8)return
  setErro('')
  try{
   const r=await fetch(`https://viacep.com.br/ws/${cep}/json/`)
   const d=await r.json()
   if(!r.ok||d.erro)throw new Error('CEP não encontrado.')
   setF(prev=>({...prev,cep:`${cep.slice(0,5)}-${cep.slice(5)}`,logradouro:d.logradouro||'',bairro:d.bairro||'',cidade:d.localidade||'',uf:d.uf||''}))
  }catch(e){setErro(e.message||'Não foi possível consultar o CEP.')}
 }
 async function salvar(e){e.preventDefault();setErro('');try{const r=await fetch(`${API}/funcionarios.php?id=${id}`,{method:'PUT',headers:{'Content-Type':'application/json'},body:JSON.stringify(f)});const d=await r.json();if(!r.ok)throw new Error(d.erro);navigate('/funcionarios')}catch(e){setErro(e.message)}}
 if(erro&&!f)return <main><p>{erro}</p></main>; if(!f)return <main><p>Carregando...</p></main>
 return <main className="condominios-page"><div className="page-header"><div><h2>Editar funcionário</h2><p>{formatName(f.condominio_nome)}</p></div><Link className="btn-secondary" to="/funcionarios">Voltar</Link></div>{erro&&<div className="alert error">{erro}</div>}<form className="details-card" onSubmit={salvar}><div className="mini-grid"><label className="wide">Nome completo *<input required value={f.nome||''} onChange={e=>setF({...f,nome:e.target.value})}/></label><label>CPF *<input required value={f.cpf||''} onChange={e=>setF({...f,cpf:e.target.value})}/></label><label>Cargo *<input required value={f.cargo||''} onChange={e=>setF({...f,cargo:e.target.value})}/></label><label>Data de admissão<input type="date" value={f.data_admissao||''} onChange={e=>setF({...f,data_admissao:e.target.value})}/></label><label>Telefone<input value={f.telefone||''} onChange={e=>setF({...f,telefone:e.target.value})}/></label><label className="wide">E-mail<input type="email" value={f.email||''} onChange={e=>setF({...f,email:e.target.value})}/></label><label>CEP<input value={f.cep||''} maxLength="9" placeholder="00000-000" onChange={e=>{const n=e.target.value.replace(/\D/g,'').slice(0,8);setF({...f,cep:n.length>5?`${n.slice(0,5)}-${n.slice(5)}`:n})}} onBlur={buscarCep}/></label><label className="wide">Logradouro<input value={f.logradouro||''} onChange={e=>setF({...f,logradouro:e.target.value})}/></label><label>Número<input value={f.numero||''} onChange={e=>setF({...f,numero:e.target.value})}/></label><label>Complemento<input value={f.complemento||''} onChange={e=>setF({...f,complemento:e.target.value})}/></label><label>Bairro<input value={f.bairro||''} onChange={e=>setF({...f,bairro:e.target.value})}/></label><label>Cidade<input value={f.cidade||''} onChange={e=>setF({...f,cidade:e.target.value})}/></label><label>UF<input value={f.uf||''} maxLength="2" onChange={e=>setF({...f,uf:e.target.value.toUpperCase()})}/></label></div><div className="form-actions"><Link className="btn-secondary" to="/funcionarios">Cancelar</Link><button className="btn-primary">Salvar alterações</button></div></form></main>
}
export default FuncionarioEditar
