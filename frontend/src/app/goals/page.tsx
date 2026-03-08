"use client";

import { useState, useRef, useEffect } from "react";

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
    <div className="min-h-screen bg-gray-50 font-sans">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Goal Setting</h1>
          <p className="text-sm text-gray-500 mt-0.5">Track your SMART goals and progress</p>
        </div>
        {view !== "form" && (
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
            className="text-sm text-gray-500 hover:text-gray-700 ml-3"
          >
            ← Back
          </button>
        )}
      </header>

      <main className="max-w-4xl mx-auto px-6 py-8">
        {/* FORM VIEW */}
        {view === "form" && (
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-1">Create a New Goal</h2>
            <p className="text-sm text-gray-500 mb-6">
              Your goal will be validated by AI to ensure it&apos;s SMART (Specific, Measurable, Achievable, Relevant, Time-bound).
            </p>

            <div className="space-y-5">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Goal Overview
                </label>
                <textarea
                  value={formOverview}
                  onChange={(e) => setFormOverview(e.target.value)}
                  placeholder="e.g. Run a 5K in under 30 minutes by June 30, 2025, by training 3x per week."
                  rows={3}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Strategies
                </label>
                <textarea
                  value={formStrategies}
                  onChange={(e) => setFormStrategies(e.target.value)}
                  placeholder="e.g. Follow a couch-to-5K training plan, run Monday/Wednesday/Friday mornings, track runs with Garmin app."
                  rows={3}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Acceptance Criteria
                </label>
                <p className="text-xs text-gray-400 mb-2">
                  Enter one criterion per line. These become checkboxes to track your completion.
                </p>
                <textarea
                  value={formCriteria}
                  onChange={(e) => setFormCriteria(e.target.value)}
                  placeholder={`Complete at least 24 training runs\nFinish a 5K race officially timed\nAchieve a finish time under 30:00`}
                  rows={5}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
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
                  className="text-sm text-gray-500 hover:text-gray-700 px-4 py-2.5"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}

        {/* DETAIL VIEW */}
        {view === "detail" && selectedGoal && (
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <div className="flex items-start justify-between mb-4">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  {selectedGoal.completed && (
                    <span className="bg-green-100 text-green-700 text-xs font-medium px-2 py-0.5 rounded-full">
                      ✓ Completed
                    </span>
                  )}
                  <span className="text-xs text-gray-400">Created {selectedGoal.createdAt}</span>
                </div>
                <h2 className="text-lg font-semibold text-gray-900">{selectedGoal.overview}</h2>
              </div>
              <button
                onClick={() => deleteGoal(selectedGoal.id)}
                className="text-red-400 hover:text-red-600 text-sm ml-4 shrink-0"
              >
                Delete
              </button>
            </div>

            <div className="mb-5">
              <h3 className="text-sm font-medium text-gray-700 mb-1">Strategies</h3>
              <p className="text-sm text-gray-600 bg-gray-50 rounded-lg p-3">{selectedGoal.strategies}</p>
            </div>

            <div>
              <h3 className="text-sm font-medium text-gray-700 mb-2">
                Acceptance Criteria
                <span className="ml-2 text-gray-400 font-normal">
                  ({selectedGoal.checkedCriteria.filter(Boolean).length}/{selectedGoal.checkedCriteria.length} met)
                </span>
              </h3>

              {/* Progress bar */}
              <div className="w-full bg-gray-100 rounded-full h-2 mb-4">
                <div
                  className="bg-blue-500 h-2 rounded-full transition-all"
                  style={{
                    width: `${
                      selectedGoal.checkedCriteria.length > 0
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
                      className="mt-0.5 h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
                    />
                    <span
                      className={`text-sm transition-colors ${
                        selectedGoal.checkedCriteria[idx]
                          ? "line-through text-gray-400"
                          : "text-gray-700"
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
              <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3">
                Active Goals ({activeGoals.length})
              </h2>
              {activeGoals.length === 0 ? (
                <div className="bg-white border border-dashed border-gray-300 rounded-xl p-8 text-center">
                  <p className="text-gray-400 text-sm">No active goals yet.</p>
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
                        className="bg-white border border-gray-200 rounded-xl p-4 cursor-pointer hover:border-blue-300 hover:shadow-sm transition-all"
                      >
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-gray-900 truncate">{goal.overview}</p>
                            <p className="text-xs text-gray-400 mt-0.5">{goal.createdAt}</p>
                          </div>
                          <span className="text-xs text-blue-600 font-medium shrink-0">{progress}%</span>
                        </div>
                        <div className="mt-3 w-full bg-gray-100 rounded-full h-1.5">
                          <div
                            className="bg-blue-500 h-1.5 rounded-full transition-all"
                            style={{ width: `${progress}%` }}
                          />
                        </div>
                        <p className="text-xs text-gray-400 mt-2">
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
                <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3">
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
                        <p className="text-sm font-medium text-gray-700 truncate">{goal.overview}</p>
                      </div>
                      <p className="text-xs text-gray-400 mt-1 ml-5">{goal.createdAt} · All criteria met</p>
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
          className={`fixed z-50 bg-white border border-gray-200 shadow-xl flex flex-col transition-all
            ${chatFullscreen
              ? "inset-0 rounded-none"
              : "bottom-6 right-6 w-80 sm:w-96 h-[520px] rounded-xl"
            }`}
        >
          {/* Chat Header */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100 shrink-0">
            <div>
              <p className="text-sm font-semibold text-gray-900">Goal Coach</p>
              <p className="text-xs text-gray-400">Ask Gemini for advice on your goals</p>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setChatFullscreen(!chatFullscreen)}
                className="text-gray-400 hover:text-gray-600 p-1"
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
                className="text-gray-400 hover:text-gray-600 p-1"
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
                <p className="text-sm text-gray-400">
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
                  className={`max-w-[85%] rounded-xl px-3 py-2 text-sm leading-relaxed whitespace-pre-wrap ${
                    msg.role === "user"
                      ? "bg-blue-600 text-white rounded-br-sm"
                      : "bg-gray-100 text-gray-800 rounded-bl-sm"
                  }`}
                >
                  {msg.content}
                </div>
              </div>
            ))}
            {chatLoading && (
              <div className="flex justify-start">
                <div className="bg-gray-100 rounded-xl rounded-bl-sm px-3 py-2">
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
          <div className={`px-4 py-3 border-t border-gray-100 shrink-0 ${chatFullscreen ? "max-w-3xl mx-auto w-full" : ""}`}>
            <div className="flex gap-2">
              <input
                type="text"
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && handleChatSend()}
                placeholder="Ask about your goals..."
                className="flex-1 border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
  );
}