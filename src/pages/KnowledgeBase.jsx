import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { fetchKnowledge } from "../services/api";

function KnowledgeBase() {
  const navigate = useNavigate();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [saving, setSaving] = useState(false);
  const [file, setFile] = useState(null);

  useEffect(() => {
    loadKnowledge();
  }, []);

  const loadKnowledge = async () => {
    try {
      const res = await fetchKnowledge();

      if (res.success && Array.isArray(res.knowledge)) {
        setItems(res.knowledge);
      } else {
        setItems([]);
      }
    } catch (err) {
      console.error("Fetch knowledge failed:", err);
      setItems([]);
    } finally {
      setLoading(false);
    }
  };

  const handleAddKnowledge = async (e) => {
    e.preventDefault();

    if (!title || !content || !file) {
      alert("Title, summary and PDF file are required");
      return;
    }

    try {
      setSaving(true);

      const formData = new FormData();
      formData.append("title", title);
      formData.append("content", content);
      formData.append("file", file); // 👈 MUST be "file"

      const res = await fetch("http://localhost:5000/knowledge", {
        method: "POST",
        body: formData, // ❌ no headers here
      });

      const data = await res.json();

      if (data.success) {
        setTitle("");
        setContent("");
        setFile(null);
        loadKnowledge();
        alert("Knowledge uploaded successfully");
      } else {
        alert(data.message || "Failed to upload knowledge");
      }
    } catch (err) {
      console.error(err);
      alert("Failed to upload knowledge");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="container-fluid p-3">
      {/* MOBILE BACK BUTTON */}
      <div className="d-md-none mb-3">
        <button
          className="btn btn-outline-secondary btn-sm"
          onClick={() => navigate(-1)}
        >
          ← Back
        </button>
      </div>

      <h4 className="mb-3">Knowledge Base</h4>

      {/* ADD KNOWLEDGE CARD */}
      <div className="card mb-4 shadow-sm">
        <div className="card-body">
          <h6 className="mb-3">Add Knowledge</h6>

          <form onSubmit={handleAddKnowledge}>
            <div className="mb-2">
              <input
                type="text"
                className="form-control"
                placeholder="Title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />
            </div>

            <div className="mb-2">
              <textarea
                className="form-control"
                rows="3"
                placeholder="Content / Notes / PDF summary"
                value={content}
                onChange={(e) => setContent(e.target.value)}
              />
            </div>

            {/* FILE CHOOSE */}
            <div className="mb-2">
              <input
                type="file"
                className="form-control"
                accept="application/pdf"
                onChange={(e) => setFile(e.target.files[0])}
              />
              {file && (
                <small className="text-muted">
                  Selected file: {file.name}
                </small>
              )}
            </div>

            <button
              className="btn btn-primary btn-sm"
              type="submit"
              disabled={saving}
            >
              {saving ? "Uploading..." : "Add Knowledge"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

export default KnowledgeBase;
