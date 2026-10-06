import './FuncionariosInativos.css'
import { useCallback, useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { formatName } from '../../utils/text.js'
const API = 'https://api.sossecurity.com.br/api'
function FuncionariosInativos(){
 const [lista,setLista]=useState([]),[q,setQ]=useState(''),[erro,setErro]=useState(''),[carregando,setCarregando]=useState(true)
 const carregar=useCallback(async(busca='')=>{setCarregando(true);setErro('');try{const r=await fetch(`${API}/funcionarios.php?status=inativo${busca?`&q=${encodeURIComponent(busca)}`:''}`);const d=await r.json();if(!r.ok)throw new Error(d.erro);setLista(d.dados||[])}catch(e){setErro(e.message||'Não foi possível carregar os funcionários inativos.')}finally{setCarregando(false)}},[])
 useEffect(()=>{carregar()},[carregar])
 async function reativar(f){if(!window.confirm(`Reativar ${f.nome}?`))return;try{const r=await fetch(`${API}/funcionarios.php?id=${f.id}`,{method:'PATCH',headers:{'Content-Type':'application/json'},body:JSON.stringify({ativo:1})});const d=await r.json();if(!r.ok)throw new Error(d.erro);carregar(q)}catch(e){setErro(e.message)}}
 return <main className="condominios-page"><div className="page-header"><div><h2>Funcionários inativos</h2><p>Funcionários inativados no sistema.</p></div><Link className="btn-voltar-funcionarios" to="/funcionarios">Voltar para funcionários</Link></div>
 <form className="search-bar" onSubmit={e=>{e.preventDefault();carregar(q.trim())}}><input value={q} onChange={e=>setQ(e.target.value)} placeholder="Buscar funcionário inativo"/><button className="btn-secondary">Buscar</button>{q&&<button type="button" className="btn-link" onClick={()=>{setQ('');carregar()}}>Limpar</button>}</form>
 {erro&&<div className="alert error">{erro}</div>}{carregando&&<p>Carregando funcionários...</p>}
 {!carregando&&!erro&&<div className="table-container"><table className="data-table funcionarios-inativos-table"><thead><tr><th>Nome</th><th>Condomínio</th><th>CPF</th><th>Cargo</th><th>Telefone</th><th>Ações</th></tr></thead><tbody>{lista.map(f=><tr key={f.id}><td><strong>{formatName(f.nome)}</strong></td><td>{formatName(f.condominio_nome)}</td><td>{f.cpf}</td><td>{formatName(f.cargo)}</td><td>{f.telefone||'-'}</td><td><div className="table-actions"><button className="btn-reactivate" title="Reativar" aria-label="Reativar funcionário" onClick={()=>reativar(f)}><i className="fa-solid fa-rotate-left"></i> Reativar</button></div></td></tr>)}</tbody></table>{!lista.length&&<div className="empty-row">Nenhum funcionário inativo encontrado.</div>}</div>}
 </main>
}
export default FuncionariosInativos
