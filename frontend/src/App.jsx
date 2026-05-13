const handleAnalyze = async () => {
    if (!file) return alert("Please upload a document!");
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const toBase64 = (file) => new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => resolve(reader.result.split(",")[1]);
        reader.onerror = reject;
      });

      const base64 = await toBase64(file);

      const res = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=AIzaSyBCTsCNkRhDTIeXI8h0d8yZ6oc2maUFv98`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            contents: [{
              parts: [
                { text: `You are LegalEase, an AI legal assistant for everyday Indians.
Analyze this legal document and return ONLY this JSON:
{
  "summary": "2-3 sentence plain English summary",
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
Return ONLY JSON. No markdown. No extra text.` },
                { inline_data: { mime_type: file.type || "image/jpeg", data: base64 } }
              ]
            }]
          })
        }
      );

      const data = await res.json();
      console.log("Response:", data);

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