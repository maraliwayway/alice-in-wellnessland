"use client";

import React, { useState, useRef, useEffect } from "react";

interface Goal {
  id: string;
  overview: string;
  strategies: string;
  acceptanceCriteria: string[];
  checkedCriteria: boolean[];
  completed: boolean;
  createdAt: string;
}

interface Message {
  role: "user" | "assistant";
  content: string;
}

// Renders inline markdown: **bold**, *italic*, ***bold-italic***
function renderInline(text: string): React.ReactNode {
  const parts: React.ReactNode[] = [];
  const regex = /(\*\*\*(.+?)\*\*\*|\*\*(.+?)\*\*|\*(.+?)\*)/g;
  let last = 0;
  let match;
  let key = 0;
  while ((match = regex.exec(text)) !== null) {
    if (match.index > last) parts.push(text.slice(last, match.index));
    if (match[2]) parts.push(<strong key={key++}><em>{match[2]}</em></strong>);
    else if (match[3]) parts.push(<strong key={key++}>{match[3]}</strong>);
    else if (match[4]) parts.push(<em key={key++}>{match[4]}</em>);
    last = match.index + match[0].length;
  }
  if (last < text.length) parts.push(text.slice(last));
  return parts.length === 1 && typeof parts[0] === 'string' ? parts[0] : <>{...parts}</>;
}

