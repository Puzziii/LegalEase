import { useState, useRef, useEffect } from "react";

const API = "https://legalease-1fw7.onrender.com";

const LANGUAGES = ["Hindi", "Tamil", "Telugu", "Kannada", "Bengali", "Marathi", "English"];

export default function LegalEase() {
  const [screen, setScreen] = useState("landing"); // landing | app
  const [file, setFile] = useState(null);
  const [language, setLanguage] = useState("Hindi");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const [chatMessages, setChatMessages] = useState([]);
  const [chatInput, setChatInput] = useState("");
  const [chatLoading, setChatLoading] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const fileRef = useRef();
  const chatEndRef = useRef();

  useEffect(() => {
    if (chatEndRef.current) chatEndRef.current.scrollIntoView({ behavior: "smooth" });
  }, [chatMessages]);

  const handleFile = (f) => {
    if (f && f.type === "application/pdf") {
      setFile(f);
      setError(null);
      setResult(null);
      setChatMessages([]);
    } else {
      setError("Only PDF files are supported.");
    }
  };

  const analyze = async () => {
    if (!file) return;
    setLoading(true);
    setError(null);
    setResult(null);
    setChatMessages([]);
    try {
      const form = new FormData();
      form.append("file", file);
      form.append("language", language);
      const res = await fetch(`${API}/analyze`, { method: "POST", body: form });
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      setResult(data);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  const sendChat = async () => {
    if (!chatInput.trim() || chatLoading) return;
    const q = chatInput.trim();
    setChatInput("");
    setChatMessages((prev) => [...prev, { role: "user", text: q }]);
    setChatLoading(true);
    try {
      const res = await fetch(`${API}/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question: q }),
      });
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      setChatMessages((prev) => [...prev, { role: "ai", text: data.answer }]);
    } catch (e) {
      setChatMessages((prev) => [...prev, { role: "ai", text: `Error: ${e.message}` }]);
    } finally {
      setChatLoading(false);
    }
  };

  const riskColor = (level) => {
    if (level === "red") return { bg: "#fff0ee", border: "#e05a3a", dot: "#e05a3a", text: "#7a2a15" };
    if (level === "yellow") return { bg: "#fffbea", border: "#d4a017", dot: "#d4a017", text: "#6b4c00" };
    return { bg: "#edfaf3", border: "#2eab6e", dot: "#2eab6e", text: "#0e5c32" };
  };

  if (screen === "landing") {
    return (
      <div style={{ minHeight: "100vh", background: "#0a0a0f", fontFamily: "'Georgia', serif", color: "#f0ece4", overflow: "hidden", position: "relative" }}>
        <style>{`
          @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,700;1,400&family=DM+Sans:wght@300;400;500&display=swap');
          .land-btn { transition: all 0.25s; }
          .land-btn:hover { background: #f0ece4 !important; color: #0a0a0f !important; transform: translateY(-2px); }
          .float { animation: floatAnim 6s ease-in-out infinite; }
          @keyframes floatAnim { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-12px)} }
          .fade-in { animation: fadeIn 1s ease forwards; }
          @keyframes fadeIn { from{opacity:0;transform:translateY(20px)} to{opacity:1;transform:translateY(0)} }
          .pill:hover { background: rgba(240,236,228,0.15) !important; cursor:default; }
        `}</style>

        {/* bg orbs */}
        <div style={{ position: "fixed", top: -200, left: -200, width: 600, height: 600, borderRadius: "50%", background: "radial-gradient(circle, rgba(180,140,80,0.12) 0%, transparent 70%)", pointerEvents: "none" }} />
        <div style={{ position: "fixed", bottom: -150, right: -150, width: 500, height: 500, borderRadius: "50%", background: "radial-gradient(circle, rgba(100,120,200,0.1) 0%, transparent 70%)", pointerEvents: "none" }} />

        {/* nav */}
        <nav style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "1.5rem 3rem", borderBottom: "0.5px solid rgba(240,236,228,0.1)" }}>
          <span style={{ fontFamily: "'Playfair Display', serif", fontSize: 22, letterSpacing: 1 }}>⚖ LegalEase</span>
          <button className="land-btn" onClick={() => setScreen("app")} style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 13, padding: "8px 20px", border: "0.5px solid rgba(240,236,228,0.4)", borderRadius: 100, background: "transparent", color: "#f0ece4", cursor: "pointer", letterSpacing: 0.5 }}>
            Open App →
          </button>
        </nav>

        {/* hero */}
        <div className="fade-in" style={{ maxWidth: 780, margin: "0 auto", padding: "7rem 2rem 4rem", textAlign: "center" }}>
          <div className="float" style={{ fontSize: 56, marginBottom: "1.5rem" }}>⚖️</div>
          <h1 style={{ fontFamily: "'Playfair Display', serif", fontSize: "clamp(2.8rem, 6vw, 4.5rem)", fontWeight: 700, lineHeight: 1.1, margin: "0 0 1.5rem", letterSpacing: -1 }}>
            Legal documents,<br />
            <span style={{ fontStyle: "italic", color: "#c9a85c" }}>finally</span> in plain language.
          </h1>
          <p style={{ fontFamily: "'DM Sans', sans-serif", fontWeight: 300, fontSize: 18, color: "rgba(240,236,228,0.65)", lineHeight: 1.7, maxWidth: 520, margin: "0 auto 2.5rem" }}>
            Upload any legal PDF. Get a plain-English summary, risk flags, regional language translation, and a chat assistant that answers your questions — instantly.
          </p>
          <button className="land-btn" onClick={() => setScreen("app")} style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 15, padding: "14px 36px", border: "0.5px solid #c9a85c", borderRadius: 100, background: "#c9a85c", color: "#0a0a0f", cursor: "pointer", fontWeight: 500, letterSpacing: 0.5 }}>
            Analyze a document →
          </button>
        </div>

        {/* pills */}
        <div style={{ display: "flex", justifyContent: "center", gap: 12, flexWrap: "wrap", padding: "0 2rem 5rem" }}>
          {["Rent Agreements", "Employment Contracts", "Court Notices", "Property Deeds", "NDAs", "FIR Copies"].map(t => (
            <span key={t} className="pill" style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 13, padding: "6px 16px", border: "0.5px solid rgba(240,236,228,0.2)", borderRadius: 100, background: "rgba(240,236,228,0.06)", color: "rgba(240,236,228,0.6)", transition: "all 0.2s" }}>{t}</span>
          ))}
        </div>

        {/* features */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 1, borderTop: "0.5px solid rgba(240,236,228,0.1)", borderLeft: "0.5px solid rgba(240,236,228,0.1)" }}>
          {[
            { icon: "📄", title: "Plain English Summary", desc: "Complex legalese broken down into 2-3 clear sentences." },
            { icon: "🚩", title: "Risk Flag Detection", desc: "Red flags and risky clauses highlighted before you sign." },
            { icon: "🌐", title: "8 Regional Languages", desc: "Summaries in Hindi, Tamil, Telugu, Kannada & more." },
            { icon: "💬", title: "Chat with Document", desc: "Ask anything about the document. Get instant answers." },
          ].map(f => (
            <div key={f.title} style={{ padding: "2.5rem 2rem", borderRight: "0.5px solid rgba(240,236,228,0.1)", borderBottom: "0.5px solid rgba(240,236,228,0.1)" }}>
              <div style={{ fontSize: 28, marginBottom: "1rem" }}>{f.icon}</div>
              <div style={{ fontFamily: "'Playfair Display', serif", fontSize: 17, marginBottom: "0.6rem" }}>{f.title}</div>
              <div style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 13, color: "rgba(240,236,228,0.5)", lineHeight: 1.6, fontWeight: 300 }}>{f.desc}</div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // APP SCREEN
  return (
    <div style={{ minHeight: "100vh", background: "#f7f5f0", fontFamily: "'DM Sans', sans-serif", color: "#1a1a1a" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,600;1,400&family=DM+Sans:wght@300;400;500&display=swap');
        .upload-zone { transition: all 0.2s; }
        .upload-zone:hover { border-color: #c9a85c !important; background: #fffdf7 !important; }
        .send-btn:hover { background: #b8943f !important; }
        .chat-bubble-user { animation: bubbleIn 0.2s ease; }
        .chat-bubble-ai { animation: bubbleIn 0.2s ease; }
        @keyframes bubbleIn { from{opacity:0;transform:translateY(6px)} to{opacity:1;transform:translateY(0)} }
        .tag { display:inline-block; padding:3px 10px; border-radius:100px; font-size:12px; font-weight:500; margin:2px; }
        .analyze-btn { transition: all 0.2s; }
        .analyze-btn:hover { background: #b8943f !important; transform: translateY(-1px); }
        .back-btn:hover { color: #c9a85c !important; }
      `}</style>

      {/* topbar */}
      <div style={{ background: "#0a0a0f", padding: "1rem 2rem", display: "flex", alignItems: "center", gap: "1rem" }}>
        <button className="back-btn" onClick={() => setScreen("landing")} style={{ background: "none", border: "none", color: "rgba(240,236,228,0.5)", cursor: "pointer", fontSize: 13, transition: "color 0.2s", padding: 0 }}>← back</button>
        <span style={{ fontFamily: "'Playfair Display', serif", color: "#f0ece4", fontSize: 18, letterSpacing: 0.5 }}>⚖ LegalEase</span>
        <span style={{ marginLeft: "auto", fontSize: 12, color: "rgba(240,236,228,0.3)", fontWeight: 300 }}>AI Legal Assistant</span>
      </div>

      <div style={{ maxWidth: 1100, margin: "0 auto", padding: "2rem 1.5rem", display: "grid", gridTemplateColumns: result ? "1fr 380px" : "1fr", gap: "1.5rem", alignItems: "start" }}>

        {/* LEFT PANEL */}
        <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>

          {/* upload card */}
          <div style={{ background: "#fff", borderRadius: 16, border: "0.5px solid #e8e2d9", padding: "1.5rem" }}>
            <div style={{ fontFamily: "'Playfair Display', serif", fontSize: 20, marginBottom: "1.25rem", color: "#1a1a1a" }}>Upload Document</div>

            <div
              className="upload-zone"
              onClick={() => fileRef.current.click()}
              onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
              onDragLeave={() => setDragOver(false)}
              onDrop={(e) => { e.preventDefault(); setDragOver(false); handleFile(e.dataTransfer.files[0]); }}
              style={{ border: `1.5px dashed ${dragOver ? "#c9a85c" : file ? "#c9a85c" : "#d4cfc7"}`, borderRadius: 12, padding: "2.5rem 1.5rem", textAlign: "center", cursor: "pointer", background: file ? "#fffdf7" : "#faf9f7", transition: "all 0.2s" }}
            >
              <input ref={fileRef} type="file" accept=".pdf" style={{ display: "none" }} onChange={(e) => handleFile(e.target.files[0])} />
              <div style={{ fontSize: 36, marginBottom: "0.75rem" }}>{file ? "📄" : "⬆️"}</div>
              {file ? (
                <>
                  <div style={{ fontWeight: 500, color: "#c9a85c", fontSize: 15 }}>{file.name}</div>
                  <div style={{ fontSize: 12, color: "#999", marginTop: 4 }}>{(file.size / 1024).toFixed(1)} KB · click to change</div>
                </>
              ) : (
                <>
                  <div style={{ fontWeight: 500, fontSize: 15, color: "#555" }}>Drop your PDF here</div>
                  <div style={{ fontSize: 12, color: "#aaa", marginTop: 4 }}>or click to browse</div>
                </>
              )}
            </div>

            {/* language + analyze */}
            <div style={{ display: "flex", gap: "1rem", marginTop: "1.25rem", alignItems: "center", flexWrap: "wrap" }}>
              <div style={{ flex: 1, minWidth: 160 }}>
                <label style={{ fontSize: 12, color: "#888", display: "block", marginBottom: 6 }}>Translate summary to</label>
                <select value={language} onChange={(e) => setLanguage(e.target.value)} style={{ width: "100%", padding: "9px 12px", borderRadius: 8, border: "0.5px solid #ddd", background: "#faf9f7", fontSize: 14, color: "#1a1a1a", outline: "none" }}>
                  {LANGUAGES.map(l => <option key={l}>{l}</option>)}
                </select>
              </div>
              <button className="analyze-btn" onClick={analyze} disabled={!file || loading} style={{ flex: 1, minWidth: 160, padding: "10px 20px", borderRadius: 8, border: "none", background: file && !loading ? "#c9a85c" : "#e0dbd3", color: file && !loading ? "#0a0a0f" : "#aaa", fontWeight: 500, fontSize: 14, cursor: file && !loading ? "pointer" : "not-allowed", marginTop: 22 }}>
                {loading ? "Analyzing…" : "Analyze Document →"}
              </button>
            </div>

            {error && <div style={{ marginTop: "1rem", padding: "10px 14px", background: "#fff0ee", border: "0.5px solid #e05a3a", borderRadius: 8, fontSize: 13, color: "#7a2a15" }}>⚠ {error}</div>}
          </div>

          {/* results */}
          {result && (
            <div style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>

              {/* summary */}
              <div style={{ background: "#fff", borderRadius: 16, border: "0.5px solid #e8e2d9", padding: "1.5rem" }}>
                <div style={{ fontFamily: "'Playfair Display', serif", fontSize: 18, marginBottom: "0.75rem" }}>Summary</div>
                <p style={{ fontSize: 15, lineHeight: 1.7, color: "#333", margin: 0 }}>{result.summary}</p>
                {result.translated_summary && (
                  <div style={{ marginTop: "1rem", padding: "12px 14px", background: "#f7f5f0", borderRadius: 8, borderLeft: "3px solid #c9a85c" }}>
                    <div style={{ fontSize: 11, color: "#999", marginBottom: 4, textTransform: "uppercase", letterSpacing: 0.5 }}>{language}</div>
                    <p style={{ fontSize: 14, margin: 0, lineHeight: 1.7, color: "#444" }}>{result.translated_summary}</p>
                  </div>
                )}
              </div>

              {/* entities */}
              {result.entities && (
                <div style={{ background: "#fff", borderRadius: 16, border: "0.5px solid #e8e2d9", padding: "1.5rem" }}>
                  <div style={{ fontFamily: "'Playfair Display', serif", fontSize: 18, marginBottom: "1rem" }}>Key Entities</div>
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: "1rem" }}>
                    {[
                      { label: "👤 Names", key: "names", color: "#eef1ff", tc: "#3a4ab0" },
                      { label: "📅 Dates", key: "dates", color: "#edfaf3", tc: "#0e5c32" },
                      { label: "💰 Amounts", key: "amounts", color: "#fffbea", tc: "#6b4c00" },
                      { label: "📍 Locations", key: "locations", color: "#fff0ee", tc: "#7a2a15" },
                    ].map(({ label, key, color, tc }) => (
                      result.entities[key]?.length > 0 && (
                        <div key={key} style={{ background: color, borderRadius: 10, padding: "0.875rem" }}>
                          <div style={{ fontSize: 12, fontWeight: 500, color: tc, marginBottom: "0.5rem" }}>{label}</div>
                          <div style={{ display: "flex", flexWrap: "wrap", gap: 4 }}>
                            {result.entities[key].map((v, i) => (
                              <span key={i} className="tag" style={{ background: "rgba(255,255,255,0.7)", color: tc }}>{v}</span>
                            ))}
                          </div>
                        </div>
                      )
                    ))}
                  </div>
                </div>
              )}

              {/* risk flags */}
              {result.risk_flags?.length > 0 && (
                <div style={{ background: "#fff", borderRadius: 16, border: "0.5px solid #e8e2d9", padding: "1.5rem" }}>
                  <div style={{ fontFamily: "'Playfair Display', serif", fontSize: 18, marginBottom: "1rem" }}>Risk Flags</div>
                  <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
                    {result.risk_flags.map((flag, i) => {
                      const c = riskColor(flag.level);
                      return (
                        <div key={i} style={{ background: c.bg, border: `0.5px solid ${c.border}`, borderRadius: 10, padding: "0.875rem 1rem", display: "flex", gap: "0.75rem", alignItems: "flex-start" }}>
                          <div style={{ width: 8, height: 8, borderRadius: "50%", background: c.dot, marginTop: 5, flexShrink: 0 }} />
                          <div>
                            <div style={{ fontWeight: 500, fontSize: 14, color: c.text, marginBottom: 2 }}>{flag.clause}</div>
                            <div style={{ fontSize: 13, color: c.text, opacity: 0.8, lineHeight: 1.5 }}>{flag.explanation}</div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* RIGHT PANEL — CHAT */}
        {result && (
          <div style={{ background: "#fff", borderRadius: 16, border: "0.5px solid #e8e2d9", display: "flex", flexDirection: "column", height: "calc(100vh - 140px)", position: "sticky", top: "1.5rem" }}>
            <div style={{ padding: "1.25rem 1.5rem", borderBottom: "0.5px solid #e8e2d9" }}>
              <div style={{ fontFamily: "'Playfair Display', serif", fontSize: 18 }}>Ask the Document</div>
              <div style={{ fontSize: 12, color: "#aaa", marginTop: 2 }}>Chat with your uploaded PDF</div>
            </div>

            {/* messages */}
            <div style={{ flex: 1, overflowY: "auto", padding: "1.25rem", display: "flex", flexDirection: "column", gap: "1rem" }}>
              {chatMessages.length === 0 && (
                <div style={{ textAlign: "center", padding: "2rem 1rem" }}>
                  <div style={{ fontSize: 32, marginBottom: "0.75rem" }}>💬</div>
                  <div style={{ fontSize: 13, color: "#bbb", lineHeight: 1.6 }}>Ask anything about<br />your document</div>
                  <div style={{ display: "flex", flexDirection: "column", gap: 8, marginTop: "1.5rem" }}>
                    {["What are the main obligations?", "Is there a penalty clause?", "When does this contract expire?"].map(q => (
                      <button key={q} onClick={() => { setChatInput(q); }} style={{ background: "#f7f5f0", border: "0.5px solid #e8e2d9", borderRadius: 8, padding: "8px 12px", fontSize: 12, color: "#666", cursor: "pointer", textAlign: "left", transition: "all 0.15s" }}>{q}</button>
                    ))}
                  </div>
                </div>
              )}
              {chatMessages.map((m, i) => (
                <div key={i} className={m.role === "user" ? "chat-bubble-user" : "chat-bubble-ai"} style={{ display: "flex", justifyContent: m.role === "user" ? "flex-end" : "flex-start" }}>
                  <div style={{ maxWidth: "82%", padding: "10px 14px", borderRadius: m.role === "user" ? "14px 14px 2px 14px" : "14px 14px 14px 2px", background: m.role === "user" ? "#0a0a0f" : "#f7f5f0", color: m.role === "user" ? "#f0ece4" : "#1a1a1a", fontSize: 13, lineHeight: 1.6 }}>
                    {m.text}
                  </div>
                </div>
              ))}
              {chatLoading && (
                <div style={{ display: "flex", justifyContent: "flex-start" }}>
                  <div style={{ padding: "10px 16px", borderRadius: "14px 14px 14px 2px", background: "#f7f5f0", fontSize: 18, letterSpacing: 2 }}>···</div>
                </div>
              )}
              <div ref={chatEndRef} />
            </div>

            {/* input */}
            <div style={{ padding: "1rem 1.25rem", borderTop: "0.5px solid #e8e2d9", display: "flex", gap: "0.75rem", alignItems: "center" }}>
              <input
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && sendChat()}
                placeholder="Ask a question…"
                style={{ flex: 1, padding: "10px 14px", borderRadius: 8, border: "0.5px solid #ddd", background: "#faf9f7", fontSize: 13, outline: "none", color: "#1a1a1a" }}
              />
              <button className="send-btn" onClick={sendChat} disabled={!chatInput.trim() || chatLoading} style={{ padding: "10px 16px", borderRadius: 8, border: "none", background: "#c9a85c", color: "#0a0a0f", fontWeight: 500, fontSize: 13, cursor: "pointer", whiteSpace: "nowrap", transition: "background 0.2s" }}>
                Send →
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}