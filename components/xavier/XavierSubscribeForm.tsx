"use client";

// components/xavier/XavierSubscribeForm.tsx

import { useState } from "react";

export function XavierSubscribeForm() {
  const [email, setEmail]   = useState("");
  const [state, setState]   = useState<"idle" | "loading" | "done" | "error">("idle");
  const [errMsg, setErrMsg] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || state === "loading") return;
    setState("loading");
    setErrMsg("");

    try {
      const res  = await fetch("/api/subscribe", {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({ email, brand: "xavier" }),
      });
      const data = await res.json();
      if (data.success) {
        setState("done");
        setEmail("");
      } else {
        setErrMsg(data.error ?? "Something went wrong.");
        setState("error");
      }
    } catch {
      setErrMsg("Something went wrong.");
      setState("error");
    }
  };

  if (state === "done") {
    return (
      <div className="py-2">
        <p
          className="text-sm font-light text-[#1a1a1a]/45 tracking-wide"
          style={{ fontFamily: "'Cormorant Garamond','Georgia',serif" }}
        >
          You're on the list.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-2">
      <div className="flex">
        <input
          type="email"
          value={email}
          onChange={(e) => { setEmail(e.target.value); if (state === "error") setState("idle"); }}
          placeholder="Your email"
          required
          disabled={state === "loading"}
          className="flex-1 bg-transparent border border-[#1a1a1a]/18 px-4 py-2.5 text-sm font-light tracking-wide placeholder:text-[#1a1a1a]/22 focus:outline-none focus:border-[#1a1a1a]/45 transition-colors duration-300 disabled:opacity-40"
          style={{ fontFamily: "'Cormorant Garamond','Georgia',serif" }}
        />
        <button
          type="submit"
          disabled={state === "loading"}
          className="border border-l-0 border-[#1a1a1a]/18 px-5 py-2.5 text-[9px] tracking-[0.4em] uppercase text-[#1a1a1a]/50 hover:bg-[#1a1a1a] hover:text-[#f7f4ef] hover:border-[#1a1a1a] transition-all duration-300 disabled:opacity-30 disabled:cursor-not-allowed"
          style={{ fontFamily: "'Cormorant Garamond','Georgia',serif" }}
        >
          {state === "loading" ? "..." : "Join"}
        </button>
      </div>
      {state === "error" && (
        <p
          className="text-[9px] tracking-[0.3em] uppercase text-red-500/50"
          style={{ fontFamily: "'Cormorant Garamond','Georgia',serif" }}
        >
          {errMsg}
        </p>
      )}
    </form>
  );
}