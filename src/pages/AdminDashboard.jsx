import { useState, useEffect } from "react";
import logo from "../assets/logo.jpg";
import {
  createUser,
  fetchUsers,
  deleteUser,
} from "../services/api";

function AdminDashboard() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const [users, setUsers] = useState([]);
  const [localPasswords, setLocalPasswords] = useState({});

  const loadUsers = async () => {
    try {
      const res = await fetchUsers();
      if (res.success) {
        setUsers(res.users);
      }
    } catch {
      console.error("Failed to load users");
    }
  };

  useEffect(() => {
    loadUsers();
  }, []);

  const handleCreate = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    try {
      const res = await createUser({ email, password });

      if (res.success) {
        setMessage("✅ Employee created successfully");

        setLocalPasswords((prev) => ({
          ...prev,
          [res.user.id]: password,
        }));

        setEmail("");
        setPassword("");
        loadUsers();
      } else {
        setMessage(res.message || "Failed to create user");
      }
    } catch {
      setMessage("Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this employee?"))
      return;

    try {
      await deleteUser(id);
      setUsers((prev) => prev.filter((u) => u._id !== id));
    } catch {
      alert("Delete failed");
    }
  };

  const logout = () => {
    localStorage.removeItem("user");
    localStorage.removeItem("token");
    window.location.href = "/";
  };

  return (
    <>
      {/* NAVBAR */}
      <nav className="hs-navbar">
        <div className="hs-navbar-brand">
          <img src={logo} alt="Logo" />
          <div>
            <div className="hs-navbar-brand-name">JOÃO MIRANDA</div>
            <div className="hs-navbar-brand-sub">
              Premium Magic Solutions
            </div>
          </div>
        </div>

        <div className="hs-navbar-right">
          <button className="hs-logout-btn" onClick={logout}>
            Logout
          </button>
        </div>
      </nav>

      {/* BODY */}
      <div
        style={{
          minHeight: "calc(100vh - 70px)",
          background: "var(--bg-secondary)",
          padding: "40px",
        }}
      >
        {/* CREATE CARD */}
        <div
          style={{
            maxWidth: "420px",
            margin: "0 auto",
            background: "var(--bg-primary)",
            borderRadius: "12px",
            padding: "30px",
            boxShadow: "0 4px 20px rgba(0,0,0,0.05)",
            border: "1px solid var(--border)",
          }}
        >
          <h2 style={{ marginBottom: "20px" }}>Create Employee</h2>

          {message && (
            <div style={{ marginBottom: "12px", fontSize: "14px" }}>
              {message}
            </div>
          )}

          <form onSubmit={handleCreate}>
            <label className="hs-form-label">Employee Email</label>
            <input
              type="email"
              className="hs-form-input"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />

            <label className="hs-form-label" style={{ marginTop: "12px" }}>
              Password
            </label>
            <input
              type="password"
              className="hs-form-input"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />

            <button
              type="submit"
              className="btn-teal"
              style={{ width: "100%", marginTop: "18px" }}
              disabled={loading}
            >
              {loading ? "Creating..." : "Create Employee"}
            </button>
          </form>
        </div>

        {/* USERS TABLE */}
        <div
          style={{
            marginTop: "40px",
            background: "var(--bg-primary)",
            borderRadius: "12px",
            padding: "20px",
            boxShadow: "0 4px 20px rgba(0,0,0,0.05)",
            border: "1px solid var(--border)",
          }}
        >
          <h3 style={{ marginBottom: "15px" }}>Employees</h3>

          {users.length === 0 ? (
            <div>No employees found</div>
          ) : (
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr>
                  <th style={{ padding: "10px", textAlign: "left" }}>
                    Email
                  </th>
                  <th style={{ padding: "10px", textAlign: "left" }}>
                    Password
                  </th>
                  <th style={{ padding: "10px" }}>Delete</th>
                </tr>
              </thead>
              <tbody>
                {users.map((user) => (
                  <tr
                    key={user._id}
                    style={{
                      borderTop: "1px solid var(--border)",
                    }}
                  >
                    <td style={{ padding: "10px" }}>
                      {user.email}
                    </td>

                    <td style={{ padding: "10px" }}>
                      {localPasswords[user._id] || "••••••••"}
                    </td>

                    <td style={{ padding: "10px" }}>
                      <button
                        className="btn-outline"
                        onClick={() =>
                          handleDelete(user._id)
                        }
                      >
                        🗑
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </>
  );
}

export default AdminDashboard;