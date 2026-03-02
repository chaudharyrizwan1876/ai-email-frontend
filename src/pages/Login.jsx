import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { loginUser } from "../services/api";

function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const navigate = useNavigate();

  const handleSubmit = async (e) => {
  e.preventDefault();
  setError("");

  try {
    const result = await loginUser({ email, password });

    if (result && result.success === true) {
      // ✅ Save user
      localStorage.setItem("user", JSON.stringify(result.user));
      localStorage.setItem("token", result.token); // important for protected routes

      // ✅ Role-based redirect
      if (result.user.role === "admin") {
        navigate("/admin", { replace: true });
      } else {
        navigate("/dashboard", { replace: true });
      }
    } else {
      setError(result?.message || "Login failed");
    }
  } catch (err) {
    setError(err.message || "Login failed");
  }
};

  return (
    <div className="hs-login-wrap">
      <div className="hs-login-card">
        <div className="hs-login-logo">
          <div className="hs-login-logo-mark">✨</div>
          <div className="hs-login-brand">JOÃO MIRANDA</div>
          <div className="hs-login-brand-sub">Premium Magic Solutions</div>
        </div>

        {error && <div className="hs-alert-error">{error}</div>}

        <form onSubmit={handleSubmit}>
          <label className="hs-form-label">Email</label>
          <input
            type="email"
            className="hs-form-input"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            placeholder="you@example.com"
          />

          <label className="hs-form-label">Password</label>
          <input
            type="password"
            className="hs-form-input"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            placeholder="••••••••"
          />

          <button
            className="btn-teal"
            type="submit"
            style={{ width: "100%", justifyContent: "center", padding: "10px", fontSize: "14px", marginTop: "4px" }}
          >
            Login
          </button>
        </form>

        <div className="hs-login-footer">© {new Date().getFullYear()} JOÃO MIRANDA</div>
      </div>
    </div>
  );
}

export default Login;