import { Route, Routes } from 'react-router-dom'
import Header from './components/Header/Header.jsx'
import Sidebar from './components/Sidebar/Sidebar.jsx'
import Dashboard from './pages/Dashboard/Dashboard.jsx'
import Condominios from './pages/Condominios/Condominios.jsx'
import CondominioForm from './pages/CondominioForm/CondominioForm.jsx'
import CondominioDetalhe from './pages/CondominioDetalhe/CondominioDetalhe.jsx'
import ModuloEmBreve from './pages/ModuloEmBreve/ModuloEmBreve.jsx'
import Funcionarios from './pages/Funcionarios/Funcionarios.jsx'
import FuncionariosInativos from './pages/FuncionariosInativos/FuncionariosInativos.jsx'
import FuncionarioEditar from './pages/FuncionarioEditar/FuncionarioEditar.jsx'
import Fornecedores from './pages/Fornecedores/Fornecedores.jsx'
import FornecedoresInativos from './pages/FornecedoresInativos/FornecedoresInativos.jsx'
import FornecedorEditar from './pages/FornecedorEditar/FornecedorEditar.jsx'
import './App.css'
import './ux-system.css'

const modulos=[['/unidades','Unidades'],['/moradores','Moradores'],['/veiculos','Veículos'],['/manutencoes','Manutenções'],['/ordens-servico','Ordens de Serviço'],['/ocorrencias','Ocorrências'],['/contratos','Contratos'],['/estoque','Estoque'],['/financeiro','Financeiro'],['/agenda','Agenda'],['/relatorios','Relatórios'],['/usuarios','Usuários'],['/configuracoes','Configurações']]
function App(){return <div className="app"><Header/><div className="app-body"><Sidebar/><div className="app-content"><Routes><Route path="/" element={<Dashboard/>}/><Route path="/condominios" element={<Condominios/>}/><Route path="/condominios/novo" element={<CondominioForm/>}/><Route path="/condominios/:id" element={<CondominioDetalhe/>}/><Route path="/condominios/:id/editar" element={<CondominioForm/>}/><Route path="/funcionarios" element={<Funcionarios/>}/><Route path="/funcionarios/inativos" element={<FuncionariosInativos/>}/><Route path="/funcionarios/:id/editar" element={<FuncionarioEditar/>}/><Route path="/fornecedores" element={<Fornecedores/>}/><Route path="/fornecedores/inativos" element={<FornecedoresInativos/>}/><Route path="/fornecedores/:id/editar" element={<FornecedorEditar/>}/>{modulos.map(([path,titulo])=><Route key={path} path={path} element={<ModuloEmBreve titulo={titulo}/>}/>) }<Route path="*" element={<ModuloEmBreve titulo="Página não encontrada"/>}/></Routes></div></div></div>}
export default App
