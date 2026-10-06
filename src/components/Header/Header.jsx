import './Header.css'

function Header() {
  return (
    <header className="header">
      <div className="header-brand">
        <div className="brand-mark"><i className="fa-solid fa-building" /></div>
        <div className="brand-copy"><strong>CondoPrime</strong></div>
      </div>
      <div className="header-main">
        <div className="header-search"><i className="fa-solid fa-magnifying-glass" /><input type="search" placeholder="Buscar no sistema..." /></div>
        <div className="header-actions">
          <button type="button" className="notification-button" aria-label="Notificações"><i className="fa-regular fa-bell" /><span /></button>
          <div className="user-avatar">AD</div>
          <div className="user-info"><strong>Administrador</strong><span>Gestão do sistema</span></div>
          <i className="fa-solid fa-chevron-down user-chevron" />
        </div>
      </div>
    </header>
  )
}
export default Header
