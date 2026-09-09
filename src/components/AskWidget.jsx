import { useState } from "react";
import { MessageCircleQuestion, X, Send } from "lucide-react";
import { supabase, supabaseUrlForFunctions, supabaseAnonKeyForFunctions } from "../lib/supabaseClient";

const MAX_QUESTION_LENGTH = 300;
const FUNCTION_URL = supabaseUrlForFunctions ? `${supabaseUrlForFunctions}/functions/v1/ask-portfolio` : null;

// Grounded Q&A over this site's own Projects/Skills/Experience data — see
// supabase/functions/ask-portfolio/index.ts for the retrieval + prompt
// design and the full explanation of what data is sent and why.
function AskWidget() {
  const [open, setOpen] = useState(false);
  const [question, setQuestion] = useState("");
  const [status, setStatus] = useState({ state: "idle" }); // idle | loading | answered | error

  if (!supabase || !FUNCTION_URL) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    const trimmed = question.trim();
    if (!trimmed) return;

    setStatus({ state: "loading" });

    try {
      const res = await fetch(FUNCTION_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          apikey: supabaseAnonKeyForFunctions,
          Authorization: `Bearer ${supabaseAnonKeyForFunctions}`,
        },
        body: JSON.stringify({ question: trimmed }),
      });

      const data = await res.json().catch(() => null);

      if (!res.ok) {
        setStatus({ state: "error", message: data?.error ?? "Something went wrong — try again." });
        return;
      }

      setStatus({ state: "answered", answer: data.answer, grounded: data.grounded });
    } catch {
      setStatus({ state: "error", message: "Couldn't reach the AI service — check your connection and try again." });
    }
  };

  const handleReset = () => {
    setQuestion("");
    setStatus({ state: "idle" });
  };

  return (
    <div className={`ask-widget ${open ? "is-open" : ""}`}>
      {open ? (
        <div className="ask-widget-panel holo-card">
          <div className="holo-card-inner">
            <div className="ask-widget-header">
              <p className="tx-endpoint-text">ASK — GROUNDED IN MY PORTFOLIO</p>
              <button type="button" className="ask-widget-close" onClick={() => setOpen(false)} aria-label="Close">
                <X size={16} />
              </button>
            </div>

            <form className="ask-widget-form" onSubmit={handleSubmit}>
              <textarea
                className="ask-widget-input"
                rows={2}
                maxLength={MAX_QUESTION_LENGTH}
                placeholder="e.g. What's your experience with Django?"
                value={question}
                onChange={(e) => setQuestion(e.target.value)}
                disabled={status.state === "loading"}
              />
              <div className="ask-widget-actions">
                <span className="admin-char-count">{question.length} / {MAX_QUESTION_LENGTH}</span>
                <button type="submit" className="establish-btn" disabled={status.state === "loading" || !question.trim()}>
                  {status.state === "loading" ? "ASKING…" : (<><Send size={14} /> ASK</>)}
                </button>
              </div>
            </form>

            {status.state === "answered" && (
              <div className="ask-widget-answer">
                <p>{status.answer}</p>
                <button type="button" className="ask-widget-reset" onClick={handleReset}>Ask another question</button>
              </div>
            )}

            {status.state === "error" && (
              <p className="tx-status-line tx-status-fail">✗ {status.message}</p>
            )}
          </div>
        </div>
      ) : (
        <button type="button" className="ask-widget-launcher" onClick={() => setOpen(true)}>
          <span className="ask-widget-dot" />
          <MessageCircleQuestion size={18} />
          <span>Ask about my work</span>
        </button>
      )}
    </div>
  );
}

export default AskWidget;
