import useAuth from '../hooks/useAuth';

export default function Navbar({ onLogout }) {
  const { user } = useAuth();

  return (
    <header className="navbar">
      <div className="navbar__left">
        <div className="navbar__brand">TaskApp</div>
      </div>
      <div className="navbar__right">
        {user ? (
          <>
            <div className="navbar__user">
              <div className="navbar__name">{user.name}</div>
              <span className={`badge badge--role ${user.role === 'admin' ? 'badge--admin' : 'badge--user'}`}>
                {user.role?.toUpperCase()}
              </span>
            </div>
            <button className="btn btn--secondary" onClick={onLogout}>
              Logout
            </button>
          </>
        ) : null}
      </div>
    </header>
  );
}

