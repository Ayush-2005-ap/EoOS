"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Lock, ArrowRight } from "lucide-react";

export default function AdminLogin() {
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "https://eoos-backend.onrender.com/api"}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });

      const data = await res.json();

      if (res.ok && data.token) {
        localStorage.setItem("admin_token", data.token);
        router.push("/admin");
      } else {
        setError(data.error || "Invalid password");
      }
    } catch (err) {
      setError("Failed to connect to the server.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <div className="bg-white p-8 rounded-3xl shadow-xl shadow-slate-200/50 max-w-md w-full border border-slate-100">
        <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center mb-6 text-primary mx-auto">
          <Lock size={32} />
        </div>
        
        <h1 className="text-2xl font-plus-jakarta font-extrabold text-center text-slate-800 mb-2">Admin Access</h1>
        <p className="text-center text-slate-500 mb-8">Enter the secure password to continue</p>

        <form onSubmit={handleLogin} className="space-y-6">
          <div>
            <input
              type="password"
              required
              placeholder="Admin Password"
              className="w-full p-4 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all text-center text-lg"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          {error && (
            <p className="text-error text-sm font-bold text-center bg-error/10 p-3 rounded-lg">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-primary text-white p-4 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-primary-container disabled:opacity-50 transition-colors"
          >
            {loading ? "Authenticating..." : "Secure Login"} <ArrowRight size={20} />
          </button>
        </form>
      </div>
    </div>
  );
}
