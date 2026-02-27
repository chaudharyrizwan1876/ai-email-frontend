import { useEffect, useRef, useState } from "react";
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
  if (email.includes("@")) return email.split("@")[0];
  return "Customer";
}

function getAvatarColor(str = "") {
  const colors = ["#2196F3","#E91E63","#9C27B0","#FF5722","#009688","#FF9800","#3F51B5","#00BCD4"];
  let hash = 0;
  for (let i = 0; i < str.length; i++) hash = str.charCodeAt(i) + ((hash << 5) - hash);
  return colors[Math.abs(hash) % colors.length];
}

function getInitials(from = "") {
  const name = extractCleanName(from);
  return name.slice(0, 2).toUpperCase();
}

function formatTime(dateStr) {
  if (!dateStr) return "";
  const d = new Date(dateStr);
  if (isNaN(d)) return "";
  const diff = new Date() - d;
  if (diff < 3600000) return Math.floor(diff / 60000) + "m";
  if (diff < 86400000) return Math.floor(diff / 3600000) + "hr";
  return Math.floor(diff / 86400000) + "d";
}

/* 
  Strip email body:
  - Remove quoted previous messages (lines starting with >, "On ... wrote:", etc.)
  - Remove HTML signature blocks (tables with images, divs with contact info)
  - Keep only the actual top message
*/
function cleanEmailBody(html = "") {
  if (!html) return "<p>No content</p>";

  const tmp = document.createElement("div");
  tmp.innerHTML = html;

  // Fix links to open in new tab
  tmp.querySelectorAll("a").forEach(link => {
    link.setAttribute("target", "_blank");
    link.setAttribute("rel", "noopener noreferrer");
  });

  // Make sure images scale properly
  tmp.querySelectorAll("img").forEach(img => {
    img.style.maxWidth = "100%";
    img.style.height = "auto";
  });

  return tmp.innerHTML.trim() || "<p>No content</p>";
}

/* Build default reply template for a given email */
function buildDefaultReply(email) {
  if (!email) return "";
  const name = extractCleanName(email.from);
  const originalSubject = (email.subject || "").replace(/^Re:\s*/i, "");
  return `Subject: Re: ${originalSubject}\n\nDear ${name},\n\n\n\nBest regards,\nJOAO MIRANDA\nPremium Magic Solutions`;
}

/* ==================== MAIN ==================== */

