import './ModuloEmBreve.css'
import { Link } from 'react-router-dom'
function ModuloEmBreve({ titulo }) {
  return <main className="module-page"><div className="page-header"><div><h2>{titulo}</h2><p>Este módulo já possui rota no Condo Prime e será desenvolvido nas próximas etapas.</p></div></div><div className="empty-state"><h3>Módulo preparado</h3><p>A navegação já está funcionando.</p><Link className="btn-secondary" to="/">Voltar ao Dashboard</Link></div></main>
}
export default ModuloEmBreve
