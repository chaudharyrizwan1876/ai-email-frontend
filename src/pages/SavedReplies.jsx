import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { fetchSavedReplies } from "../services/api";

function SavedReplies() {
  const navigate = useNavigate();
  const [replies, setReplies] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadReplies();
  }, []);

  const loadReplies = async () => {
    try {
      const res = await fetchSavedReplies();

      if (res.success && Array.isArray(res.replies)) {
        setReplies(res.replies);
      } else {
        setReplies([]);
      }
    } catch (err) {
      console.error("Fetch saved replies failed:", err);
      setReplies([]);
    } finally {
      setLoading(false);
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

      <h4 className="mb-3">Saved Replies</h4>

      {loading ? (
        <div>Loading...</div>
      ) : replies.length === 0 ? (
        <div className="text-muted">No saved replies</div>
      ) : (
        <div className="row">
          {replies.map((r) => (
            <div
              className="col-12 col-md-6 col-lg-4 mb-3"
              key={r._id}
            >
              <div className="card h-100 shadow-sm">
                <div className="card-body">
                  <h6 className="card-title">{r.subject}</h6>
                  <p className="card-text small">{r.aiReply}</p>
                  <small className="text-muted">
                    {new Date(r.createdAt).toLocaleString()}
                  </small>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default SavedReplies;
