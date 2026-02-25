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
        localStorage.setItem("user", JSON.stringify(result.user));
        navigate("/dashboard", { replace: true });
      } else {
        setError(result?.message || "Login failed");
      }
    } catch (err) {
      setError(err.message || "Login failed");
    }
  };

  return (
    <div className="container-fluid">
      <div className="row min-vh-100 justify-content-center align-items-center bg-light">
        <div className="col-12 col-sm-10 col-md-6 col-lg-4">
          <div className="card shadow border-0">
            <div className="card-body p-4">
              {/* BRAND HEADER */}
              <div className="text-center mb-4">
                <h3 className="fw-bold mb-1">
                  JOÃO MIRANDA
                </h3>
                <div className="text-muted">
                  Premium Magic Solutions
                </div>
              </div>

              {error && (
                <div className="alert alert-danger py-2">
                  {error}
                </div>
              )}

              <form onSubmit={handleSubmit}>
                <div className="mb-3">
                  <label className="form-label">
                    Email
                  </label>
                  <input
                    type="email"
                    className="form-control"
                    value={email}
                    onChange={(e) =>
                      setEmail(e.target.value)
                    }
                    required
                  />
                </div>

                <div className="mb-4">
                  <label className="form-label">
                    Password
                  </label>
                  <input
                    type="password"
                    className="form-control"
                    value={password}
                    onChange={(e) =>
                      setPassword(e.target.value)
                    }
                    required
                  />
                </div>

                {/* LOGIN BUTTON */}
                <button
                  className="btn w-100"
                  type="submit"
                  style={{
                    background: "#2f2f2f",
                    color: "#fff",
                  }}
                >
                  Login
                </button>
              </form>
            </div>
          </div>

          {/* FOOTER TEXT */}
          <p className="text-center text-muted mt-3 small">
            © {new Date().getFullYear()} JOÃO MIRANDA
          </p>
        </div>
      </div>
    </div>
  );
}

export default Login;
