import './DashboardCard.css'
function DashboardCard({titulo,valor,icone='fa-building',tom='blue'}){return <div className="dashboard-card"><div className={`dashboard-card-icon ${tom}`}><i className={`fa-solid ${icone}`}/></div><div><strong className="dashboard-card-value">{valor ?? 0}</strong><span className="dashboard-card-title">{titulo}</span></div></div>}
export default DashboardCard
