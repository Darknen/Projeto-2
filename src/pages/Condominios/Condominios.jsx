import './Condominios.css'
import { useCallback, useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { formatName } from '../../utils/text.js'

function Condominios() {
  const [lista, setLista] = useState([])
  const [q, setQ] = useState('')
  const [carregando, setCarregando] = useState(true)
  const [erro, setErro] = useState('')

  const carregar = useCallback(async (busca = '') => {
    setCarregando(true)
    setErro('')
    try {
      const API = 'https://api.sossecurity.com.br/api'
      const url = `${API}/condominios.php${busca ? `?q=${encodeURIComponent(busca)}` : ''}`
      const r = await fetch(url)
      if (!r.ok) throw new Error()
      const d = await r.json()
      setLista(d.dados || [])
    } catch {
      setErro('Não foi possível carregar os condomínios.')
    } finally {
      setCarregando(false)
    }
  }, [])

  useEffect(() => { carregar() }, [carregar])

  async function desativar(id, nome) {
    if (!window.confirm(`Desativar ${nome}?`)) return
    try {
      const r = await fetch(`https://api.sossecurity.com.br/api/condominios.php?id=${id}`, { method: 'DELETE' })
      if (!r.ok) throw new Error()
      carregar(q.trim())
    } catch {
      setErro('Não foi possível desativar o condomínio.')
    }
  }

  function buscar(e) {
    e.preventDefault()
    carregar(q.trim())
  }

  function alterarBusca(e) {
    const valor = e.target.value
    setQ(valor)
    if (!valor.trim()) carregar()
  }

  return (
    <main className="condominios-page">
      <div className="condominios-heading">
        <div>
          <h1>Condomínios</h1>
          <p>Gerencie os condomínios cadastrados no sistema.</p>
        </div>
        <Link className="condominios-new-btn" to="/condominios/novo">
          <i className="fa-solid fa-plus"></i>
          Novo condomínio
        </Link>
      </div>

      <form className="condominios-search" onSubmit={buscar}>
        <i className="fa-solid fa-magnifying-glass"></i>
        <input
          value={q}
          onChange={alterarBusca}
          placeholder="Buscar por nome ou CNPJ..."
          aria-label="Buscar condomínio por nome ou CNPJ"
        />
      </form>

      {erro && <div className="alert error">{erro}</div>}

      <section className="condominios-card">
        {carregando && <div className="condominios-loading">Carregando condomínios...</div>}

        {!carregando && !erro && lista.length === 0 && (
          <div className="condominios-empty">
            <i className="fa-regular fa-building"></i>
            <h3>Nenhum condomínio cadastrado</h3>
            <p>Cadastre o primeiro condomínio para começar.</p>
            <Link className="condominios-new-btn" to="/condominios/novo">
              <i className="fa-solid fa-plus"></i>
              Cadastrar condomínio
            </Link>
          </div>
        )}

        {!carregando && !erro && lista.length > 0 && (
          <>
            <div className="condominios-table-wrap">
              <table className="condominios-table">
                <thead>
                  <tr>
                    <th>Nome</th>
                    <th>CNPJ</th>
                    <th>Cidade</th>
                    <th>Status</th>
                    <th>Ações</th>
                  </tr>
                </thead>
                <tbody>
                  {lista.map(c => {
                    const nome = formatName(c.nome_fantasia || c.razao_social)
                    return (
                      <tr key={c.id}>
                        <td className="condominio-name">{nome}</td>
                        <td>{c.cnpj || '-'}</td>
                        <td>{c.cidade ? `${formatName(c.cidade)} - ${c.uf}` : '-'}</td>
                        <td>
                          <span className={`condominios-status ${Number(c.ativo) === 1 ? 'is-active' : 'is-inactive'}`}>
                            {Number(c.ativo) === 1 ? 'Ativo' : 'Inativo'}
                          </span>
                        </td>
                        <td>
                          <div className="condominios-actions">
                            <Link className="condominios-action view" title="Visualizar" aria-label="Visualizar condomínio" to={`/condominios/${c.id}`}>
                              <i className="fa-solid fa-eye"></i>
                            </Link>
                            <Link className="condominios-action edit" title="Editar" aria-label="Editar condomínio" to={`/condominios/${c.id}/editar`}>
                              <i className="fa-solid fa-pen-to-square"></i>
                            </Link>
                            {Number(c.ativo) === 1 && (
                              <button className="condominios-action delete" title="Desativar" aria-label="Desativar condomínio" type="button" onClick={() => desativar(c.id, nome)}>
                                <i className="fa-regular fa-trash-can"></i>
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>

            <div className="condominios-footer">
              <span>{lista.length} {lista.length === 1 ? 'condomínio encontrado' : 'condomínios encontrados'}</span>
              <div className="condominios-pagination" aria-label="Paginação">
                <button type="button" disabled><i className="fa-solid fa-chevron-left"></i></button>
                <button type="button" className="active">1</button>
                <button type="button" disabled><i className="fa-solid fa-chevron-right"></i></button>
              </div>
            </div>
          </>
        )}
      </section>
    </main>
  )
}

export default Condominios
