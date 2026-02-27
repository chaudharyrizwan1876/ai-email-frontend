import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { fetchSavedReplies } from "../services/api";

const BASE_URL = import.meta.env.VITE_API_BASE_URL;

async function deleteReply(id) {
  const response = await fetch(`${BASE_URL}/replies/${id}`, {
    method: "DELETE",
  });

  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.message || "Delete failed");
  }

  return data;
}

function SavedReplies() {
  const navigate = useNavigate();
  const [replies, setReplies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState(null);

  useEffect(() => { loadReplies(); }, []);

  const loadReplies = async () => {
    try {
      const res = await fetchSavedReplies();
      setReplies(res.success && Array.isArray(res.replies) ? res.replies : []);
    } catch (err) {
      console.error("Fetch saved replies failed:", err);
      setReplies([]);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    const confirmDelete = window.confirm(
      "Are you sure you want to delete this reply?"
    );
    if (!confirmDelete) return;

    try {
      setDeletingId(id);

      await deleteReply(id);

      // Remove from UI after successful delete
      setReplies((prev) => prev.filter((r) => r._id !== id));

    } catch (err) {
      console.error("Delete failed:", err);
      alert("Delete failed. Please try again.");
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <>
      {/* Top Bar */}
      <nav className="hs-navbar">
        <div className="hs-navbar-brand">
          <div style={{
            width:28,
            height:28,
            borderRadius:6,
            background:'var(--teal)',
            display:'flex',
            alignItems:'center',
            justifyContent:'center',
            color:'#fff',
            fontSize:14
          }}>💬</div>
          <div>
            <div className="hs-navbar-brand-name">Saved Replies</div>
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
        {loading ? (
          <div className="hs-loading">⏳ Loading saved replies…</div>
        ) : replies.length === 0 ? (
          <div className="hs-empty" style={{ marginTop: 60 }}>
            <div className="hs-empty-icon">💬</div>
            <div className="hs-empty-text">No saved replies yet</div>
          </div>
        ) : (
          <div style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))",
            gap: "14px"
          }}>
            {replies.map((r) => (
              <div
                className="hs-saved-card"
                key={r._id}
                style={{ position: "relative" }}
              >
                {/* Delete Icon Button */}
                <button
                  onClick={() => handleDelete(r._id)}
                  disabled={deletingId === r._id}
                  title="Delete reply"
                  style={{
                    position: "absolute",
                    top: 10,
                    right: 10,
                    background:
                      deletingId === r._id ? "#ccc" : "#e53e3e",
                    border: "none",
                    borderRadius: "50%",
                    width: 30,
                    height: 30,
                    cursor: "pointer",
                    color: "#fff",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: 15,
                    transition: "0.2s",
                  }}
                >
                  {deletingId === r._id ? "…" : "🗑"}
                </button>

                {r.subject && (
                  <div className="hs-saved-card-title">
                    {r.subject}
                  </div>
                )}

                <div className="hs-saved-card-text">
                  {r.aiReply}
                </div>

                <div className="hs-saved-card-date">
                  {r.createdAt
                    ? new Date(r.createdAt).toLocaleString()
                    : ""}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </>
  );
}

export default SavedReplies;