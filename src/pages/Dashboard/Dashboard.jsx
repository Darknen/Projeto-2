import './Dashboard.css'
import { useEffect, useState } from 'react'
import DashboardCard from '../../components/DashboardCard/DashboardCard.jsx'

const API = 'https://api.sossecurity.com.br/api'

function Dashboard() {
  const [dados, setDados] = useState({
    condominios: 0,
    unidades: 0,
    moradores: 0,
    funcionarios: 0,
    fornecedores: 0,
    manutencoes: 0,
    os_abertas: 0,
  })

  const [erro, setErro] = useState('')

  useEffect(() => {
    const carregarDashboard = async () => {
      try {
        setErro('')

        const response = await fetch(`${API}/dashboard.php`)

        if (!response.ok) {
          throw new Error('Erro ao carregar dashboard')
        }

        const json = await response.json()

        setDados((dadosAtuais) => ({
          ...dadosAtuais,
          ...(json.dados || {}),
        }))
      } catch {
        setErro('Não foi possível carregar os dados do dashboard.')
      }
    }

    carregarDashboard()
  }, [])

  const recentes = [
    [
      '#001',
      'Residencial das Flores',
      'Troca de lâmpadas',
      'Concluída',
      '04/10/2026',
      'green',
    ],
    [
      '#002',
      'Solar do Parque',
      'Revisão de elevador',
      'Em andamento',
      '03/10/2026',
      'blue',
    ],
    [
      '#003',
      'Vila Nova',
      'Vazamento na garagem',
      'Pendente',
      '03/10/2026',
      'orange',
    ],
    [
      '#004',
      'Monte Verde',
      'Pintura da fachada',
      'Concluída',
      '01/10/2026',
      'green',
    ],
  ]

  return (
    <main className="dashboard">
      <div className="dashboard-welcome">
        <div>
          <h2>Olá, Administrador</h2>
          <p>Aqui está um resumo geral do sistema.</p>
        </div>

        <span>Sexta-feira, 04 de Outubro de 2026</span>
      </div>

      {erro && (
        <div className="dashboard-alert">
          {erro}
        </div>
      )}

      <div className="dashboard-cards">
        <DashboardCard
          titulo="Condomínios"
          valor={dados.condominios}
          icone="fa-building"
          tom="blue"
        />

        <DashboardCard
          titulo="Unidades"
          valor={dados.unidades}
          icone="fa-door-open"
          tom="purple"
        />

        <DashboardCard
          titulo="Moradores"
          valor={dados.moradores}
          icone="fa-users"
          tom="green"
        />

        <DashboardCard
          titulo="Funcionários"
          valor={dados.funcionarios ?? 0}
          icone="fa-user-tie"
          tom="purple"
        />

        <DashboardCard
          titulo="Fornecedores"
          valor={dados.fornecedores ?? 0}
          icone="fa-truck"
          tom="orange"
        />

        <DashboardCard
          titulo="Manutenções"
          valor={dados.manutencoes ?? dados.os_abertas ?? 0}
          icone="fa-screwdriver-wrench"
          tom="red"
        />
      </div>

      <section className="recent-card">
        <div className="recent-card-header">
          <h3>Manutenções recentes</h3>
          <a href="/manutencoes">Ver todas</a>
        </div>

        <div className="recent-table-wrap">
          <table>
            <thead>
              <tr>
                <th>#</th>
                <th>Condomínio</th>
                <th>Descrição</th>
                <th>Status</th>
                <th>Data</th>
              </tr>
            </thead>

            <tbody>
              {recentes.map(([numero, condominio, descricao, status, data, tom]) => (
                <tr key={numero}>
                  <td>{numero}</td>
                  <td>{condominio}</td>
                  <td>{descricao}</td>

                  <td>
                    <span className={`recent-status ${tom}`}>
                      {status}
                    </span>
                  </td>

                  <td>{data}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </main>
  )
}

export default Dashboard