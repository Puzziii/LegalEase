import { useState } from "react";

export default function App() {
  const [file, setFile] = useState(null);
  const [language, setLanguage] = useState("Hindi");
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const toBase64 = (file) => new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result.split(",")[1]);
    reader.onerror = reject;
  });

  const handleAnalyze = async () => {
    if (!file) return alert("Please upload a document!");
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const base64 = await toBase64(file);

      const prompt = `You are LegalEase, an AI legal assistant for everyday Indians who cannot afford lawyers.
Analyze this legal document and return ONLY this JSON, nothing else:
{
  "summary": "2-3 sentence plain English summary anyone can understand",
  "entities": {
    "names": [],
    "dates": [],
    "amounts": [],
    "locations": []
  },
  "risk_flags": [
    {
      "level": "red",
      "clause": "clause title",
      "explanation": "one line plain explanation"
    }
  ],
  "translated_summary": "summary translated to ${language}"
}
Focus on Indian legal context. Flag clauses unfair to common people.
Return ONLY JSON. No markdown. No extra text.`;

      const res = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=PASTE_YOUR_GEMINI_KEY_HERE`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            contents: [{
              parts: [
                { text: prompt },
                { inline_data: { mime_type: file.type || "image/jpeg", data: base64 } }
              ]
            }]
          })
        }
      );

      const data = await res.json();

      if (data.error) {
        setError("API Error: " + data.error.message);
        return;
      }

      let text = data.candidates[0].content.parts[0].text;
      text = text.replace(/```json|```/g, "").trim();
      const parsed = JSON.parse(text);
      setResult(parsed);
    } catch (err) {
      console.error(err);
      setError("Something went wrong: " + err.message);
    }
    setLoading(false);
  };

  const speak = (text) => {
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    const langMap = {
      "Hindi": "hi-IN", "Telugu": "te-IN", "Tamil": "ta-IN",
      "Kannada": "kn-IN", "Malayalam": "ml-IN", "Bengali": "bn-IN",
      "Marathi": "mr-IN", "Gujarati": "gu-IN", "Punjabi": "pa-IN", "Odia": "or-IN"
    };
    utterance.lang = langMap[language] || "hi-IN";
    utterance.rate = 0.9;
    window.speechSynthesis.speak(utterance);
  };

  return (
    <div style={{ maxWidth: "800px", margin: "0 auto", padding: "20px", fontFamily: "sans-serif" }}>
      <div style={{ textAlign: "center", marginBottom: "30px" }}>
        <h1 style={{ fontSize: "2.5rem", color: "#1a1a2e" }}>⚖️ LegalEase</h1>
        <p style={{ color: "#555", fontSize: "1.1rem" }}>
          Legal documents are written for lawyers. We built this for everyone else.
        </p>
      </div>

      <div style={{ border: "2px dashed #ccc", padding: "30px", borderRadius: "12px", marginBottom: "20px", textAlign: "center" }}>
        <input type="file" accept="image/*,.pdf" onChange={(e) => setFile(e.target.files[0])} />
        {file && <p style={{ color: "green", marginTop: "10px" }}>✅ {file.name} selected</p>}
      </div>

      <div style={{ display: "flex", gap: "10px", marginBottom: "20px", alignItems: "center" }}>
        <select value={language} onChange={(e) => setLanguage(e.target.value)}
          style={{ padding: "10px", borderRadius: "8px", border: "1px solid #ccc", fontSize: "1rem" }}>
          <option>Hindi</option><option>Telugu</option><option>Tamil</option>
          <option>Kannada</option><option>Malayalam</option><option>Bengali</option>
          <option>Marathi</option><option>Gujarati</option><option>Punjabi</option><option>Odia</option>
        </select>

        <button onClick={handleAnalyze} disabled={loading}
          style={{
            padding: "10px 25px", background: loading ? "#ccc" : "#1a1a2e",
            color: "white", border: "none", borderRadius: "8px",
            cursor: loading ? "not-allowed" : "pointer", fontSize: "1rem"
          }}>
          {loading ? "⏳ Analyzing..." : "🔍 Analyze Document"}
        </button>
      </div>

      {error && (
        <div style={{ background: "#ffe0e0", padding: "15px", borderRadius: "8px", color: "red", marginBottom: "20px" }}>
          ❌ {error}
        </div>
      )}

      {result && (
        <div style={{ marginTop: "30px" }}>
          <div style={{ background: "#f8f9fa", padding: "20px", borderRadius: "12px", marginBottom: "20px" }}>
            <h2 style={{ color: "#1a1a2e" }}>📋 Summary</h2>
            <p style={{ fontSize: "1.1rem", lineHeight: "1.6" }}>{result.summary}</p>
          </div>

          <div style={{ background: "#e8f4fd", padding: "20px", borderRadius: "12px", marginBottom: "20px" }}>
            <h2 style={{ color: "#1a1a2e" }}>🌐 Translation ({language})</h2>
            <p style={{ fontSize: "1.1rem", lineHeight: "1.6" }}>{result.translated_summary}</p>
            <button onClick={() => speak(result.translated_summary)}
              style={{ marginTop: "10px", padding: "8px 20px", background: "#0077b6", color: "white", border: "none", borderRadius: "8px", cursor: "pointer" }}>
              🔊 Listen in {language}
            </button>
          </div>

          <div style={{ marginBottom: "20px" }}>
            <h2 style={{ color: "#1a1a2e" }}>🔍 Entities Found</h2>
            <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
              {Object.entries(result.entities).map(([key, values]) => (
                <div key={key} style={{ background: "#fff3cd", padding: "12px", borderRadius: "8px", minWidth: "150px" }}>
                  <strong style={{ textTransform: "uppercase", fontSize: "0.8rem" }}>{key}</strong>
                  <ul style={{ margin: "5px 0 0", paddingLeft: "15px" }}>
                    {values.length > 0 ? values.map((v, i) => <li key={i}>{v}</li>) : <li style={{ color: "#999" }}>None found</li>}
                  </ul>
                </div>
              ))}
            </div>
          </div>

          <div style={{ marginBottom: "20px" }}>
            <h2 style={{ color: "#1a1a2e" }}>⚠️ Risk Flags</h2>
            {result.risk_flags.map((flag, i) => (
              <div key={i} style={{
                padding: "15px", borderRadius: "8px", marginBottom: "10px",
                background: flag.level === "red" ? "#ffe0e0" : flag.level === "yellow" ? "#fff9c4" : "#e0ffe0",
                borderLeft: `5px solid ${flag.level === "red" ? "#e63946" : flag.level === "yellow" ? "#f4a261" : "#2a9d8f"}`
              }}>
                <strong>{flag.level === "red" ? "🔴" : flag.level === "yellow" ? "🟡" : "🟢"} {flag.clause}</strong>
                <p style={{ margin: "5px 0 0", color: "#333" }}>{flag.explanation}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
