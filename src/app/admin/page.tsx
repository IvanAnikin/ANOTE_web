"use client";

import { useState, useEffect, useCallback } from "react";

interface Submission {
  id: string;
  name: string;
  email: string;
  phone: string;
  practiceType: string;
  message: string;
  timestamp: string;
}

export default function AdminPage() {
  const [secret, setSecret] = useState("");
  const [authenticated, setAuthenticated] = useState(false);
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const fetchSubmissions = useCallback(async (s: string) => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch(`/api/admin/submissions?secret=${encodeURIComponent(s)}`);
      if (!res.ok) {
        if (res.status === 401) {
          setError("Nesprávné heslo.");
          setAuthenticated(false);
        } else {
          setError("Chyba při načítání dat.");
        }
        return;
      }
      const data = await res.json();
      setSubmissions(data);
      setAuthenticated(true);
    } catch {
      setError("Chyba připojení.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const saved = sessionStorage.getItem("admin_secret");
    if (saved) {
      setSecret(saved);
      fetchSubmissions(saved);
    }
  }, [fetchSubmissions]);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    sessionStorage.setItem("admin_secret", secret);
    fetchSubmissions(secret);
  };

  const handleDownloadCsv = () => {
    window.open(
      `/api/admin/submissions?format=csv&secret=${encodeURIComponent(secret)}`,
      "_blank",
    );
  };

  if (!authenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <form
          onSubmit={handleLogin}
          className="bg-white p-8 rounded-xl shadow-md w-full max-w-sm"
        >
          <h1 className="text-xl font-bold mb-4">Admin – ANOTE</h1>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Heslo
          </label>
          <input
            type="password"
            value={secret}
            onChange={(e) => setSecret(e.target.value)}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 mb-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
            autoFocus
          />
          {error && <p className="text-red-600 text-sm mb-3">{error}</p>}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 text-white rounded-lg py-2 font-semibold hover:bg-blue-700 transition-colors disabled:opacity-50"
          >
            {loading ? "Načítání…" : "Přihlásit"}
          </button>
        </form>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold">
            Kontaktní formuláře ({submissions.length})
          </h1>
          <div className="flex gap-3">
            <button
              onClick={() => fetchSubmissions(secret)}
              className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium hover:bg-gray-100 transition-colors"
            >
              Obnovit
            </button>
            <button
              onClick={handleDownloadCsv}
              className="px-4 py-2 bg-green-600 text-white rounded-lg text-sm font-semibold hover:bg-green-700 transition-colors"
            >
              Stáhnout CSV
            </button>
          </div>
        </div>

        {submissions.length === 0 ? (
          <div className="bg-white rounded-xl p-12 text-center text-gray-500">
            Zatím žádné formuláře.
          </div>
        ) : (
          <div className="bg-white rounded-xl shadow overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b bg-gray-50">
                  <th className="text-left px-4 py-3 font-semibold">#</th>
                  <th className="text-left px-4 py-3 font-semibold">Čas</th>
                  <th className="text-left px-4 py-3 font-semibold">Jméno</th>
                  <th className="text-left px-4 py-3 font-semibold">Email</th>
                  <th className="text-left px-4 py-3 font-semibold">Telefon</th>
                  <th className="text-left px-4 py-3 font-semibold">Typ praxe</th>
                  <th className="text-left px-4 py-3 font-semibold">Zpráva</th>
                </tr>
              </thead>
              <tbody>
                {[...submissions].reverse().map((s, i) => (
                  <tr key={s.id} className="border-b last:border-b-0 hover:bg-gray-50">
                    <td className="px-4 py-3 text-gray-400">{submissions.length - i}</td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      {new Date(s.timestamp).toLocaleString("cs-CZ")}
                    </td>
                    <td className="px-4 py-3 font-medium">{s.name}</td>
                    <td className="px-4 py-3">
                      <a href={`mailto:${s.email}`} className="text-blue-600 hover:underline">
                        {s.email}
                      </a>
                    </td>
                    <td className="px-4 py-3">{s.phone || "—"}</td>
                    <td className="px-4 py-3">{s.practiceType || "—"}</td>
                    <td className="px-4 py-3 max-w-xs truncate">{s.message || "—"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
