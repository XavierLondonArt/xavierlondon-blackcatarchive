"use client";

// components/blackcat/SubscribeForm.tsx

import { useState } from "react";

export function SubscribeForm() {
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
        body:    JSON.stringify({ email, brand: "blackcat" }),
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
          className="text-[10px] tracking-[0.45em] uppercase text-white/40"
          style={{ fontFamily: "'Courier Prime',monospace" }}
        >
          Access granted. You're in.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-2">
      <input
        type="email"
        value={email}
        onChange={(e) => { setEmail(e.target.value); if (state === "error") setState("idle"); }}
        placeholder="email"
        required
        disabled={state === "loading"}
        className="bg-transparent border border-white/12 px-3 py-2.5 text-xs tracking-wider text-white placeholder:text-white/18 focus:outline-none focus:border-white/35 transition-colors duration-200 disabled:opacity-40"
      />
      {state === "error" && (
        <p
          className="text-[9px] tracking-[0.3em] uppercase text-red-400/55"
          style={{ fontFamily: "'Courier Prime',monospace" }}
        >
          {errMsg}
        </p>
      )}
      <button
        type="submit"
        disabled={state === "loading"}
        className="border border-white/18 py-2.5 text-[10px] tracking-[0.4em] uppercase text-white/50 hover:bg-white hover:text-black hover:border-white transition-all duration-200 disabled:opacity-30 disabled:cursor-not-allowed"
      >
        {state === "loading" ? "..." : "Subscribe"}
      </button>
    </form>
  );
}