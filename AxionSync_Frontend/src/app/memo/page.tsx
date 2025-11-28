"use client";

import { useEffect, useState, useRef } from "react";
import { useMemoStore } from "@/Store/memo";
import { useAuthStore } from "@/Store/auth";
import { useNotification } from "@/Components/Notification/useNotification";
import type { Memo } from "@/Types/Memo";

export default function MemoPage() {
  const { memos, loading, getMemos, createMemo, deleteMemo } = useMemoStore();
  const { user } = useAuthStore();
  const { showNotification } = useNotification();

  const [input, setInput] = useState("");
  const [selectedMemo, setSelectedMemo] = useState<Memo | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    getMemos();
  }, [getMemos]);

  // Auto-scroll to bottom when new memos arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [memos]);

  const handleSend = async () => {
    if (!input.trim()) return;

    const result = await createMemo({
      title: "Memo",
      content: input.trim(),
    });

    if (result.success) {
      setInput("");
      showNotification("Memo sent!", "success");
    } else {
      showNotification(result.message || "Failed to send memo", "error");
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleDelete = async (id: number) => {
    const result = await deleteMemo(id);
    if (result.success) {
      showNotification("Memo deleted", "success");
      if (selectedMemo?.id === id) {
        setSelectedMemo(null);
      }
    } else {
      showNotification(result.message || "Failed to delete", "error");
    }
  };

  return (
    <div
      style={{ display: "flex", height: "100vh", backgroundColor: "#36393f" }}
    >
      {/* Main Chat Area */}
      <div style={{ flex: 1, display: "flex", flexDirection: "column" }}>
        {/* Header */}
        <div
          style={{
            height: "50px",
            backgroundColor: "#2f3136",
            borderBottom: "1px solid #202225",
            display: "flex",
            alignItems: "center",
            padding: "0 16px",
            color: "#fff",
            fontSize: "16px",
            fontWeight: "600",
          }}
        >
          # memo-notes
        </div>

        {/* Messages Area */}
        <div
          style={{
            flex: 1,
            overflowY: "auto",
            padding: "16px",
            display: "flex",
            flexDirection: "column-reverse",
          }}
        >
          <div ref={messagesEndRef} />
          {[...memos].reverse().map((memo) => (
            <div
              key={memo.id}
              style={{
                marginBottom: "16px",
                padding: "8px 12px",
                borderRadius: "4px",
                backgroundColor:
                  selectedMemo?.id === memo.id ? "#40444b" : "transparent",
                cursor: "pointer",
                transition: "background-color 0.2s",
              }}
              onClick={() => setSelectedMemo(memo)}
              onMouseEnter={(e) => {
                if (selectedMemo?.id !== memo.id) {
                  e.currentTarget.style.backgroundColor = "#32353b";
                }
              }}
              onMouseLeave={(e) => {
                if (selectedMemo?.id !== memo.id) {
                  e.currentTarget.style.backgroundColor = "transparent";
                }
              }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  marginBottom: "4px",
                }}
              >
                <div
                  style={{
                    width: "40px",
                    height: "40px",
                    borderRadius: "50%",
                    backgroundColor: "#5865f2",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: "#fff",
                    fontWeight: "600",
                    marginRight: "12px",
                  }}
                >
                  {memo.user.username.charAt(0).toUpperCase()}
                </div>
                <div style={{ flex: 1 }}>
                  <div
                    style={{
                      display: "flex",
                      alignItems: "baseline",
                      gap: "8px",
                    }}
                  >
                    <span
                      style={{
                        color: "#fff",
                        fontWeight: "500",
                        fontSize: "16px",
                      }}
                    >
                      {memo.user.username}
                    </span>
                    <span style={{ color: "#72767d", fontSize: "12px" }}>
                      {new Date(memo.created_at).toLocaleString()}
                    </span>
                  </div>
                  <div
                    style={{
                      color: "#dcddde",
                      fontSize: "15px",
                      marginTop: "4px",
                    }}
                  >
                    {memo.content}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Input Bar */}
        <div
          style={{
            padding: "16px",
            backgroundColor: "#2f3136",
          }}
        >
          <div
            style={{
              backgroundColor: "#40444b",
              borderRadius: "8px",
              padding: "12px",
              display: "flex",
              alignItems: "center",
              gap: "8px",
            }}
          >
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Message #memo-notes"
              disabled={loading}
              style={{
                flex: 1,
                backgroundColor: "transparent",
                border: "none",
                outline: "none",
                color: "#dcddde",
                fontSize: "15px",
              }}
            />
            <button
              onClick={handleSend}
              disabled={loading || !input.trim()}
              style={{
                padding: "8px 16px",
                backgroundColor: "#5865f2",
                color: "#fff",
                border: "none",
                borderRadius: "4px",
                cursor: "pointer",
                fontWeight: "500",
                opacity: loading || !input.trim() ? 0.5 : 1,
              }}
            >
              Send
            </button>
          </div>
        </div>
      </div>

      {/* Right Sidebar */}
      <div
        style={{
          width: "300px",
          backgroundColor: "#2f3136",
          borderLeft: "1px solid #202225",
          display: "flex",
          flexDirection: "column",
        }}
      >
        {/* Sidebar Header */}
        <div
          style={{
            height: "50px",
            borderBottom: "1px solid #202225",
            display: "flex",
            alignItems: "center",
            padding: "0 16px",
            color: "#fff",
            fontSize: "14px",
            fontWeight: "600",
          }}
        >
          {selectedMemo ? "Memo Details" : "Select a memo"}
        </div>

        {/* Sidebar Content */}
        <div style={{ flex: 1, padding: "16px", overflowY: "auto" }}>
          {selectedMemo ? (
            <div>
              <div style={{ marginBottom: "16px" }}>
                <div
                  style={{
                    color: "#b9bbbe",
                    fontSize: "12px",
                    fontWeight: "600",
                    marginBottom: "4px",
                  }}
                >
                  AUTHOR
                </div>
                <div style={{ color: "#fff", fontSize: "14px" }}>
                  {selectedMemo.user.username}
                </div>
              </div>

              <div style={{ marginBottom: "16px" }}>
                <div
                  style={{
                    color: "#b9bbbe",
                    fontSize: "12px",
                    fontWeight: "600",
                    marginBottom: "4px",
                  }}
                >
                  CREATED
                </div>
                <div style={{ color: "#fff", fontSize: "14px" }}>
                  {new Date(selectedMemo.created_at).toLocaleString()}
                </div>
              </div>

              {selectedMemo.updated_at && (
                <div style={{ marginBottom: "16px" }}>
                  <div
                    style={{
                      color: "#b9bbbe",
                      fontSize: "12px",
                      fontWeight: "600",
                      marginBottom: "4px",
                    }}
                  >
                    UPDATED
                  </div>
                  <div style={{ color: "#fff", fontSize: "14px" }}>
                    {new Date(selectedMemo.updated_at).toLocaleString()}
                  </div>
                </div>
              )}

              <div style={{ marginBottom: "16px" }}>
                <div
                  style={{
                    color: "#b9bbbe",
                    fontSize: "12px",
                    fontWeight: "600",
                    marginBottom: "4px",
                  }}
                >
                  CONTENT
                </div>
                <div
                  style={{
                    color: "#dcddde",
                    fontSize: "14px",
                    backgroundColor: "#202225",
                    padding: "12px",
                    borderRadius: "4px",
                    wordWrap: "break-word",
                  }}
                >
                  {selectedMemo.content}
                </div>
              </div>

              {user && selectedMemo.user.id === user.id && (
                <button
                  onClick={() => handleDelete(selectedMemo.id)}
                  disabled={loading}
                  style={{
                    width: "100%",
                    padding: "10px",
                    backgroundColor: "#ed4245",
                    color: "#fff",
                    border: "none",
                    borderRadius: "4px",
                    cursor: "pointer",
                    fontWeight: "500",
                    opacity: loading ? 0.5 : 1,
                  }}
                >
                  Delete Memo
                </button>
              )}
            </div>
          ) : (
            <div
              style={{
                color: "#72767d",
                fontSize: "14px",
                textAlign: "center",
                marginTop: "40px",
              }}
            >
              Click on a memo to view details
            </div>
          )}
        </div>
      </div>

      {/* Global Loading */}
      {loading && (
        <div className="global-loading">
          <div className="global-spinner" />
        </div>
      )}
    </div>
  );
}
