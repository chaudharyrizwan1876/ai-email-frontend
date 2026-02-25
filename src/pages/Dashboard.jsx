import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  fetchEmails,
  generateAIReply,
  saveReply,
} from "../services/api";
import logo from "../assets/logo.jpg";

/* -------- HELPERS -------- */

function extractCleanName(from = "") {
  if (!from) return "Customer";

  const nameMatch = from.match(/"?(.*?)"?\s*<.*?>/);
  if (nameMatch && nameMatch[1]) {
    const clean = nameMatch[1].trim();
    if (clean.length > 2) return clean;
  }

  const emailMatch = from.match(/<(.+?)>/);
  const email = emailMatch ? emailMatch[1] : from;

  if (email.includes("@")) {
    return email.split("@")[0];
  }

  return "Customer";
}

/* ---------------- MAIN ---------------- */

function Dashboard() {
  const [emails, setEmails] = useState([]);
  const [selectedEmail, setSelectedEmail] = useState(null);
  const [aiReply, setAiReply] = useState("");
  const [loading, setLoading] = useState(true);
  const [mobileView, setMobileView] = useState("inbox");

  useEffect(() => {
    loadEmails();
  }, []);

  useEffect(() => {
    setAiReply("");
  }, [selectedEmail]);

  const loadEmails = async () => {
    try {
      const res = await fetchEmails();
      setEmails(res.emails || []);
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateReply = async () => {
    if (!selectedEmail) return;

    const cleanText = selectedEmail.body.replace(/<[^>]*>/g, "");
    const res = await generateAIReply(cleanText);

    const name = extractCleanName(selectedEmail.from);

    let cleanSubject = selectedEmail.subject || "";
    cleanSubject = cleanSubject.replace(/^Re:\s*/i, "");

    const subject = `Subject: Re: ${cleanSubject}`;

    setAiReply(`
${subject}

Dear ${name},

${res.reply}

Best regards,
JOAO MIRANDA
Premium Magic Solutions
    `.trim());
  };

  const logout = () => {
    localStorage.removeItem("user");
    window.location.href = "/";
  };

  return (
    <>
      {/* NAVBAR */}
      <nav
        className="navbar px-3 position-relative"
        style={{ background: "#2f2f2f", height: "80px" }}
      >
        {/* LEFT SIDE (UNCHANGED) */}
        <div className="d-flex align-items-center gap-3">
          <img src={logo} alt="Logo" height="46" />
          <span className="text-white fw-semibold fs-5">
            Support Dashboard
          </span>
        </div>

        {/* CENTER BRAND (NEW ADDITION) */}
        <div
          className="position-absolute top-50 start-50 translate-middle text-center text-white"
          style={{ lineHeight: "1.1" }}
        >
          <div
            style={{
              fontSize: "24px",
              letterSpacing: "2px",
              fontWeight: "600",
            }}
          >
            JOÃO MIRANDA
          </div>

          <div
            style={{
              fontSize: "12px",
              letterSpacing: "4px",
              opacity: "0.8",
            }}
          >
            PREMIUM MAGIC SOLUTIONS
          </div>
        </div>

        {/* RIGHT SIDE (UNCHANGED) */}
        <div className="ms-auto">
          <button
            className="btn btn-outline-light btn-sm"
            onClick={logout}
          >
            Logout
          </button>
        </div>
      </nav>

      <div className="container-fluid">
        <div className="row min-vh-100">

          {/* ================= MOBILE ================= */}
          <div className="d-md-none p-3">
            {mobileView === "inbox" && (
              <>
                <h6>Inbox</h6>
                {emails.map((e, i) => (
                  <div
                    key={i}
                    className="p-3 mb-2 rounded border"
                    style={{ cursor: "pointer" }}
                    onClick={() => {
                      setSelectedEmail(e);
                      setMobileView("email");
                    }}
                  >
                    <strong>{e.from}</strong>
                    <div className="small text-muted">
                      {e.subject}
                    </div>
                  </div>
                ))}
              </>
            )}

            {mobileView === "email" && selectedEmail && (
              <>
                <button
                  className="btn btn-sm btn-outline-secondary mb-3"
                  onClick={() => {
                    setMobileView("inbox");
                    setSelectedEmail(null);
                  }}
                >
                  ← Back
                </button>

                <h6>Original Email</h6>
                <div
                  className="border p-3 bg-white"
                  dangerouslySetInnerHTML={{
                    __html: selectedEmail.body || "<p>No content</p>"
                  }}
                />

                <h6 className="mt-3">AI Draft Reply</h6>
                <textarea
                  className="form-control"
                  rows="7"
                  value={aiReply}
                  readOnly
                />
              </>
            )}
          </div>

          {/* DESKTOP PANELS (UNCHANGED) */}
          <div className="d-none d-md-block col-md-5 col-lg-4 border-end p-3 bg-light">
            <h6>Inbox</h6>
            <div style={{ maxHeight: "75vh", overflowY: "auto" }}>
              {emails.map((e, i) => (
                <div
                  key={i}
                  className="p-3 mb-2 rounded border"
                  style={{
                    cursor: "pointer",
                    background:
                      selectedEmail === e
                        ? "#2f2f2f"
                        : "#ffffff",
                    color:
                      selectedEmail === e
                        ? "#ffffff"
                        : "#000000",
                  }}
                  onClick={() => setSelectedEmail(e)}
                >
                  <strong>{e.from}</strong>
                  <div className="small opacity-75">
                    {e.subject}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="d-none d-md-block col-md-7 col-lg-8 p-4">
            {selectedEmail ? (
              <>
                <h6>Original Email</h6>
                <div
                  className="border p-3 bg-white"
                  dangerouslySetInnerHTML={{
                    __html: selectedEmail.body || "<p>No content</p>"
                  }}
                />

                <h6 className="mt-4">AI Draft Reply</h6>
                <textarea
                  className="form-control"
                  rows="7"
                  value={aiReply}
                  readOnly
                />

                <div className="d-flex justify-content-end gap-2 mt-3">
                  <button
                    className="btn btn-dark"
                    onClick={handleGenerateReply}
                  >
                    AI Reply
                  </button>

                  <button
                    className="btn btn-outline-dark"
                    onClick={() =>
                      navigator.clipboard.writeText(aiReply)
                    }
                  >
                    Copy
                  </button>

                  <button
                    className="btn btn-success"
                    onClick={() =>
                      saveReply({
                        emailBody: selectedEmail.body,
                        aiReply,
                      })
                    }
                  >
                    Save
                  </button>
                </div>
              </>
            ) : (
              <div className="text-muted">
                Select an email
              </div>
            )}
          </div>

        </div>
      </div>
    </>
  );
}

export default Dashboard;
