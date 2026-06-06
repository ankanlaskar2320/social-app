import { useState } from "react";
import axios from "axios";
import { useNavigate, Link } from "react-router-dom";

function Signup() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleSignup = async () => {
    try {
      await axios.post("https://social-app-backend-qulo.onrender.com/api/auth/signup", {
        name,
        email,
        password
      });

      navigate("/login");
    } catch (err) {
      setError(err.response?.data?.message || "Signup failed");
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") handleSignup();
  };

  return (
    <div style={styles.page}>
      <div style={styles.left}>
        <div style={styles.brand}>
          <h1 style={styles.brandName}>Social</h1>
          <p style={styles.brandTagline}>Share your thoughts with the world.</p>
          <div style={styles.brandFeatures}>
            <div style={styles.feature}>
              <div style={styles.featureDot} />
              <span>Post text and images</span>
            </div>
            <div style={styles.feature}>
              <div style={styles.featureDot} />
              <span>Like and comment on posts</span>
            </div>
            <div style={styles.feature}>
              <div style={styles.featureDot} />
              <span>Connect with everyone</span>
            </div>
          </div>
        </div>
      </div>

      <div style={styles.right}>
        <div style={styles.formBox}>
          <h2 style={styles.title}>Create account</h2>
          <p style={styles.sub}>Sign up to get started</p>

          {error && <p style={styles.error}>{error}</p>}

          <div style={styles.inputGroup}>
            <label style={styles.label}>Full Name</label>
            <input
              style={styles.input}
              type="text"
              placeholder="Your full name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              onKeyDown={handleKeyDown}
            />
          </div>

          <div style={styles.inputGroup}>
            <label style={styles.label}>Email</label>
            <input
              style={styles.input}
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              onKeyDown={handleKeyDown}
            />
          </div>

          <div style={styles.inputGroup}>
            <label style={styles.label}>Password</label>
            <input
              style={styles.input}
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              onKeyDown={handleKeyDown}
            />
          </div>

          <button style={styles.button} onClick={handleSignup}>
            Sign Up
          </button>

          <p style={styles.linkText}>
            Already have an account?{" "}
            <Link to="/login" style={styles.link}>
              Login
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

const styles = {
  page: {
    display: "flex",
    minHeight: "100vh",
    backgroundColor: "#f0f2f5",
    alignItems: "center",
    justifyContent: "center"
  },
  left: {
    width: "55%",
    backgroundColor: "#1877f2",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: "60px",
    minHeight: "100vh"
  },
  brand: {
    color: "#fff",
    maxWidth: "300px"
  },
  brandName: {
    fontSize: "42px",
    fontWeight: "800",
    margin: "0 0 14px 0",
    letterSpacing: "-1px"
  },
  brandTagline: {
    fontSize: "16px",
    opacity: 0.85,
    margin: "0 0 36px 0",
    lineHeight: "1.6"
  },
  brandFeatures: {
    display: "flex",
    flexDirection: "column",
    gap: "14px"
  },
  feature: {
    display: "flex",
    alignItems: "center",
    gap: "12px",
    fontSize: "14px",
    opacity: 0.9
  },
  featureDot: {
    width: "7px",
    height: "7px",
    borderRadius: "50%",
    backgroundColor: "#fff",
    flexShrink: 0
  },
  right: {
    width: "45%",
    minHeight: "100vh",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#fff",
    padding: "40px"
  },
  formBox: {
    width: "100%",
    maxWidth: "320px"
  },
  title: {
    fontSize: "26px",
    fontWeight: "700",
    color: "#1a1a1a",
    margin: "0 0 6px 0"
  },
  sub: {
    fontSize: "14px",
    color: "#888",
    margin: "0 0 28px 0"
  },
  inputGroup: {
    marginBottom: "18px"
  },
  label: {
    display: "block",
    fontSize: "13px",
    fontWeight: "600",
    color: "#444",
    marginBottom: "6px"
  },
  input: {
    width: "100%",
    padding: "11px 14px",
    borderRadius: "8px",
    border: "1px solid #e0e0e0",
    fontSize: "14px",
    boxSizing: "border-box",
    outline: "none",
    fontFamily: "inherit"
  },
  button: {
    width: "100%",
    padding: "12px",
    backgroundColor: "#1877f2",
    color: "#fff",
    border: "none",
    borderRadius: "8px",
    fontSize: "15px",
    fontWeight: "600",
    cursor: "pointer",
    marginTop: "8px",
    marginBottom: "20px"
  },
  error: {
    color: "#e53935",
    fontSize: "13px",
    marginBottom: "16px",
    padding: "10px 14px",
    backgroundColor: "#fff5f5",
    borderRadius: "8px",
    border: "1px solid #ffcdd2"
  },
  linkText: {
    textAlign: "center",
    fontSize: "14px",
    color: "#666"
  },
  link: {
    color: "#1877f2",
    textDecoration: "none",
    fontWeight: "600"
  }
};

export default Signup;