export default function GoalsPage() {
  const [goals, setGoals] = useState<Goal[]>([]);
  const [view, setView] = useState<"list" | "form" | "detail">("list");
  const [selectedGoal, setSelectedGoal] = useState<Goal | null>(null);

  // Form state
  const [formOverview, setFormOverview] = useState("");
  const [formStrategies, setFormStrategies] = useState("");
  const [formCriteria, setFormCriteria] = useState("");
  const [formError, setFormError] = useState("");
  const [formLoading, setFormLoading] = useState(false);

  // Chatbot state
  const [chatOpen, setChatOpen] = useState(false);
  const [chatFullscreen, setChatFullscreen] = useState(false);
  const [chatMessages, setChatMessages] = useState<Message[]>([]);
  const [chatInput, setChatInput] = useState("");
  const [chatLoading, setChatLoading] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const saved = localStorage.getItem("wellness_goals");
    if (saved) setGoals(JSON.parse(saved));
  }, []);

  useEffect(() => {
    localStorage.setItem("wellness_goals", JSON.stringify(goals));
  }, [goals]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chatMessages]);

  const resetForm = () => {
    setFormOverview("");
    setFormStrategies("");
    setFormCriteria("");
    setFormError("");
  };

  const handleSubmitGoal = async () => {
    setFormError("");
    if (!formOverview.trim() || !formStrategies.trim() || !formCriteria.trim()) {
      setFormError("Please fill in all fields.");
      return;
    }

    const criteriaLines = formCriteria
      .split("\n")
      .map((l) => l.trim())
      .filter(Boolean);

    if (criteriaLines.length === 0) {
      setFormError("Please enter at least one acceptance criterion.");
      return;
    }

    setFormLoading(true);
    try {
      const res = await fetch("/api/goals/validate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          overview: formOverview.trim(),
          strategies: formStrategies.trim(),
          criteriaLines,
        }),
      });

      const result = await res.json();

      if (!res.ok) {
        setFormError(`Error: ${result.error}`);
        setFormLoading(false);
        return;
      }

      if (!result.isSmartGoal || !result.isCriteriaSpecific) {
        setFormError(
          `Validation failed: ${result.feedback} Please revise your goal to be SMART (Specific, Measurable, Achievable, Relevant, Time-bound) and ensure acceptance criteria are specific.`
        );
        setFormLoading(false);
        return;
      }

      const newGoal: Goal = {
        id: Date.now().toString(),
        overview: formOverview.trim(),
        strategies: formStrategies.trim(),
        acceptanceCriteria: criteriaLines,
        checkedCriteria: criteriaLines.map(() => false),
        completed: false,
        createdAt: new Date().toLocaleDateString(),
      };

      setGoals((prev) => [newGoal, ...prev]);
      resetForm();
      setView("list");
    } catch (e) {
      setFormError(`Error validating goal: ${(e as Error).message}`);
    } finally {
      setFormLoading(false);
    }
  };

  const toggleCriterion = (goalId: string, idx: number) => {
    setGoals((prev) =>
      prev.map((g) => {
        if (g.id !== goalId) return g;
        const checked = [...g.checkedCriteria];
        checked[idx] = !checked[idx];
        const completed = checked.every(Boolean);
        const updated = { ...g, checkedCriteria: checked, completed };
        if (selectedGoal?.id === goalId) setSelectedGoal(updated);
        return updated;
      })
    );
  };

  const deleteGoal = (id: string) => {
    setGoals((prev) => prev.filter((g) => g.id !== id));
    if (selectedGoal?.id === id) {
      setSelectedGoal(null);
      setView("list");
    }
  };

  const openGoalDetail = (goal: Goal) => {
    setSelectedGoal(goal);
    setView("detail");
  };

  // Sync selectedGoal with goals state
  useEffect(() => {
    if (selectedGoal) {
      const updated = goals.find((g) => g.id === selectedGoal.id);
      if (updated) setSelectedGoal(updated);
    }
  }, [goals]);

  const handleChatSend = async () => {
    if (!chatInput.trim() || chatLoading) return;

    const goalsContext =
      goals.length > 0
        ? `Here are the user's current goals:\n\n${goals
          .map(
            (g, i) =>
              `Goal ${i + 1}: ${g.overview}\nStrategies: ${g.strategies}\nAcceptance Criteria: ${g.acceptanceCriteria.join("; ")}\nProgress: ${g.checkedCriteria.filter(Boolean).length}/${g.checkedCriteria.length} criteria met\nStatus: ${g.completed ? "Completed" : "In Progress"}`
          )
          .join("\n\n")}`
        : "The user has no goals set yet.";

    const userMsg: Message = { role: "user", content: chatInput };
    const newMessages: Message[] = [...chatMessages, userMsg];
    setChatMessages(newMessages);
    setChatInput("");
    setChatLoading(true);

    try {
      // Map client Message shape → API route shape ({ role, text })
      const apiMessages = newMessages.map((m) => ({
        role: m.role === "assistant" ? ("model" as const) : ("user" as const),
        text: m.content,
      }));

      const res = await fetch("/api/goals/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: apiMessages, goalsContext }),
      });

      const data = await res.json();

      if (!res.ok) {
        setChatMessages([...newMessages, { role: "assistant", content: `Error: ${data.error}` }]);
        return;
      }

      setChatMessages([...newMessages, { role: "assistant", content: data.reply }]);
    } catch (e) {
      setChatMessages([
        ...newMessages,
        { role: "assistant", content: `Sorry, I encountered an error: ${(e as Error).message}` },
      ]);
    } finally {
      setChatLoading(false);
    }
  };

  const activeGoals = goals.filter((g) => !g.completed);
  const finishedGoals = goals.filter((g) => g.completed);

  return (
    <div className="min-h-screen relative" style={{ fontFamily: "var(--font-alice), serif" }}>
      {/* Background base */}
      <div className="fixed inset-0 z-0 bg-[#0a1428]" />
      {/* Hourglass accent — right side, blending in */}
      <img
        src="/goalsbg.jpg"
        alt=""
        aria-hidden
        className="fixed z-0 pointer-events-none"
        style={{
          right: "-5%",
          top: "50%",
          transform: "translateY(-50%)",
          height: "90vh",
          width: "auto",
          objectFit: "contain",
          opacity: 0.7,
          filter: "saturate(0.85) brightness(1.15)",
          maskImage: "radial-gradient(ellipse 70% 70% at 60% 50%, black 30%, transparent 75%)",
          WebkitMaskImage: "radial-gradient(ellipse 70% 70% at 60% 50%, black 30%, transparent 75%)",
        }}
      />
      {/* Content overlay */}
      <div className="relative z-10 min-h-screen flex flex-col justify-center">
      <main className="max-w-2xl px-6 py-8 ml-8 lg:ml-16">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-1">
            <h1
              className="font-bold"
              style={{
                fontFamily: "var(--font-alice), serif",
                fontSize: "3.5rem",
                color: "#e0f4ff",
                textShadow: "0 2px 8px rgba(0,0,0,0.3)",
              }}
            >
              The Queen&apos;s Quest
            </h1>
            <div className="flex items-center gap-3">
              {view === "list" && (
                <button
                  onClick={() => { resetForm(); setView("form"); }}
                  className="bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors"
                >
                  + New Goal
                </button>
              )}
              {view !== "list" && (
                <button
                  onClick={() => setView("list")}
                  className="text-sm text-blue-300/60 hover:text-blue-200"
                >
                  ← Back
                </button>
              )}
            </div>
          </div>
          <p className="text-sm" style={{ color: "rgba(224,244,255,0.65)" }}>Track your SMART goals and progress</p>
        </div>
        {/* FORM VIEW */}
        {view === "form" && (
          <div className="bg-[rgba(10,20,40,0.65)] backdrop-blur-xl rounded-xl border border-blue-400/15 p-6">
            <h2 className="text-lg font-semibold text-blue-100 mb-1">Create a New Goal</h2>
            <p className="text-sm text-blue-300/50 mb-6">
              Your goal will be validated by AI to ensure it&apos;s SMART (Specific, Measurable, Achievable, Relevant, Time-bound).
            </p>

            <div className="space-y-5">
              <div>
                <label className="block text-sm font-medium text-blue-200 mb-1.5">
                  Goal Overview
                </label>
                <textarea
                  value={formOverview}
                  onChange={(e) => setFormOverview(e.target.value)}
                  placeholder="e.g. Run a 5K in under 30 minutes by June 30, 2025, by training 3x per week."
                  rows={3}
                  className="w-full border border-blue-400/20 bg-[rgba(5,15,35,0.5)] rounded-lg px-3 py-2 text-sm text-blue-100 placeholder-blue-300/30 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-blue-200 mb-1.5">
                  Strategies
                </label>
                <textarea
                  value={formStrategies}
                  onChange={(e) => setFormStrategies(e.target.value)}
                  placeholder="e.g. Follow a couch-to-5K training plan, run Monday/Wednesday/Friday mornings, track runs with Garmin app."
                  rows={3}
                  className="w-full border border-blue-400/20 bg-[rgba(5,15,35,0.5)] rounded-lg px-3 py-2 text-sm text-blue-100 placeholder-blue-300/30 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-blue-200 mb-1.5">
                  Acceptance Criteria
                </label>
                <p className="text-xs text-blue-300/40 mb-2">
                  Enter one criterion per line. These become checkboxes to track your completion.
                </p>
                <textarea
                  value={formCriteria}
                  onChange={(e) => setFormCriteria(e.target.value)}
                  placeholder={`Complete at least 24 training runs\nFinish a 5K race officially timed\nAchieve a finish time under 30:00`}
                  rows={5}
                  className="w-full border border-blue-400/20 bg-[rgba(5,15,35,0.5)] rounded-lg px-3 py-2 text-sm text-blue-100 placeholder-blue-300/30 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                />
              </div>

              {formError && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                  <p className="text-sm text-red-700">{formError}</p>
                </div>
              )}

              <div className="flex gap-3 pt-1">
                <button
                  onClick={handleSubmitGoal}
                  disabled={formLoading}
                  className="bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white text-sm font-medium px-5 py-2.5 rounded-lg transition-colors flex items-center gap-2"
                >
                  {formLoading ? (
                    <>
                      <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                      </svg>
                      Validating with AI...
                    </>
                  ) : (
                    "Submit Goal"
                  )}
                </button>
                <button
                  onClick={() => { resetForm(); setView("list"); }}
                  className="text-sm text-blue-300/50 hover:text-blue-200 px-4 py-2.5"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}

        {/* DETAIL VIEW */}
        {view === "detail" && selectedGoal && (
          <div className="bg-[rgba(10,20,40,0.65)] backdrop-blur-xl rounded-xl border border-blue-400/15 p-6">
            <div className="flex items-start justify-between mb-4">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  {selectedGoal.completed && (
                    <span className="bg-green-100 text-green-700 text-xs font-medium px-2 py-0.5 rounded-full">
                      ✓ Completed
                    </span>
                  )}
                  <span className="text-xs text-blue-300/40">Created {selectedGoal.createdAt}</span>
                </div>
                <h2 className="text-lg font-semibold text-blue-50">{selectedGoal.overview}</h2>
              </div>
              <button
                onClick={() => deleteGoal(selectedGoal.id)}
                className="text-red-400 hover:text-red-600 text-sm ml-4 shrink-0"
              >
                Delete
              </button>
            </div>

            <div className="mb-5">
              <h3 className="text-sm font-medium text-blue-200 mb-1">Strategies</h3>
              <p className="text-sm text-blue-200/70 bg-blue-950/20 rounded-lg p-3">{selectedGoal.strategies}</p>
            </div>

            <div>
              <h3 className="text-sm font-medium text-blue-200 mb-2">
                Acceptance Criteria
                <span className="ml-2 text-blue-300/40 font-normal">
                  ({selectedGoal.checkedCriteria.filter(Boolean).length}/{selectedGoal.checkedCriteria.length} met)
                </span>
              </h3>

              {/* Progress bar */}
              <div className="w-full bg-blue-900/30 rounded-full h-2 mb-4">
                <div
                  className="bg-blue-500 h-2 rounded-full transition-all"
                  style={{
                    width: `${selectedGoal.checkedCriteria.length > 0
                        ? (selectedGoal.checkedCriteria.filter(Boolean).length /
                          selectedGoal.checkedCriteria.length) *
                        100
                        : 0
                      }%`,
                  }}
                />
              </div>

              <div className="space-y-2">
                {selectedGoal.acceptanceCriteria.map((criterion, idx) => (
                  <label
                    key={idx}
                    className="flex items-start gap-3 cursor-pointer group"
                  >
                    <input
                      type="checkbox"
                      checked={selectedGoal.checkedCriteria[idx] ?? false}
                      onChange={() => toggleCriterion(selectedGoal.id, idx)}
                      className="mt-0.5 h-4 w-4 rounded border-blue-400/30 bg-transparent text-blue-600 focus:ring-blue-500 cursor-pointer"
                    />
                    <span
                      className={`text-sm transition-colors ${selectedGoal.checkedCriteria[idx]
                          ? "line-through text-blue-300/40"
                          : "text-blue-200"
                        }`}
                    >
                      {criterion}
                    </span>
                  </label>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* LIST VIEW */}
        {view === "list" && (
          <div className="space-y-8">
            {/* Active Goals */}
            <div>
              <h2 className="text-sm font-semibold text-blue-300/50 uppercase tracking-wider mb-3">
                Active Goals ({activeGoals.length})
              </h2>
              {activeGoals.length === 0 ? (
                <div className="bg-[rgba(10,20,40,0.4)] border border-dashed border-blue-400/20 rounded-xl p-8 text-center">
                  <p className="text-blue-300/40 text-sm">No active goals yet.</p>
                  <button
                    onClick={() => { resetForm(); setView("form"); }}
                    className="mt-3 text-blue-600 hover:text-blue-700 text-sm font-medium"
                  >
                    Create your first goal →
                  </button>
                </div>
              ) : (
                <div className="space-y-3">
                  {activeGoals.map((goal) => {
                    const progress =
                      goal.checkedCriteria.length > 0
                        ? Math.round(
                          (goal.checkedCriteria.filter(Boolean).length /
                            goal.checkedCriteria.length) *
                          100
                        )
                        : 0;
                    return (
                      <div
                        key={goal.id}
                        onClick={() => openGoalDetail(goal)}
                        className="bg-[rgba(10,20,40,0.55)] backdrop-blur-lg border border-blue-400/15 rounded-xl p-4 cursor-pointer hover:border-blue-400/35 hover:shadow-lg hover:shadow-blue-500/10 transition-all"
                      >
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-blue-50 truncate">{goal.overview}</p>
                            <p className="text-xs text-blue-300/40 mt-0.5">{goal.createdAt}</p>
                          </div>
                          <span className="text-xs text-blue-600 font-medium shrink-0">{progress}%</span>
                        </div>
                        <div className="mt-3 w-full bg-blue-900/30 rounded-full h-1.5">
                          <div
                            className="bg-blue-500 h-1.5 rounded-full transition-all"
                            style={{ width: `${progress}%` }}
                          />
                        </div>
                        <p className="text-xs text-blue-300/40 mt-2">
                          {goal.checkedCriteria.filter(Boolean).length}/{goal.checkedCriteria.length} criteria met
                        </p>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Finished Goals */}
            {finishedGoals.length > 0 && (
              <div>
                <h2 className="text-sm font-semibold text-blue-300/50 uppercase tracking-wider mb-3">
                  Completed Goals ({finishedGoals.length})
                </h2>
                <div className="space-y-3">
                  {finishedGoals.map((goal) => (
                    <div
                      key={goal.id}
                      onClick={() => openGoalDetail(goal)}
                      className="bg-green-50 border border-green-200 rounded-xl p-4 cursor-pointer hover:border-green-300 transition-all"
                    >
                      <div className="flex items-center gap-2">
                        <span className="text-green-500 text-sm">✓</span>
                        <p className="text-sm font-medium text-blue-200 truncate">{goal.overview}</p>
                      </div>
                      <p className="text-xs text-blue-300/40 mt-1 ml-5">{goal.createdAt} · All criteria met</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </main>

      {/* ===== CHATBOT ===== */}

      {/* Chat Button */}
      {!chatOpen && (
        <button
          onClick={() => setChatOpen(true)}
          className="fixed bottom-6 right-6 bg-blue-600 hover:bg-blue-700 text-white w-14 h-14 rounded-full shadow-lg flex items-center justify-center transition-colors z-50"
          title="Open Goal Coach"
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-6 h-6">
            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
          </svg>
        </button>
      )}

      {/* Chat Panel */}
      {chatOpen && (
        <div
          className={`fixed z-50 bg-[rgba(10,20,40,0.9)] backdrop-blur-xl border border-blue-400/20 shadow-xl flex flex-col transition-all
            ${chatFullscreen
              ? "inset-0 rounded-none"
              : "bottom-6 right-6 w-80 sm:w-96 h-[520px] rounded-xl"
            }`}
        >
          {/* Chat Header */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-blue-400/10 shrink-0">
            <div>
              <p className="text-sm font-semibold text-blue-50">Goal Coach</p>
              <p className="text-xs text-blue-300/40">Ask Gemini for advice on your goals</p>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setChatFullscreen(!chatFullscreen)}
                className="text-blue-300/40 hover:text-blue-200/70 p-1"
                title={chatFullscreen ? "Minimize" : "Fullscreen"}
              >
                {chatFullscreen ? (
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4">
                    <path d="M8 3v3a2 2 0 0 1-2 2H3m18 0h-3a2 2 0 0 1-2-2V3m0 18v-3a2 2 0 0 1 2-2h3M3 16h3a2 2 0 0 1 2 2v3" />
                  </svg>
                ) : (
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4">
                    <path d="M8 3H5a2 2 0 0 0-2 2v3m18 0V5a2 2 0 0 0-2-2h-3m0 18h3a2 2 0 0 0 2-2v-3M3 16v3a2 2 0 0 0 2 2h3" />
                  </svg>
                )}
              </button>
              <button
                onClick={() => { setChatOpen(false); setChatFullscreen(false); }}
                className="text-blue-300/40 hover:text-blue-200/70 p-1"
                title="Close"
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4">
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            </div>
          </div>

          {/* Messages */}
          <div className={`flex-1 overflow-y-auto px-4 py-4 space-y-3 ${chatFullscreen ? "max-w-3xl mx-auto w-full" : ""}`}>
            {chatMessages.length === 0 && (
              <div className="text-center py-8">
                <p className="text-sm text-blue-300/40">
                  Hi! I&apos;m your Goal Coach. I can see all your goals and help you improve them.
                </p>
                <div className="mt-4 space-y-2">
                  {[
                    "How can I improve my current goal?",
                    "What resources would help me?",
                    "I'm struggling with motivation",
                  ].map((suggestion) => (
                    <button
                      key={suggestion}
                      onClick={() => { setChatInput(suggestion); }}
                      className="block w-full text-left text-xs text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-lg px-3 py-2 transition-colors"
                    >
                      {suggestion}
                    </button>
                  ))}
                </div>
              </div>
            )}
            {chatMessages.map((msg, i) => (
              <div key={i} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
                <div
                  className={`max-w-[85%] rounded-xl px-3 py-2 text-sm leading-relaxed ${msg.role === "user"
                      ? "bg-blue-600 text-white rounded-br-sm"
                      : "bg-blue-900/30 text-gray-800 rounded-bl-sm"
                    }`}
                >
                  {msg.role === "user" ? (
                    <span className="whitespace-pre-wrap">{msg.content}</span>
                  ) : (
                    <div className="space-y-1">
                      {msg.content.split("\n").map((line, li) => {
                        if (!line.trim()) return <div key={li} className="h-1" />;
                        if (line.startsWith("### ")) return <p key={li} className="font-semibold text-blue-50 mt-2">{renderInline(line.slice(4))}</p>;
                        if (line.startsWith("## ")) return <p key={li} className="font-bold text-blue-50 mt-2">{renderInline(line.slice(3))}</p>;
                        if (line.match(/^\s*[\*\-]\s+/)) return (
                          <div key={li} className="flex gap-2 items-start">
                            <span className="mt-1.5 shrink-0 w-1.5 h-1.5 rounded-full bg-gray-400 inline-block" />
                            <span>{renderInline(line.replace(/^\s*[\*\-]\s+/, ""))}</span>
                          </div>
                        );
                        return <p key={li}>{renderInline(line)}</p>;
                      })}
                    </div>
                  )}
                </div>
              </div>
            ))}
            {chatLoading && (
              <div className="flex justify-start">
                <div className="bg-blue-900/30 rounded-xl rounded-bl-sm px-3 py-2">
                  <div className="flex gap-1">
                    <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                    <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                    <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
                  </div>
                </div>
              </div>
            )}
            <div ref={chatEndRef} />
          </div>

          {/* Input */}
          <div className={`px-4 py-3 border-t border-blue-400/10 shrink-0 ${chatFullscreen ? "max-w-3xl mx-auto w-full" : ""}`}>
            <div className="flex gap-2">
              <input
                type="text"
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && handleChatSend()}
                placeholder="Ask about your goals..."
                className="flex-1 border border-blue-400/20 bg-[rgba(5,15,35,0.5)] rounded-lg px-3 py-2 text-sm text-blue-100 placeholder-blue-300/30 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <button
                onClick={handleChatSend}
                disabled={chatLoading || !chatInput.trim()}
                className="bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300 text-white px-3 py-2 rounded-lg transition-colors shrink-0"
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4">
                  <line x1="22" y1="2" x2="11" y2="13" />
                  <polygon points="22 2 15 22 11 13 2 9 22 2" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      )}
      </div>
    </div>
  );
}