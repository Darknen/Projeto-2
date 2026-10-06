import './CondominioDetalhe.css'
import { useCallback, useEffect, useMemo, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { formatName } from '../../utils/text.js'

const API = 'https://api.sossecurity.com.br/api'
const emptyUnit={bloco:'',unidade:'',tipo:'Apartamento',situacao:'Ocupada',observacoes:''}
const emptyResident={nome:'',cpf:'',telefone:'',email:'',tipo:'proprietario',unidade_id:''}
const emptyVehicle={morador_id:'',unidade_id:'',placa:'',marca:'',modelo:'',cor:''}
const emptyEmployee={nome:'',cpf:'',cargo:'',data_admissao:'',telefone:'',email:'',cep:'',logradouro:'',numero:'',complemento:'',bairro:'',cidade:'',uf:'',ativo:1}
const emptySupplier={cnpj:'',razao_social:'',nome_fantasia:'',contato:'',telefone:'',email:'',cep:'',logradouro:'',numero:'',complemento:'',bairro:'',cidade:'',uf:''}
const onlyNumbers=v=>(v||'').replace(/\D/g,'')
const formatCnpj=v=>onlyNumbers(v).slice(0,14).replace(/^(\d{2})(\d)/,'$1.$2').replace(/^(\d{2})\.(\d{3})(\d)/,'$1.$2.$3').replace(/\.(\d{3})(\d)/,'.$1/$2').replace(/(\d{4})(\d)/,'$1-$2')
const formatCep=v=>onlyNumbers(v).slice(0,8).replace(/^(\d{5})(\d)/,'$1-$2')
const formatPhone=v=>{const n=onlyNumbers(v).slice(0,11);if(n.length===11)return n.replace(/^(\d{2})(\d{5})(\d{4})$/,'($1) $2-$3');if(n.length===10)return n.replace(/^(\d{2})(\d{4})(\d{4})$/,'($1) $2-$3');return v||'-'}

async function api(path, options={}){
  const r=await fetch(`${API}/${path}`,{headers:{'Content-Type':'application/json',...(options.headers||{})},...options})
  const data=await r.json().catch(()=>({}))
  if(!r.ok) throw new Error(data.erro||'Não foi possível concluir a operação.')
  return data
}

function CondominioDetalhe(){
 const {id}=useParams()
 const [d,setD]=useState(null),[erro,setErro]=useState(''),[tab,setTab]=useState('dados')
 const [unidades,setUnidades]=useState([]),[moradores,setMoradores]=useState([]),[veiculos,setVeiculos]=useState([]),[funcionarios,setFuncionarios]=useState([]),[fornecedores,setFornecedores]=useState([])
 const [unit,setUnit]=useState(emptyUnit),[resident,setResident]=useState(emptyResident),[vehicle,setVehicle]=useState(emptyVehicle),[employee,setEmployee]=useState(emptyEmployee),[supplier,setSupplier]=useState(emptySupplier)
 const [showUnit,setShowUnit]=useState(false),[showResident,setShowResident]=useState(false),[showVehicle,setShowVehicle]=useState(false),[showEmployee,setShowEmployee]=useState(false),[showSupplier,setShowSupplier]=useState(false)
 const [editingUnit,setEditingUnit]=useState(null),[editingResident,setEditingResident]=useState(null),[editingVehicle,setEditingVehicle]=useState(null),[editingEmployee,setEditingEmployee]=useState(null),[editingSupplier,setEditingSupplier]=useState(null)
 const [msg,setMsg]=useState('')

 const load=useCallback(async()=>{
   setErro('')
   try{
    const [c,u,m,v]=await Promise.all([
      api(`condominios.php?id=${id}`),
      api(`unidades.php?condominio_id=${id}`),
      api(`moradores.php?condominio_id=${id}`),
      api(`veiculos.php?condominio_id=${id}`)
    ])
    setD(c.dados); setUnidades(u.dados||[]); setMoradores(m.dados||[]); setVeiculos(v.dados||[])
    try{
      const f=await api(`funcionarios.php?condominio_id=${id}&status=ativo`)
      setFuncionarios(f.dados||[])
    }catch(e){
      setFuncionarios([])
      setMsg(`Funcionários: ${e.message}`)
    }
    try{
      const f=await api(`fornecedores.php?condominio_id=${id}&status=ativo`)
      setFornecedores(f.dados||[])
    }catch(e){
      setFornecedores([])
      setMsg(`Fornecedores: ${e.message}`)
    }
   }catch(e){setErro(e.message)}
 },[id])
 useEffect(()=>{load()},[load])
 const nome=formatName(d?.nome_fantasia||d?.razao_social)
 const unitMap=useMemo(()=>Object.fromEntries(unidades.map(u=>[String(u.id),u])),[unidades])
 const residentMap=useMemo(()=>Object.fromEntries(moradores.map(m=>[String(m.id),m])),[moradores])

 const saveUnit=async(e)=>{e.preventDefault();setMsg('')
  try{const body={...unit,condominio_id:Number(id)}; await api(`unidades.php${editingUnit?`?id=${editingUnit}`:''}`,{method:editingUnit?'PUT':'POST',body:JSON.stringify(body)})
   setUnit(emptyUnit);setEditingUnit(null);setShowUnit(false);setMsg('Unidade salva com sucesso.');await load()
  }catch(e){setMsg(e.message)}
 }
 const saveResident=async(e)=>{e.preventDefault();setMsg('')
  try{await api(`moradores.php${editingResident?`?id=${editingResident}`:''}`,{method:editingResident?'PUT':'POST',body:JSON.stringify({...resident,condominio_id:Number(id),unidade_id:Number(resident.unidade_id)})})
   setResident(emptyResident);setEditingResident(null);setShowResident(false);setMsg('Morador salvo com sucesso.');await load()
  }catch(e){setMsg(e.message)}
 }
 const saveVehicle=async(e)=>{e.preventDefault();setMsg('')
  try{await api(`veiculos.php${editingVehicle?`?id=${editingVehicle}`:''}`,{method:editingVehicle?'PUT':'POST',body:JSON.stringify({...vehicle,condominio_id:Number(id),unidade_id:Number(vehicle.unidade_id),morador_id:vehicle.morador_id?Number(vehicle.morador_id):null})})
   setVehicle(emptyVehicle);setEditingVehicle(null);setShowVehicle(false);setMsg('Veículo salvo com sucesso.');await load()
  }catch(e){setMsg(e.message)}
 }
 const buscarCepEmployee=async()=>{
  const cep=(employee.cep||'').replace(/\D/g,'')
  if(cep.length!==8) return
  setMsg('')
  try{
   const r=await fetch(`https://viacep.com.br/ws/${cep}/json/`)
   const data=await r.json()
   if(!r.ok||data.erro) throw new Error('CEP não encontrado.')
   setEmployee(prev=>({...prev,cep:`${cep.slice(0,5)}-${cep.slice(5)}`,logradouro:data.logradouro||'',bairro:data.bairro||'',cidade:data.localidade||'',uf:data.uf||''}))
  }catch(e){setMsg(e.message||'Não foi possível consultar o CEP.')}
 }
 const saveEmployee=async(e)=>{e.preventDefault();setMsg('')
  try{await api(`funcionarios.php${editingEmployee?`?id=${editingEmployee}`:''}`,{method:editingEmployee?'PUT':'POST',body:JSON.stringify({...employee,condominio_id:Number(id),ativo:1})})
   setEmployee(emptyEmployee);setEditingEmployee(null);setShowEmployee(false);setMsg('Funcionário salvo com sucesso.');await load()
  }catch(e){setMsg(e.message)}
 }
 const inativarEmployee=async(f)=>{if(!window.confirm(`Inativar o funcionário ${f.nome}?`))return;setMsg('');try{const r=await api(`funcionarios.php?id=${f.id}`,{method:'DELETE'});setMsg(r.mensagem||'Funcionário inativado.');await load()}catch(e){setMsg(e.message)}}
 const buscarCnpjSupplier=async()=>{
  const cnpj=onlyNumbers(supplier.cnpj)
  if(cnpj.length!==14){setMsg('Informe um CNPJ com 14 dígitos.');return}
  setMsg('Consultando CNPJ...')
  try{
   const r=await fetch(`https://brasilapi.com.br/api/cnpj/v1/${cnpj}`)
   if(!r.ok)throw new Error('CNPJ não encontrado.')
   const d=await r.json()
   setSupplier(a=>({...a,cnpj:formatCnpj(d.cnpj||cnpj),razao_social:d.razao_social||a.razao_social,nome_fantasia:d.nome_fantasia||a.nome_fantasia,telefone:d.ddd_telefone_1||d.ddd_telefone_2||a.telefone,email:d.email||a.email,cep:formatCep(d.cep||a.cep),logradouro:d.logradouro||a.logradouro,numero:d.numero||a.numero,complemento:d.complemento||a.complemento,bairro:d.bairro||a.bairro,cidade:d.municipio||a.cidade,uf:d.uf||a.uf}))
   setMsg('Dados do CNPJ preenchidos.')
  }catch(e){setMsg(e.message||'Não foi possível consultar o CNPJ.')}
 }
 const buscarCepSupplier=async()=>{
  const cep=onlyNumbers(supplier.cep);if(cep.length!==8)return
  try{
   const r=await fetch(`https://viacep.com.br/ws/${cep}/json/`);const d=await r.json()
   if(!r.ok||d.erro)throw new Error()
   setSupplier(a=>({...a,cep:formatCep(cep),logradouro:d.logradouro||a.logradouro,bairro:d.bairro||a.bairro,cidade:d.localidade||a.cidade,uf:d.uf||a.uf}))
  }catch{setMsg('CEP não encontrado.')}
 }
 const saveSupplier=async(e)=>{e.preventDefault();setMsg('')
  try{
   await api(`fornecedores.php${editingSupplier?`?id=${editingSupplier}`:''}`,{method:editingSupplier?'PUT':'POST',body:JSON.stringify({...supplier,condominio_id:Number(id)})})
   setSupplier(emptySupplier);setEditingSupplier(null);setShowSupplier(false);setMsg('Fornecedor salvo com sucesso.');await load()
  }catch(e){setMsg(e.message)}
 }
 const inativarSupplier=async(f)=>{
  const nome=f.nome_fantasia||f.razao_social
  if(!window.confirm(`Inativar o fornecedor ${nome}?`))return
  setMsg('')
  try{const r=await api(`fornecedores.php?id=${f.id}`,{method:'DELETE'});setMsg(r.mensagem||'Fornecedor inativado.');await load()}catch(e){setMsg(e.message)}
 }
 const remove=async(kind,item)=>{
  const labels={unidades:'a unidade',moradores:'o morador',veiculos:'o veículo'}
  const nomes={
    unidades:item.unidade?` ${item.unidade}`:'',
    moradores:item.nome?` ${item.nome}`:'',
    veiculos:item.placa?` ${item.placa}`:''
  }
  if(!window.confirm(`Excluir ${labels[kind]}${nomes[kind]||''}?`)) return
  setMsg('')
  try{
    const resposta=await api(`${kind}.php?id=${item.id}`,{method:'DELETE'})
    setMsg(resposta.mensagem||'Registro excluído com sucesso.')
    await load()
  }catch(e){setMsg(e.message)}
}
 if(erro)return <main><p>{erro}</p></main>; if(!d)return <main><p>Carregando...</p></main>

 return <main className="condominios-page condominio-detalhe-page">
  <div className="page-header condominio-detalhe-header"><div><h2>{nome}</h2><p>Gestão completa do condomínio</p></div><div className="page-actions"><Link className="btn-secondary detail-back-btn" to="/condominios"><i className="fa-solid fa-arrow-left"></i> Voltar</Link><Link className="btn-primary detail-edit-btn" to={`/condominios/${id}/editar`}><i className="fa-solid fa-pen"></i> Editar condomínio</Link></div></div>
  {msg&&<div className="alert">{msg}</div>}
  <div className="condo-tabs condo-tabs-modern">
   {[
    ['dados','Dados','fa-solid fa-circle-info',null],
    ['unidades','Unidades','fa-solid fa-building',unidades.length],
    ['moradores','Moradores','fa-solid fa-users',moradores.length],
    ['veiculos','Veículos','fa-solid fa-car',veiculos.length],
    ['funcionarios','Funcionários','fa-solid fa-user-tie',funcionarios.length],
    ['fornecedores','Fornecedores','fa-solid fa-truck',fornecedores.length]
   ].map(([k,l,icon,count])=>
    <button key={k} type="button" className={tab===k?'active':''} onClick={()=>setTab(k)}>
     <i className={icon}></i>
     <span className="tab-label">{l}</span>
     {count!==null&&<span className="tab-count">{count}</span>}
    </button>
   )}
  </div>

  {tab==='dados'&&<div className="details-card"><dl className="details-grid">
   <div><dt>Nome do condomínio</dt><dd>{nome}</dd></div><div><dt>CNPJ</dt><dd>{d.cnpj?formatCnpj(d.cnpj):'-'}</dd></div><div><dt>E-mail</dt><dd>{d.email||'-'}</dd></div><div><dt>Telefone</dt><dd>{formatPhone(d.telefone||d.celular)}</dd></div><div><dt>Endereço</dt><dd>{[d.logradouro,d.numero,d.complemento,d.bairro].filter(Boolean).join(', ')||'-'}</dd></div><div><dt>Cidade/UF</dt><dd>{d.cidade?`${d.cidade}/${d.uf}`:'-'}</dd></div><div><dt>Status</dt><dd><span className={`detail-info-status ${Number(d.ativo)===1?'active':'inactive'}`}>{Number(d.ativo)===1?'Ativo':'Inativo'}</span></dd></div><div className="details-observacoes"><dt>Observações</dt><dd>{d.observacoes||'-'}</dd></div>
  </dl></div>}

  {tab==='unidades'&&<section className="tab-panel">
   <div className="section-toolbar"><div><h3>Unidades</h3><p>Blocos, casas, apartamentos ou salas deste condomínio.</p></div><button className="btn-primary" onClick={()=>{setUnit(emptyUnit);setEditingUnit(null);setShowUnit(!showUnit)}}>+ Nova unidade</button></div>
   {showUnit&&<form className="inline-form" onSubmit={saveUnit}><div className="mini-grid">
    <label>Bloco/Torre<input value={unit.bloco} onChange={e=>setUnit({...unit,bloco:e.target.value})}/></label>
    <label>Unidade *<input required value={unit.unidade} onChange={e=>setUnit({...unit,unidade:e.target.value})}/></label>
    <label>Tipo<select value={unit.tipo} onChange={e=>setUnit({...unit,tipo:e.target.value})}><option>Apartamento</option><option>Casa</option><option>Sala</option><option>Loja</option><option>Outro</option></select></label>
    <label>Situação<select value={unit.situacao} onChange={e=>setUnit({...unit,situacao:e.target.value})}><option>Ocupada</option><option>Vaga</option></select></label>
    <label className="wide">Observações<textarea value={unit.observacoes} onChange={e=>setUnit({...unit,observacoes:e.target.value})}/></label>
   </div><div className="form-actions"><button type="button" className="btn-secondary" onClick={()=>setShowUnit(false)}>Cancelar</button><button className="btn-primary">Salvar unidade</button></div></form>}
   <div className="table-container unidades-table-container"><table className="data-table unidades-table"><thead><tr><th>Bloco</th><th>Unidade</th><th>Moradores</th><th>Tipo</th><th>Situação</th><th>Veículos</th><th>Ações</th></tr></thead><tbody>{unidades.map(u=>{const rms=moradores.filter(m=>String(m.unidade_id)===String(u.id));const vs=veiculos.filter(v=>String(v.unidade_id)===String(u.id));const tipoClass=(u.tipo||'').toLowerCase().replace(/[^a-z0-9]/g,'');const situacaoClass=(u.situacao||'').toLowerCase().replace(/[^a-z0-9]/g,'');return <tr key={u.id}><td data-label="Bloco">{u.bloco||'-'}</td><td data-label="Unidade"><strong>{u.unidade||'-'}</strong></td><td data-label="Moradores" className="unit-residents">{rms.length?rms.map(m=>formatName(m.nome)).join(', '):'-'}</td><td data-label="Tipo"><span className={`unit-badge unit-type unit-type-${tipoClass}`}>{u.tipo||'-'}</span></td><td data-label="Situação"><span className={`unit-badge unit-status unit-status-${situacaoClass}`}>{u.situacao||'-'}</span></td><td data-label="Veículos" className="unit-vehicles">{vs.length?vs.map(v=>`${v.modelo || v.veiculo || '-'} • ${v.placa || '-'}`).join(', '):'-'}</td><td data-label="Ações"><div className="table-actions"><button className="action-icon action-edit" title="Editar" aria-label="Editar unidade" onClick={()=>{setUnit({...emptyUnit,...u});setEditingUnit(u.id);setShowUnit(true)}}><i className="fa-solid fa-pen"></i></button><button className="action-icon action-delete" title="Excluir" aria-label="Excluir unidade" onClick={()=>remove('unidades',u)}><i className="fa-solid fa-trash"></i></button></div></td></tr>})}</tbody></table>{!unidades.length&&<div className="empty-row">Nenhuma unidade cadastrada.</div>}</div>
  </section>}

  {tab==='moradores'&&<section className="tab-panel">
   <div className="section-toolbar"><div><h3>Moradores</h3><p>Todos os moradores, já vinculados às respectivas unidades.</p></div><button className="btn-primary" disabled={!unidades.length} onClick={()=>{setResident({...emptyResident,unidade_id:unidades[0]?.id||''});setEditingResident(null);setShowResident(!showResident)}}>+ Novo morador</button></div>
   {showResident&&<form className="inline-form" onSubmit={saveResident}><div className="mini-grid">
    <label className="wide">Nome *<input required value={resident.nome} onChange={e=>setResident({...resident,nome:e.target.value})}/></label>
    <label>Unidade *<select required value={resident.unidade_id} onChange={e=>setResident({...resident,unidade_id:e.target.value})}><option value="">Selecione</option>{unidades.map(u=><option key={u.id} value={u.id}>{u.bloco?`${u.bloco} - `:''}{u.unidade}</option>)}</select></label>
    <label>Vínculo<select value={resident.tipo} onChange={e=>setResident({...resident,tipo:e.target.value})}><option value="proprietario">Proprietário</option><option value="inquilino">Inquilino</option><option value="dependente">Dependente</option></select></label>
    <label>CPF<input value={resident.cpf} onChange={e=>setResident({...resident,cpf:e.target.value})}/></label><label>Telefone<input value={resident.telefone} onChange={e=>setResident({...resident,telefone:e.target.value})}/></label><label className="wide">E-mail<input type="email" value={resident.email} onChange={e=>setResident({...resident,email:e.target.value})}/></label>
   </div><div className="form-actions"><button type="button" className="btn-secondary" onClick={()=>setShowResident(false)}>Cancelar</button><button className="btn-primary">Salvar morador</button></div></form>}
   <div className="table-container moradores-table-container"><table className="data-table moradores-table"><thead><tr><th>Nome</th><th>Bloco</th><th>Unidade</th><th>Vínculo</th><th>Telefone</th><th>Ações</th></tr></thead><tbody>{moradores.map(m=>{const unidade=unitMap[String(m.unidade_id)];return <tr key={m.id}><td>{formatName(m.nome)}</td><td>{unidade?.bloco||'-'}</td><td>{unidade?.unidade||'-'}</td><td><span className={`vinculo-badge vinculo-${(m.tipo||'').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/\s+/g,'-')}`}>{({proprietario:'Proprietário',inquilino:'Inquilino',dependente:'Dependente',residente:'Residente'}[String(m.tipo||'').toLowerCase()]||m.tipo||'-')}</span></td><td>{m.telefone||'-'}</td><td><div className="table-actions"><button className="action-icon action-edit" title="Editar" aria-label="Editar morador" onClick={()=>{setResident({...emptyResident,...m});setEditingResident(m.id);setShowResident(true)}}><i className="fa-solid fa-pen"></i></button><button className="action-icon action-delete" title="Excluir" aria-label="Excluir morador" onClick={()=>remove('moradores',m)}><i className="fa-solid fa-trash"></i></button></div></td></tr>})}</tbody></table>{!moradores.length&&<div className="empty-row">Nenhum morador cadastrado.</div>}</div>
  </section>}

  {tab==='veiculos'&&<section className="tab-panel">
   <div className="section-toolbar"><div><h3>Veículos</h3><p>Veículos vinculados aos moradores e unidades deste condomínio.</p></div><button className="btn-primary" disabled={!unidades.length} onClick={()=>{setVehicle({...emptyVehicle,unidade_id:unidades[0]?.id||''});setEditingVehicle(null);setShowVehicle(!showVehicle)}}>+ Novo veículo</button></div>
   {showVehicle&&<form className="inline-form" onSubmit={saveVehicle}><div className="mini-grid">
    <label>Unidade *<select required value={vehicle.unidade_id} onChange={e=>setVehicle({...vehicle,unidade_id:e.target.value,morador_id:''})}><option value="">Selecione</option>{unidades.map(u=><option key={u.id} value={u.id}>{u.bloco?`${u.bloco} - `:''}{u.unidade}</option>)}</select></label>
    <label>Morador<select value={vehicle.morador_id} onChange={e=>setVehicle({...vehicle,morador_id:e.target.value})}><option value="">Sem responsável</option>{moradores.filter(m=>String(m.unidade_id)===String(vehicle.unidade_id)).map(m=><option key={m.id} value={m.id}>{m.nome}</option>)}</select></label>
    <label>Placa *<input required value={vehicle.placa} onChange={e=>setVehicle({...vehicle,placa:e.target.value.toUpperCase()})}/></label><label>Marca<input value={vehicle.marca} onChange={e=>setVehicle({...vehicle,marca:e.target.value})}/></label><label>Modelo<input value={vehicle.modelo} onChange={e=>setVehicle({...vehicle,modelo:e.target.value})}/></label><label>Cor<input value={vehicle.cor} onChange={e=>setVehicle({...vehicle,cor:e.target.value})}/></label>
   </div><div className="form-actions"><button type="button" className="btn-secondary" onClick={()=>setShowVehicle(false)}>Cancelar</button><button className="btn-primary">Salvar veículo</button></div></form>}
   <div className="table-container"><table className="data-table layout-veiculos-5 veiculos-table"><thead><tr><th>Placa</th><th>Veículo</th><th>Unidade</th><th>Morador</th><th>Ações</th></tr></thead><tbody>{veiculos.map(v=><tr key={v.id}><td><strong>{v.placa}</strong></td><td>{[v.marca,v.modelo,v.cor].filter(Boolean).join(' • ')||'-'}</td><td>{unitMap[String(v.unidade_id)]?.unidade||'-'}</td><td>{residentMap[String(v.morador_id)]?.nome||'-'}</td><td><div className="table-actions"><button className="action-icon action-edit" title="Editar" aria-label="Editar veículo" onClick={()=>{setVehicle({...emptyVehicle,...v});setEditingVehicle(v.id);setShowVehicle(true)}}><i className="fa-solid fa-pen"></i></button><button className="action-icon action-delete" title="Excluir" aria-label="Excluir veículo" onClick={()=>remove('veiculos',v)}><i className="fa-solid fa-trash"></i></button></div></td></tr>)}</tbody></table>{!veiculos.length&&<div className="empty-row">Nenhum veículo cadastrado.</div>}</div>
  </section>}

  {tab==='funcionarios'&&<section className="tab-panel">
   <div className="section-toolbar"><div><h3>Funcionários</h3><p>Funcionários ativos vinculados a este condomínio.</p></div><button className="btn-primary" onClick={()=>{setEmployee(emptyEmployee);setEditingEmployee(null);setShowEmployee(!showEmployee)}}>+ Novo funcionário</button></div>
   {showEmployee&&<form className="inline-form" onSubmit={saveEmployee}><div className="mini-grid">
    <label className="wide">Nome completo *<input required value={employee.nome} onChange={e=>setEmployee({...employee,nome:e.target.value})}/></label>
    <label>CPF *<input required value={employee.cpf} onChange={e=>setEmployee({...employee,cpf:e.target.value})}/></label>
    <label>Cargo *<input required value={employee.cargo} onChange={e=>setEmployee({...employee,cargo:e.target.value})}/></label>
    <label>Data de admissão<input type="date" value={employee.data_admissao||''} onChange={e=>setEmployee({...employee,data_admissao:e.target.value})}/></label>
    <label>Telefone<input value={employee.telefone||''} onChange={e=>setEmployee({...employee,telefone:e.target.value})}/></label>
    <label className="wide">E-mail<input type="email" value={employee.email||''} onChange={e=>setEmployee({...employee,email:e.target.value})}/></label>
    <label>CEP<input value={employee.cep||''} maxLength="9" placeholder="00000-000" onChange={e=>{const n=e.target.value.replace(/\D/g,'').slice(0,8);setEmployee({...employee,cep:n.length>5?`${n.slice(0,5)}-${n.slice(5)}`:n})}} onBlur={buscarCepEmployee}/></label>
    <label className="wide">Logradouro<input value={employee.logradouro||''} onChange={e=>setEmployee({...employee,logradouro:e.target.value})}/></label>
    <label>Número<input value={employee.numero||''} onChange={e=>setEmployee({...employee,numero:e.target.value})}/></label>
    <label>Complemento<input value={employee.complemento||''} onChange={e=>setEmployee({...employee,complemento:e.target.value})}/></label>
    <label>Bairro<input value={employee.bairro||''} onChange={e=>setEmployee({...employee,bairro:e.target.value})}/></label>
    <label>Cidade<input value={employee.cidade||''} onChange={e=>setEmployee({...employee,cidade:e.target.value})}/></label>
    <label>UF<input value={employee.uf||''} maxLength="2" onChange={e=>setEmployee({...employee,uf:e.target.value.toUpperCase()})}/></label>
   </div><div className="form-actions"><button type="button" className="btn-secondary" onClick={()=>setShowEmployee(false)}>Cancelar</button><button className="btn-primary">Salvar funcionário</button></div></form>}
   <div className="table-container"><table className="data-table funcionarios-table">
<colgroup>
  <col style={{width:"22%"}} />
  <col style={{width:"18%"}} />
  <col style={{width:"17%"}} />
  <col style={{width:"15%"}} />
  <col style={{width:"16%"}} />
  <col style={{width:"12%"}} />
</colgroup><thead><tr><th>Nome</th><th>CPF</th><th>Cargo</th><th>Telefone</th><th>Admissão</th><th>Ações</th></tr></thead><tbody>{funcionarios.map(f=><tr key={f.id}><td><strong>{f.nome}</strong></td><td>{f.cpf}</td><td>{f.cargo}</td><td>{f.telefone||'-'}</td><td>{f.data_admissao?f.data_admissao.split('-').reverse().join('/'):'-'}</td><td><div className="table-actions"><button className="action-icon action-edit" title="Editar" onClick={()=>{setEmployee({...emptyEmployee,...f});setEditingEmployee(f.id);setShowEmployee(true)}}><i className="fa-solid fa-pen"></i></button><button className="action-icon action-delete" title="Inativar" onClick={()=>inativarEmployee(f)}><i className="fa-solid fa-trash"></i></button></div></td></tr>)}</tbody></table>{!funcionarios.length&&<div className="empty-row">Nenhum funcionário ativo cadastrado neste condomínio.</div>}</div>
  </section>}
  {tab==='fornecedores'&&<section className="tab-panel">
   <div className="section-toolbar"><div><h3>Fornecedores</h3><p>Fornecedores ativos vinculados a este condomínio.</p></div><button className="btn-primary" onClick={()=>{setSupplier(emptySupplier);setEditingSupplier(null);setShowSupplier(!showSupplier)}}>+ Novo fornecedor</button></div>
   {showSupplier&&<form className="inline-form" onSubmit={saveSupplier}><div className="mini-grid">
    <label>CNPJ *<input required value={supplier.cnpj||''} placeholder="00.000.000/0000-00" onChange={e=>setSupplier({...supplier,cnpj:formatCnpj(e.target.value)})} onBlur={buscarCnpjSupplier}/></label>
    <label className="wide">Razão social *<input required value={supplier.razao_social||''} onChange={e=>setSupplier({...supplier,razao_social:e.target.value})}/></label>
    <label className="wide">Nome fantasia<input value={supplier.nome_fantasia||''} onChange={e=>setSupplier({...supplier,nome_fantasia:e.target.value})}/></label>
    <label>Contato<input value={supplier.contato||''} onChange={e=>setSupplier({...supplier,contato:e.target.value})}/></label>
    <label>Telefone<input value={supplier.telefone||''} onChange={e=>setSupplier({...supplier,telefone:e.target.value})}/></label>
    <label className="wide">E-mail<input type="email" value={supplier.email||''} onChange={e=>setSupplier({...supplier,email:e.target.value})}/></label>
    <label>CEP<input value={supplier.cep||''} placeholder="00000-000" onChange={e=>setSupplier({...supplier,cep:formatCep(e.target.value)})} onBlur={buscarCepSupplier}/></label>
    <label className="wide">Logradouro<input value={supplier.logradouro||''} onChange={e=>setSupplier({...supplier,logradouro:e.target.value})}/></label>
    <label>Número<input value={supplier.numero||''} onChange={e=>setSupplier({...supplier,numero:e.target.value})}/></label>
    <label>Complemento<input value={supplier.complemento||''} onChange={e=>setSupplier({...supplier,complemento:e.target.value})}/></label>
    <label>Bairro<input value={supplier.bairro||''} onChange={e=>setSupplier({...supplier,bairro:e.target.value})}/></label>
    <label>Cidade<input value={supplier.cidade||''} onChange={e=>setSupplier({...supplier,cidade:e.target.value})}/></label>
    <label>UF<input maxLength="2" value={supplier.uf||''} onChange={e=>setSupplier({...supplier,uf:e.target.value.toUpperCase()})}/></label>
   </div><div className="form-actions"><button type="button" className="btn-secondary" onClick={()=>{setShowSupplier(false);setEditingSupplier(null);setSupplier(emptySupplier)}}>Cancelar</button><button className="btn-primary">{editingSupplier?'Salvar alterações':'Salvar fornecedor'}</button></div></form>}
   <div className="table-container fornecedores-table-container"><table className="data-table fornecedores-table layout-veiculos-5"><thead><tr><th>Fornecedor</th><th>CNPJ</th><th>Contato</th><th>Telefone</th><th>Ações</th></tr></thead><tbody>{fornecedores.map(f=><tr key={f.id}><td><strong>{formatName(f.nome_fantasia||f.razao_social)}</strong></td><td>{f.cnpj}</td><td>{f.contato||'-'}</td><td>{f.telefone||'-'}</td><td><div className="table-actions"><button className="action-icon action-edit" title="Editar" onClick={()=>{setSupplier({...emptySupplier,...f,cnpj:formatCnpj(f.cnpj),cep:formatCep(f.cep)});setEditingSupplier(f.id);setShowSupplier(true)}}><i className="fa-solid fa-pen"></i></button><button className="action-icon action-delete" title="Inativar" onClick={()=>inativarSupplier(f)}><i className="fa-solid fa-trash"></i></button></div></td></tr>)}</tbody></table>{!fornecedores.length&&<div className="empty-row">Nenhum fornecedor ativo cadastrado neste condomínio.</div>}</div>
  </section>}

 </main>
}
export default CondominioDetalhe
