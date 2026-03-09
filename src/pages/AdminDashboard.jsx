import { useState, useEffect } from "react";
import logo from "../assets/logo.jpg";
import {
  createUser,
  fetchUsers,
  deleteUser,
  saveSignature,
  fetchSignature
} from "../services/api";

function AdminDashboard() {

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const [users, setUsers] = useState([]);
  const [localPasswords, setLocalPasswords] = useState({});

  // signature fields
  const [sigName, setSigName] = useState("");
  const [sigRole, setSigRole] = useState("");
  const [sigCompany, setSigCompany] = useState("");
  const [sigWebsite, setSigWebsite] = useState("");
  const [sigHours, setSigHours] = useState("");
  const [sigPhoto, setSigPhoto] = useState(null);

  const [signatureSaved, setSignatureSaved] = useState(false);

  /* ================= USERS ================= */

  const loadUsers = async () => {
    try {
      const res = await fetchUsers();
      if (res.success) setUsers(res.users);
    } catch {
      console.error("Failed to load users");
    }
  };

  /* ================= SIGNATURE LOAD ================= */

  const loadSignature = async () => {
    try {

      const res = await fetchSignature();

      if (res.success && res.signature) {

        setSigName(res.signature.name || "");
        setSigRole(res.signature.role || "");
        setSigCompany(res.signature.company || "");
        setSigWebsite(res.signature.website || "");
        setSigHours(res.signature.workingHours || "");
        setSigPhoto(res.signature.photo || null);

        setSignatureSaved(true);
      }

    } catch (err) {
      console.error("Signature load error:", err);
    }
  };

  useEffect(() => {
    loadUsers();
    loadSignature();
  }, []);

  /* ================= CREATE EMPLOYEE ================= */

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

    if (!window.confirm("Delete this employee?")) return;

    try {

      await deleteUser(id);

      setUsers((prev) =>
        prev.filter((u) => u._id !== id)
      );

    } catch {
      alert("Delete failed");
    }
  };

  const logout = () => {
    localStorage.removeItem("user");
    localStorage.removeItem("token");
    window.location.href = "/";
  };

  /* ================= IMAGE UPLOAD ================= */

  const uploadSignatureImage = async (file) => {

    const formData = new FormData();
    formData.append("image", file);

    try {

      const res = await fetch(
        `${import.meta.env.VITE_API_BASE_URL}/upload/signature-image`,
        {
          method: "POST",
          body: formData
        }
      );

      const data = await res.json();

      if (data.success) {
        return data.imageUrl;
      }

      return null;

    } catch (err) {
      console.error("Upload error", err);
      return null;
    }
  };

  /* ================= SIGNATURE ACTIONS ================= */

  const handleSaveSignature = async () => {

    if (!sigName || !sigRole || !sigCompany) {
      alert("Please fill required fields");
      return;
    }

    try {

      const res = await saveSignature({
        name: sigName,
        role: sigRole,
        company: sigCompany,
        website: sigWebsite,
        workingHours: sigHours,
        photo: sigPhoto,
      });

      if (res.success) {
        alert("Signature saved successfully");
        setSignatureSaved(true);
      }

    } catch (err) {
      console.error(err);
      alert("Server error");
    }
  };

  const handleEditSignature = () => {
    setSignatureSaved(false);
  };

  const handleDeleteSignature = async () => {

    if (!window.confirm("Delete this signature?")) return;

    try {

      await fetch(`${import.meta.env.VITE_API_BASE_URL}/signature/delete`, {
        method: "DELETE",
      });

      setSigName("");
      setSigRole("");
      setSigCompany("");
      setSigWebsite("");
      setSigHours("");
      setSigPhoto(null);

      setSignatureSaved(false);

      alert("Signature deleted");

    } catch {
      alert("Delete failed");
    }
  };

  /* ================= IMAGE SELECT ================= */

  const handleImageSelect = async (file) => {

    const uploadedUrl = await uploadSignatureImage(file);

    if (uploadedUrl) {
      setSigPhoto(uploadedUrl);
    } else {
      alert("Image upload failed");
    }
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

      <div
        style={{
          minHeight: "calc(100vh - 70px)",
          background: "var(--bg-secondary)",
          padding: "40px",
          paddingTop: "90px",
        }}
      >

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))",
            gap: "30px",
            marginBottom: "40px",
          }}
        >

          {/* CREATE EMPLOYEE */}
          <div className="hs-card">
            <h2>Create Employee</h2>

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

          {/* SIGNATURE BUILDER */}
          <div className="hs-card">

            <h2>Signature Builder</h2>

            <input
              className="hs-form-input"
              placeholder="Full Name"
              value={sigName}
              disabled={signatureSaved}
              onChange={(e) => setSigName(e.target.value)}
            />

            <input
              className="hs-form-input"
              placeholder="Position / Role"
              style={{ marginTop: "10px" }}
              value={sigRole}
              disabled={signatureSaved}
              onChange={(e) => setSigRole(e.target.value)}
            />

            <input
              className="hs-form-input"
              placeholder="Company Name"
              style={{ marginTop: "10px" }}
              value={sigCompany}
              disabled={signatureSaved}
              onChange={(e) => setSigCompany(e.target.value)}
            />

            <input
              className="hs-form-input"
              placeholder="Website"
              style={{ marginTop: "10px" }}
              value={sigWebsite}
              disabled={signatureSaved}
              onChange={(e) => setSigWebsite(e.target.value)}
            />

            <input
              className="hs-form-input"
              placeholder="Working Hours"
              style={{ marginTop: "10px" }}
              value={sigHours}
              disabled={signatureSaved}
              onChange={(e) => setSigHours(e.target.value)}
            />

            <input
              type="file"
              style={{ marginTop: "12px" }}
              disabled={signatureSaved}
              onChange={(e) =>
                handleImageSelect(e.target.files[0])
              }
            />

            <div style={{ display: "flex", gap: "10px", marginTop: "15px" }}>

              <button
                type="button"
                className="btn-teal"
                disabled={signatureSaved}
                onClick={handleSaveSignature}
              >
                Save Signature
              </button>

              <button
                type="button"
                className="btn-outline"
                disabled={!signatureSaved}
                onClick={handleEditSignature}
              >
                Edit
              </button>

              <button
                type="button"
                className="btn-outline"
                disabled={!signatureSaved}
                onClick={handleDeleteSignature}
              >
                Delete
              </button>

            </div>

          </div>

          {/* PREVIEW */}
          <div className="hs-card">

            <h2>Preview</h2>

            <div
              style={{
                border: "1px solid var(--border)",
                borderRadius: "8px",
                padding: "15px",
                display: "flex",
                gap: "15px",
                alignItems: "center",
              }}
            >

              {sigPhoto && (
                <img
                  src={sigPhoto}
                  alt=""
                  style={{
                    width: "70px",
                    height: "70px",
                    objectFit: "cover",
                  }}
                />
              )}

              <div>
                <div style={{ fontWeight: "600", fontSize: "15px" }}>
                  {sigName}
                </div>

                <div style={{ fontSize: "13px", color: "#666" }}>
                  {sigRole}{sigCompany ? `, ${sigCompany}` : ""}
                </div>

                <div style={{ fontSize: "13px", marginTop: "6px" }}>
                  🌐 {sigWebsite}
                </div>

                <div style={{ fontSize: "13px" }}>
                  {sigHours}
                </div>

              </div>

            </div>

          </div>

        </div>

        {/* EMPLOYEES TABLE */}

        <div className="hs-card">

          <h3>Employees</h3>

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
                    style={{ borderTop: "1px solid var(--border)" }}
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
                        onClick={() => handleDelete(user._id)}
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