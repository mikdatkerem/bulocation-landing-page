import { useState } from 'react';
import type { FormEvent } from 'react';

type AdminLoginProps = {
  onSubmit: (emailOrUserName: string, password: string) => Promise<void>;
  error: string | null;
  busy: boolean;
};

export default function AdminLogin({ onSubmit, error, busy }: AdminLoginProps) {
  const [emailOrUserName, setEmailOrUserName] = useState('');
  const [password, setPassword] = useState('');

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    await onSubmit(emailOrUserName, password);
  }

  return (
    <div className="min-h-screen bg-[#0b121d] px-4 py-10 text-slate-100">
      <div className="mx-auto grid max-w-6xl gap-6 lg:grid-cols-[1.1fr_0.9fr]">
        <section className="border border-[#1f2c45] bg-[#101927] p-8 text-white shadow-[0_30px_90px_rgba(2,6,23,0.45)] lg:p-10">
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[#9bb4e8]">
            Yonetici Girisi
          </p>
          <form className="mt-8 space-y-5" onSubmit={handleSubmit}>
            <label className="block">
              <span className="mb-2 block text-sm text-slate-400">E-posta veya kullanici adi</span>
              <input
                className="w-full rounded-none border border-[#23314d] bg-[#0f1727] px-4 py-3 text-sm text-white outline-none transition focus:border-[#4f6ea8] focus:bg-[#111c30]"
                value={emailOrUserName}
                onChange={(event) => setEmailOrUserName(event.target.value)}
              />
            </label>

            <label className="block">
              <span className="mb-2 block text-sm text-slate-400">Sifre</span>
              <input
                className="w-full rounded-none border border-[#23314d] bg-[#0f1727] px-4 py-3 text-sm text-white outline-none transition focus:border-[#4f6ea8] focus:bg-[#111c30]"
                type="password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
              />
            </label>

            {error ? (
              <div className="border border-rose-500/30 bg-rose-950/30 px-4 py-3 text-sm text-rose-100">
                {error}
              </div>
            ) : null}

            <button
              className="w-full border border-[#263654] bg-[#15233a] px-4 py-3 text-sm font-semibold text-white transition hover:bg-[#1a2a43] disabled:cursor-not-allowed disabled:opacity-60"
              disabled={busy || !emailOrUserName.trim() || !password.trim()}
              type="submit"
            >
              {busy ? 'Giris yapiliyor...' : 'Yonetim paneline gir'}
            </button>
          </form>
        </section>
      </div>
    </div>
  );
}
