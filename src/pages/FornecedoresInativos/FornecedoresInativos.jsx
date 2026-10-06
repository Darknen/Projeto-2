import './FornecedoresInativos.css'
import { useCallback, useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { formatName } from '../../utils/text.js'

const API = 'https://api.sossecurity.com.br/api'

function FornecedoresInativos() {
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
        `${API}/fornecedores.php?status=inativo${termo}`
      )
      const data = await response.json().catch(() => ({}))

      if (!response.ok) {
        throw new Error(
          data.erro || 'Não foi possível carregar os fornecedores inativos.'
        )
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

  async function reativar(fornecedor) {
    const nome = fornecedor.nome_fantasia || fornecedor.razao_social

    if (!window.confirm(`Reativar o fornecedor ${nome}?`)) {
      return
    }

    try {
      const response = await fetch(
        `${API}/fornecedores.php?id=${fornecedor.id}`,
        {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ ativo: 1 }),
        }
      )

      const data = await response.json().catch(() => ({}))

      if (!response.ok) {
        throw new Error(
          data.erro || 'Não foi possível reativar o fornecedor.'
        )
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
          <h2>Fornecedores inativos</h2>
          <p>Fornecedores inativados no sistema.</p>
        </div>

        <Link className="btn-voltar-fornecedores" to="/fornecedores">
          Voltar para fornecedores
        </Link>
      </div>

      <form className="search-bar" onSubmit={buscar}>
        <input
          value={q}
          onChange={(event) => setQ(event.target.value)}
          placeholder="Buscar fornecedor inativo"
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
      {carregando && <p>Carregando fornecedores inativos...</p>}

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
                      <button
                        type="button"
                        className="btn-reactivate"
                        title="Reativar"
                        aria-label="Reativar fornecedor"
                        onClick={() => reativar(fornecedor)}
                      >
                        <i className="fa-solid fa-rotate-left" /> Reativar
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {!lista.length && (
            <div className="empty-row">
              Nenhum fornecedor inativo encontrado.
            </div>
          )}
        </div>
      )}
    </main>
  )
}

export default FornecedoresInativos
