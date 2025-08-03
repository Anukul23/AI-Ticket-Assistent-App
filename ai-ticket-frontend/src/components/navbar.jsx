import { Link, useNavigate } from "react-router-dom";

export default function Navbar() {
  const token = localStorage.getItem("token");
  let user = localStorage.getItem("user");
  if (user) {
    user = JSON.parse(user);
  }
  const navigate = useNavigate();

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/login");
  };
  return (
    <div className="navbar bg-base-200">
      <div className="flex-1">
        <Link to="/" className="btn btn-ghost text-xl">
          Ticket AI
        </Link>
      </div>
      <div className="flex gap-2">
        {!token ? (
          <>
            <Link to="/signup" className="btn btn-sm">
              Signup
            </Link>
            <Link to="/login" className="btn btn-sm">
              Login
            </Link>
          </>
        ) : (
          <>
            <div className="flex items-center gap-2">
              <span className="text-sm">Hi, {user?.email}</span>
              <span className={`badge badge-sm ${user?.role === 'admin' ? 'badge-error' :
                  user?.role === 'moderator' ? 'badge-warning' :
                    'badge-info'
                }`}>
                {user?.role || 'user'}
              </span>
            </div>
            {user && user?.role === "admin" ? (
              <Link to="/admin" className="btn btn-sm btn-outline">
                Admin Panel
              </Link>
            ) : null}
            <button onClick={logout} className="btn btn-sm">
              Logout
            </button>
          </>
        )}
      </div>
    </div>
  );
}
