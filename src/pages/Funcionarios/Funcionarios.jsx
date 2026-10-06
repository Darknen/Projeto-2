import './Funcionarios.css'
import { useCallback, useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { formatName } from '../../utils/text.js'
const API = 'https://api.sossecurity.com.br/api'
function Funcionarios(){
 const [lista,setLista]=useState([]),[q,setQ]=useState(''),[erro,setErro]=useState(''),[carregando,setCarregando]=useState(true)
 const carregar=useCallback(async(busca='')=>{setCarregando(true);setErro('');try{const r=await fetch(`${API}/funcionarios.php?status=ativo${busca?`&q=${encodeURIComponent(busca)}`:''}`);const d=await r.json();if(!r.ok)throw new Error(d.erro);setLista(d.dados||[])}catch(e){setErro(e.message||'Não foi possível carregar os funcionários.')}finally{setCarregando(false)}},[])
 useEffect(()=>{carregar()},[carregar])
 async function inativar(f){if(!window.confirm(`Inativar ${f.nome}?`))return;try{const r=await fetch(`${API}/funcionarios.php?id=${f.id}`,{method:'DELETE'});const d=await r.json();if(!r.ok)throw new Error(d.erro);carregar(q)}catch(e){setErro(e.message)}}
 return <main className="condominios-page"><div className="page-header"><div><h2>Funcionários</h2><p>Funcionários ativos de todos os condomínios.</p></div><Link className="btn-inativos" to="/funcionarios/inativos">Funcionários inativos</Link></div>
 <form className="search-bar" onSubmit={e=>{e.preventDefault();carregar(q.trim())}}><input value={q} onChange={e=>setQ(e.target.value)} placeholder="Buscar por nome, CPF, cargo ou condomínio"/><button className="btn-secondary">Buscar</button>{q&&<button type="button" className="btn-link" onClick={()=>{setQ('');carregar()}}>Limpar</button>}</form>
 {erro&&<div className="alert error">{erro}</div>}{carregando&&<p>Carregando funcionários...</p>}
 {!carregando&&!erro&&<div className="table-container"><table className="data-table funcionarios-table"><thead><tr><th>Nome</th><th>Condomínio</th><th>CPF</th><th>Cargo</th><th>Telefone</th><th>Admissão</th><th>Ações</th></tr></thead><tbody>{lista.map(f=><tr key={f.id}><td><strong>{formatName(f.nome)}</strong></td><td>{formatName(f.condominio_nome)}</td><td>{f.cpf}</td><td>{formatName(f.cargo)}</td><td>{f.telefone||'-'}</td><td>{f.data_admissao?f.data_admissao.split('-').reverse().join('/'):'-'}</td><td><div className="table-actions"><Link className="condo-action-btn condo-action-view" title="Visualizar" to={`/funcionarios/${f.id}`}><i className="fa-solid fa-eye"></i></Link><Link className="condo-action-btn condo-action-edit" title="Editar" to={`/funcionarios/${f.id}/editar`}><i className="fa-solid fa-pen"></i></Link><button className="condo-action-btn condo-action-disable" title="Inativar" onClick={()=>inativar(f)}><i className="fa-solid fa-power-off"></i></button></div></td></tr>)}</tbody></table>{!lista.length&&<div className="empty-row">Nenhum funcionário ativo encontrado.</div>}</div>}
 </main>
}
export default Funcionarios
