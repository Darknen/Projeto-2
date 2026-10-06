import './Fornecedores.css'
import { useCallback, useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { formatName } from '../../utils/text.js'

const API = 'https://api.sossecurity.com.br/api'

function Fornecedores() {
  const [lista, setLista] = useState([])
  const [q, setQ] = useState('')
  const [carregando, setCarregando] = useState(true)
  const [erro, setErro] = useState('')

  const carregar = useCallback(async (busca = '') => {
    setCarregando(true)
    setErro('')

    try {
      const termo = busca ? `&q=${encodeURIComponent(busca)}` : ''
      const response = await fetch(
        `${API}/fornecedores.php?status=ativo${termo}`
      )
      const data = await response.json().catch(() => ({}))

      if (!response.ok) {
        throw new Error(data.erro || 'Não foi possível carregar os fornecedores.')
      }

      setLista(data.dados || [])
    } catch (error) {
      setErro(error.message)
    } finally {
      setCarregando(false)
    }
  }, [])

  useEffect(() => {
    carregar()
  }, [carregar])

  async function inativar(fornecedor) {
    const nome = fornecedor.nome_fantasia || fornecedor.razao_social

    if (!window.confirm(`Inativar o fornecedor ${nome}?`)) {
      return
    }

    try {
      const response = await fetch(
        `${API}/fornecedores.php?id=${fornecedor.id}`,
        { method: 'DELETE' }
      )
      const data = await response.json().catch(() => ({}))

      if (!response.ok) {
        throw new Error(data.erro || 'Não foi possível inativar o fornecedor.')
      }

      await carregar(q.trim())
    } catch (error) {
      setErro(error.message)
    }
  }

  function buscar(event) {
    event.preventDefault()
    carregar(q.trim())
  }

  function limparBusca() {
    setQ('')
    carregar()
  }

  return (
    <main className="condominios-page">
      <div className="page-header">
        <div>
          <h2>Fornecedores</h2>
          <p>Fornecedores ativos de todos os condomínios.</p>
        </div>

        <Link className="btn-inativos" to="/fornecedores/inativos">
          <i className="fa-solid fa-box-archive" /> Fornecedores inativos
        </Link>
      </div>

      <form className="search-bar" onSubmit={buscar}>
        <input
          value={q}
          onChange={(event) => setQ(event.target.value)}
          placeholder="Buscar por fornecedor, CNPJ ou condomínio"
        />

        <button type="submit" className="btn-secondary">
          Buscar
        </button>

        {q && (
          <button type="button" className="btn-link" onClick={limparBusca}>
            Limpar
          </button>
        )}
      </form>

      {erro && <div className="alert error">{erro}</div>}
      {carregando && <p>Carregando fornecedores...</p>}

      {!carregando && !erro && (
        <div className="table-container">
          <table className="data-table fornecedores-table">
            <thead>
              <tr>
                <th>Fornecedor</th>
                <th>Condomínio</th>
                <th>CNPJ</th>
                <th>Telefone</th>
                <th>Ações</th>
              </tr>
            </thead>

            <tbody>
              {lista.map((fornecedor) => (
                <tr key={fornecedor.id}>
                  <td>
                    <strong className="fornecedor-nome">
                      {formatName(fornecedor.nome_fantasia || fornecedor.razao_social)}
                    </strong>

                    {fornecedor.nome_fantasia &&
                      fornecedor.razao_social &&
                      fornecedor.nome_fantasia !== fornecedor.razao_social && (
                        <small className="fornecedor-razao">
                          {formatName(fornecedor.razao_social)}
                        </small>
                      )}
                  </td>

                  <td>{formatName(fornecedor.condominio_nome)}</td>
                  <td className="nowrap">{fornecedor.cnpj}</td>
                  <td className="nowrap">{fornecedor.telefone || '-'}</td>

                  <td>
                    <div className="table-actions">
                      <Link
                        className="condo-action-btn condo-action-edit"
                        title="Editar"
                        aria-label="Editar fornecedor"
                        to={`/fornecedores/${fornecedor.id}/editar`}
                      >
                        <i className="fa-solid fa-pen" />
                      </Link>

                      <button
                        type="button"
                        className="condo-action-btn condo-action-disable"
                        title="Inativar"
                        aria-label="Inativar fornecedor"
                        onClick={() => inativar(fornecedor)}
                      >
                        <i className="fa-solid fa-power-off" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {!lista.length && (
            <div className="empty-row">
              Nenhum fornecedor ativo encontrado.
            </div>
          )}
        </div>
      )}
    </main>
  )
}

export default Fornecedores
