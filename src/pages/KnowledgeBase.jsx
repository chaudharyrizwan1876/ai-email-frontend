import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { fetchKnowledge } from "../services/api";

const BASE_URL = import.meta.env.VITE_API_BASE_URL;

/* ================= API CALLS ================= */

async function uploadPDF(formData) {
  const response = await fetch(`${BASE_URL}/knowledge/upload`, {
    method: "POST",
    body: formData,
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data.message || "Upload failed");
  return data;
}

async function deletePDF(id) {
  const response = await fetch(`${BASE_URL}/knowledge/${id}`, {
    method: "DELETE",
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data.message || "Delete failed");
  return data;
}

/* ================= COMPONENT ================= */

function KnowledgeBase() {
  const navigate = useNavigate();
  const [files, setFiles] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState(null);

  useEffect(() => { loadFiles(); }, []);

  const loadFiles = async () => {
    try {
      const res = await fetchKnowledge();
      setFiles(res.files || []);
    } catch {
      setFiles([]);
    } finally {
      setLoading(false);
    }
  };

  const handleUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setUploading(true);
    setMessage("");

    try {
      const formData = new FormData();
      formData.append("pdf", file);
      await uploadPDF(formData);
      setMessage("✓ PDF uploaded successfully");
      loadFiles();
    } catch {
      setMessage("✗ Upload failed. Please try again.");
    } finally {
      setUploading(false);
      e.target.value = "";
    }
  };

  const handleDelete = async (id) => {
    const confirmDelete = window.confirm("Are you sure you want to delete this file?");
    if (!confirmDelete) return;

    try {
      setDeletingId(id);
      await deletePDF(id);
      setMessage("✓ File deleted successfully");
      loadFiles();
    } catch {
      setMessage("✗ Delete failed. Please try again.");
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <>
      <nav className="hs-navbar">
        <div className="hs-navbar-brand">
          <div style={{
            width:28,height:28,borderRadius:6,
            background:'var(--teal)',
            display:'flex',alignItems:'center',
            justifyContent:'center',
            color:'#fff',fontSize:14
          }}>📄</div>
          <div>
            <div className="hs-navbar-brand-name">Knowledge Base</div>
            <div className="hs-navbar-brand-sub">Premium Magic Solutions</div>
          </div>
        </div>
        <div className="hs-navbar-right">
          <button
            className="hs-logout-btn"
            onClick={() => navigate("/dashboard")}
          >
            ← Back to Inbox
          </button>
        </div>
      </nav>

      <div className="hs-page">

        {/* Upload Card */}
        <div className="hs-card" style={{ maxWidth: 540, marginBottom: 20 }}>
          <div className="hs-card-header">Upload PDF Document</div>
          <div className="hs-card-body">
            <p style={{
              fontSize: 13,
              color: "var(--text-secondary)",
              marginBottom: 14
            }}>
              Upload PDF files to expand the AI knowledge base for generating better replies.
            </p>

            <label
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 8,
                padding: "14px 20px",
                border: "2px dashed var(--border)",
                borderRadius: 8,
                cursor: uploading ? "not-allowed" : "pointer",
                background: "var(--inbox-bg)",
                transition: "border-color 0.2s",
                color: "var(--text-secondary)",
                fontSize: 13,
              }}
              onMouseOver={e => e.currentTarget.style.borderColor = "var(--teal)"}
              onMouseOut={e => e.currentTarget.style.borderColor = "var(--border)"}
            >
              <span style={{ fontSize: 20 }}>📎</span>
              {uploading ? "Uploading…" : "Click to select a PDF file"}
              <input
                type="file"
                accept="application/pdf"
                onChange={handleUpload}
                disabled={uploading}
                style={{ display: "none" }}
              />
            </label>

            {message && (
              <div style={{
                marginTop: 10,
                padding: "8px 12px",
                borderRadius: 6,
                fontSize: 13,
                background: message.startsWith("✓") ? "#e8f5f3" : "#fff5f5",
                color: message.startsWith("✓") ? "var(--teal)" : "#c53030",
                border: `1px solid ${
                  message.startsWith("✓") ? "#b2dfdb" : "#feb2b2"
                }`,
              }}>
                {message}
              </div>
            )}
          </div>
        </div>

        {/* Files List */}
        {loading ? (
          <div className="hs-loading">⏳ Loading files…</div>
        ) : files.length > 0 && (
          <div className="hs-card" style={{ maxWidth: 540 }}>
            <div className="hs-card-header">
              Uploaded Files ({files.length})
            </div>

            <div style={{ padding: "6px 0" }}>
              {files.map((f) => (
                <div
                  key={f._id}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 10,
                    padding: "10px 15px",
                    borderBottom: "1px solid var(--border)",
                  }}
                >
                  <span style={{ fontSize: 16 }}>📄</span>

                  <span style={{
                    fontSize: 13,
                    color: "var(--text-primary)",
                    flex: 1,
                  }}>
                    {f.title || "PDF File"}
                  </span>

                  <button
                    onClick={() => handleDelete(f._id)}
                    disabled={deletingId === f._id}
                    style={{
                      padding: "5px 10px",
                      fontSize: 12,
                      borderRadius: 6,
                      border: "none",
                      cursor: "pointer",
                      background:
                        deletingId === f._id ? "#ccc" : "#e53e3e",
                      color: "#fff",
                      transition: "0.2s",
                    }}
                  >
                    {deletingId === f._id ? "Deleting…" : "Delete"}
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </>
  );
}

export default KnowledgeBase;