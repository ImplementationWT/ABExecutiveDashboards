"use client";

import { useRef, useState } from "react";

/* Light client-side gate — not strong security, just keeps casual visitors out. */
const ACCESS_PASSWORD = "AB2026";

export default function PasswordGate({ onUnlock }) {
  const [value, setValue] = useState("");
  const [error, setError] = useState("");
  const inputRef = useRef(null);

  function tryEnter() {
    if (value === ACCESS_PASSWORD) {
      onUnlock();
    } else {
      setError("Incorrect password");
      setValue("");
      inputRef.current?.focus();
    }
  }

  return (
    <div className="db-gate">
      <div className="gatecard">
        <div className="mark">Arzuman Brothers</div>
        <h2>Executive Dashboard</h2>
        <p>Enter the access password to continue.</p>
        <input
          ref={inputRef}
          type="password"
          placeholder="Password"
          autoComplete="off"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && tryEnter()}
          autoFocus
        />
        <button type="button" className="enter-btn" onClick={tryEnter}>
          Unlock
        </button>
        <div className="err-msg">{error}</div>
      </div>
    </div>
  );
}