function Dashboard() {
  const [emails, setEmails] = useState([]);
  const [selectedEmail, setSelectedEmail] = useState(null);
  const [aiReply, setAiReply] = useState("");
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [copied, setCopied] = useState(false);
  const [mobileShowMain, setMobileShowMain] = useState(false);

  // Search
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [showSearchDropdown, setShowSearchDropdown] = useState(false);
  const searchRef = useRef(null);

  // Profile popup
  const [showProfile, setShowProfile] = useState(false);
  const profileRef = useRef(null);

  const userInfo = (() => {
    try { return JSON.parse(localStorage.getItem("user") || "{}"); }
    catch { return {}; }
  })();

  useEffect(() => { loadEmails(); }, []);

  // When email is selected, pre-fill reply box with template
  useEffect(() => {
    if (selectedEmail) {
      setAiReply(buildDefaultReply(selectedEmail));
    } else {
      setAiReply("");
    }
    setSaved(false);
  }, [selectedEmail]);

  // Close dropdowns on outside click
  useEffect(() => {
    const handler = (e) => {
      if (searchRef.current && !searchRef.current.contains(e.target)) setShowSearchDropdown(false);
      if (profileRef.current && !profileRef.current.contains(e.target)) setShowProfile(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const loadEmails = async () => {
    try {
      const res = await fetchEmails();
      setEmails(res.emails || []);
    } finally {
      setLoading(false);
    }
  };

  const doSearch = (q) => {
    const query = q.trim().toLowerCase();
    if (!query) { setSearchResults([]); setShowSearchDropdown(false); return; }
    const results = emails.filter((e) => {
      const fullName = extractCleanName(e.from).toLowerCase();
      const fromRaw = (e.from || "").toLowerCase();
      const subject = (e.subject || "").toLowerCase();
      return query.split(/\s+/).every((word) =>
        fullName.includes(word) || fromRaw.includes(word) || subject.includes(word)
      );
    });
    setSearchResults(results);
    setShowSearchDropdown(true);
  };

  const handleSearchChange = (e) => { const q = e.target.value; setSearchQuery(q); doSearch(q); };
  const handleSearchKeyDown = (e) => {
    if (e.key === "Enter") doSearch(searchQuery);
    if (e.key === "Escape") { setShowSearchDropdown(false); setSearchQuery(""); }
  };

  const handleSelectSearchResult = (email) => {
    setSelectedEmail(email);
    setMobileShowMain(true);
    setShowSearchDropdown(false);
    setSearchQuery("");
  };

  const handleGenerateReply = async () => {
    if (!selectedEmail || generating) return;
    setGenerating(true);
    setSaved(false);
    try {
      const cleanText = selectedEmail.body.replace(/<[^>]*>/g, "");
      const res = await generateAIReply(cleanText);
      const name = extractCleanName(selectedEmail.from);
      const originalSubject = (selectedEmail.subject || "").replace(/^Re:\s*/i, "");
      setAiReply(
        `Subject: Re: ${originalSubject}\n\nDear ${name},\n\n${res.reply}\n\nBest regards,\nJOAO MIRANDA\nPremium Magic Solutions`.trim()
      );
    } finally {
      setGenerating(false);
    }
  };

  const handleCopy = () => {
    if (!aiReply) return;
    navigator.clipboard.writeText(aiReply);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSave = async () => {
    if (saving || !aiReply || !selectedEmail) return;
    setSaving(true);
    try {
      await saveReply({ emailBody: selectedEmail.body, aiReply });
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
    } catch (err) {
      console.error("Save failed:", err);
      alert("Failed to save reply. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  const logout = () => { localStorage.removeItem("user"); window.location.href = "/"; };
  const selectEmail = (e) => { setSelectedEmail(e); setMobileShowMain(true); };
  const goBack = () => { setMobileShowMain(false); setSelectedEmail(null); };

  return (
    <>
      {/* ===== NAVBAR ===== */}
      <nav className="hs-navbar">
        <div className="hs-navbar-brand">
          <img src={logo} alt="Logo" />
          <div>
            <div className="hs-navbar-brand-name">JOÃO MIRANDA</div>
            <div className="hs-navbar-brand-sub">Premium Magic Solutions</div>
          </div>
        </div>

        <div className="hs-navbar-search" ref={searchRef}>
          <span className="hs-search-icon">🔍</span>
          <input
            className="hs-search"
            placeholder="Search by name…"
            value={searchQuery}
            onChange={handleSearchChange}
            onKeyDown={handleSearchKeyDown}
            onFocus={() => { if (searchQuery.trim()) setShowSearchDropdown(true); }}
          />
          <button className="hs-search-btn" onClick={() => doSearch(searchQuery)}>Search</button>
          {showSearchDropdown && (
            <div className="hs-search-dropdown">
              {searchResults.length === 0 ? (
                <div className="hs-search-no-result">No results found</div>
              ) : searchResults.map((e, i) => (
                <div key={i} className="hs-search-result" onClick={() => handleSelectSearchResult(e)}>
                  <div className="hs-email-avatar" style={{ background: getAvatarColor(e.from), width: 28, height: 28, fontSize: 10 }}>
                    {getInitials(e.from)}
                  </div>
                  <div>
                    <div className="hs-search-result-name">{extractCleanName(e.from)}</div>
                    <div className="hs-search-result-sub">{e.subject}</div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="hs-navbar-right">
          <div className="hs-profile-wrap" ref={profileRef}>
            <div className="hs-avatar" title="Profile" onClick={() => setShowProfile(v => !v)}>JM</div>
            {showProfile && (
              <div className="hs-profile-popup">
                <div className="hs-profile-popup-name">JOÃO MIRANDA</div>
                <div className="hs-profile-popup-email">{userInfo.email || userInfo.username || "—"}</div>
              </div>
            )}
          </div>
          <button className="hs-logout-btn" onClick={logout}>Logout</button>
        </div>
      </nav>

      {/* ===== APP BODY ===== */}
      <div className="hs-app">

        <aside className="hs-sidebar">
          <div className="hs-sidebar-icon active" title="Inbox">✉</div>
          <Link to="/knowledge" className="hs-sidebar-icon" title="Knowledge Base">📄</Link>
          <Link to="/saved-replies" className="hs-sidebar-icon" title="Saved Replies">💬</Link>
        </aside>

        {/* INBOX PANEL */}
        <div className={`hs-inbox-panel ${mobileShowMain ? "mobile-hidden" : ""}`}>
          <div className="hs-inbox-header">
            <div className="hs-inbox-title">Support Inbox <span className="chevron">▾</span></div>
          </div>
          <div className="hs-inbox-nav">
            <div className="hs-inbox-nav-item active">
              <span className="hs-inbox-nav-label">All conversations</span>
              <span className="hs-inbox-count">{emails.length}</span>
            </div>
          </div>
          <div className="hs-inbox-quick-nav">
            <Link to="/knowledge" className="hs-quick-nav-btn">📄 Upload PDF</Link>
            <Link to="/saved-replies" className="hs-quick-nav-btn">💬 Saved</Link>
          </div>
          <div className="hs-email-list">
            {loading ? (
              <div className="hs-loading">⏳ Loading emails…</div>
            ) : emails.length === 0 ? (
              <div className="hs-empty"><div className="hs-empty-icon">✉</div><div className="hs-empty-text">No emails found</div></div>
            ) : emails.map((e, i) => (
              <div
                key={i}
                className={`hs-email-item unread ${selectedEmail === e ? "active" : ""}`}
                onClick={() => selectEmail(e)}
              >
                <div className="hs-email-item-top">
                  <div className="hs-email-avatar" style={{ background: getAvatarColor(e.from) }}>{getInitials(e.from)}</div>
                  <div className="hs-email-meta"><div className="hs-email-from">{extractCleanName(e.from)}</div></div>
                  <div className="hs-email-time">{formatTime(e.date)}</div>
                </div>
                <div className="hs-email-subject">{e.subject}</div>
                <div className="hs-email-footer"><span className="hs-badge hs-badge-email">EMAIL</span></div>
              </div>
            ))}
          </div>
          <div className="hs-status-bar">
            <div className="hs-status-dot" />
            <div className="hs-status-text">Available</div>
          </div>
        </div>

        {/* ===== MAIN CONTENT ===== */}
        <div className={`hs-main ${mobileShowMain ? "mobile-show" : ""}`}>
          {selectedEmail ? (
            <>
              {/* Toolbar */}
              <div className="hs-toolbar">
                <button className="hs-action-btn" title="Back" onClick={goBack}>←</button>
                <div className="hs-toolbar-actions">
                  <button className="btn-teal" onClick={handleGenerateReply} disabled={generating}>
                    {generating ? "⏳ Generating…" : "✨ AI Reply"}
                  </button>
                  <button className="btn-outline" onClick={handleCopy} disabled={!aiReply}>
                    {copied ? "✓ Copied!" : "⎘ Copy"}
                  </button>
                  <button className="btn-outline" onClick={handleSave} disabled={saving || !aiReply}>
                    {saving ? "Saving…" : saved ? "✓ Saved!" : "💾 Save"}
                  </button>
                </div>
              </div>

              {/* Thread — scrollable outer container */}
              <div className="hs-thread">

                {/* Email card — cleaned body, scrollable */}
                <div className="hs-email-card">
                  <div className="hs-email-card-header">
                    <div className="hs-email-card-avatar" style={{ background: getAvatarColor(selectedEmail.from) }}>
                      {getInitials(selectedEmail.from)}
                    </div>
                    <div className="hs-email-card-info">
                      <div className="hs-email-card-name">
                        {extractCleanName(selectedEmail.from)}
                        <span style={{ fontWeight: 400, color: "var(--text-muted)", fontSize: "11.5px" }}>
                          {" "}&lt;{selectedEmail.from}&gt;
                        </span>
                      </div>
                      <div className="hs-email-card-to">To: support@premiummagicsolutions.com</div>
                    </div>
                  </div>
                  {/* Cleaned email body — removes signature, quoted replies, images */}
                  <div
                    className="hs-email-card-body hs-email-body-scroll"
                    dangerouslySetInnerHTML={{ __html: cleanEmailBody(selectedEmail.body) }}
                  />
                </div>

                {/* AI Reply box — always visible, pre-filled, editable, scrollable */}
                <div className="hs-ai-draft">
                  <div className="hs-ai-draft-header">
                    <div className="hs-ai-label">
                      <div className="hs-ai-dot" />
                      Reply
                    </div>
                    <button
                      className="btn-ghost"
                      style={{ fontSize: "11px", padding: "3px 8px" }}
                      onClick={handleGenerateReply}
                      disabled={generating}
                    >
                      {generating ? "⏳ Generating…" : "✨ Generate AI Reply"}
                    </button>
                  </div>

                  {/* Fixed height textarea — always editable, scrollable */}
                  <textarea
                    className="hs-ai-textarea"
                    value={aiReply}
                    onChange={(ev) => setAiReply(ev.target.value)}
                    placeholder="Write your reply here…"
                  />


                </div>

              </div>
            </>
          ) : (
            <div className="hs-empty">
              <div className="hs-empty-icon">✉</div>
              <div className="hs-empty-text">Select an email to view the conversation</div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}

export default Dashboard;
