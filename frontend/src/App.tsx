import { useState } from "react";
import axios from "axios";
import api from "./api/axios";
import Dashboard from "./components/Dashboard";
import "./App.css";

interface User {
  id: number;
  name: string;
  email: string;
  role: string;
}

function App() {
  const [isLogin, setIsLogin] = useState(true);

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [user, setUser] = useState<User | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(
    event: React.FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    setError("");
    setLoading(true);

    try {
      if (isLogin) {
        const response = await api.post("/auth/login", {
          email,
          password,
        });

        const { token, user } = response.data;

        localStorage.setItem("token", token);

        setUser(user);
      } else {
        const response = await api.post("/auth/register", {
          name,
          email,
          password,
        });

        const { token, user } = response.data;

        localStorage.setItem("token", token);

        setUser(user);
      }
    } catch (err: unknown) {
      const message = axios.isAxiosError(err)
        ? err.response?.data?.message
        : undefined;

      setError(
        message || "Something went wrong. Please try again."
      );
    } finally {
      setLoading(false);
    }
  }

  function handleLogout() {
    localStorage.removeItem("token");

    setUser(null);
    setName("");
    setEmail("");
    setPassword("");
  }

  if (user) {
    return (
      <Dashboard
        userName={user.name}
        onLogout={handleLogout}
      />
    );
  }

  return (
    <div className="app">
      <div className="auth-container">

        <div className="brand-section">
          <div className="brand-icon">SA</div>

          <h1>Sales Analytics</h1>

          <p>
            Process your sales data, generate powerful analytics,
            and visualize business insights in one place.
          </p>

          <div className="feature-list">
            <div>✓ Bulk CSV data processing</div>
            <div>✓ Automated data validation</div>
            <div>✓ Revenue & sales analytics</div>
            <div>✓ Interactive dashboards</div>
          </div>
        </div>

        <div className="auth-card">

          <div className="auth-header">
            <h2>
              {isLogin
                ? "Welcome back"
                : "Create account"}
            </h2>

            <p>
              {isLogin
                ? "Login to access your sales dashboard"
                : "Create an account to start analyzing sales data"}
            </p>
          </div>

          {error && (
            <div className="error-message">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit}>

            {!isLogin && (
              <div className="form-group">
                <label htmlFor="name">
                  Full Name
                </label>

                <input
                  id="name"
                  type="text"
                  placeholder="Enter your name"
                  value={name}
                  onChange={(event) =>
                    setName(event.target.value)
                  }
                  required
                />
              </div>
            )}

            <div className="form-group">
              <label htmlFor="email">
                Email
              </label>

              <input
                id="email"
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(event) =>
                  setEmail(event.target.value)
                }
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="password">
                Password
              </label>

              <input
                id="password"
                type="password"
                placeholder="Enter your password"
                value={password}
                onChange={(event) =>
                  setPassword(event.target.value)
                }
                required
              />
            </div>

            <button
              type="submit"
              className="primary-button"
              disabled={loading}
            >
              {loading
                ? "Please wait..."
                : isLogin
                  ? "Login"
                  : "Create Account"}
            </button>

          </form>

          <div className="auth-switch">
            <span>
              {isLogin
                ? "Don't have an account?"
                : "Already have an account?"}
            </span>

            <button
              type="button"
              className="switch-button"
              onClick={() => {
                setIsLogin(!isLogin);
                setError("");
              }}
            >
              {isLogin ? "Sign up" : "Login"}
            </button>
          </div>

        </div>
      </div>
    </div>
  );
}

export default App;