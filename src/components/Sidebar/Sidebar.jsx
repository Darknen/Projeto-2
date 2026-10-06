import './Sidebar.css'
import { NavLink } from 'react-router-dom'

const menuItems=[
 ['/', 'Dashboard','fa-chart-column'],['/condominios','Condomínios','fa-building'],['/funcionarios','Funcionários','fa-user-tie'],['/fornecedores','Fornecedores','fa-truck'],['/manutencoes','Manutenções','fa-screwdriver-wrench'],['/ordens-servico','Ordens de Serviço','fa-clipboard-list'],['/ocorrencias','Ocorrências','fa-triangle-exclamation'],['/contratos','Contratos','fa-file-contract'],['/estoque','Estoque','fa-boxes-stacked'],['/financeiro','Financeiro','fa-wallet'],['/agenda','Agenda','fa-calendar-days'],['/relatorios','Relatórios','fa-chart-line'],['/usuarios','Usuários','fa-user-gear'],['/configuracoes','Configurações','fa-gear']
]
function Sidebar(){return <aside className="sidebar"><nav className="sidebar-nav"><ul>{menuItems.map(([path,label,icon])=><li key={path}><NavLink to={path} end={path==='/'} className={({isActive})=>isActive?'active':''}><span className="sidebar-icon"><i className={`fa-solid ${icon}`}/></span><span>{label}</span></NavLink></li>)}</ul></nav></aside>}
export default Sidebar
