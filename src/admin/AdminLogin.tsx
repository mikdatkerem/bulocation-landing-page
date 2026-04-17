import { useMemo, useState } from 'react';
import type { FormEvent } from 'react';

type AdminLoginMode = 'login' | 'forgot' | 'reset';

type AdminLoginProps = {
  onSubmit: (emailOrUserName: string, password: string) => Promise<void>;
  onForgotPassword: (email: string) => Promise<void>;
  onResetPassword: (token: string, newPassword: string) => Promise<void>;
  onInputChange?: () => void;
  error: string | null;
  notice?: string | null;
  fieldErrors?: Record<string, string[]> | null;
  busy: boolean;
};

const MODE_COPY: Record<AdminLoginMode, { title: string; description: string }> = {
  login: {
    title: 'Yonetici Girisi',
    description: 'Yonetim paneline guvenli oturumla giris yapin.',
  },
  forgot: {
    title: 'Sifre Yenileme',
    description: 'Kayitli e-posta adresinizi girin, sifre yenileme baglantisi gonderelim.',
  },
  reset: {
    title: 'Yeni Sifre Belirle',
    description: 'E-posta ile gelen kodu yapistirin ve yeni sifrenizi olusturun.',
  },
};

function AuthModeButton({
  active,
  children,
  onClick,
}: {
  active: boolean;
  children: string;
  onClick: () => void;
}) {
  return (
    <button
      className={`border px-3 py-2 text-xs font-semibold uppercase tracking-[0.18em] transition ${
        active
          ? 'border-[#1836b9] bg-[#1836b9] text-[#a4b1ff]'
          : 'border-transparent bg-[#292a2b] text-[#8f8fa0] hover:bg-[#343536] hover:text-[#e3e2e3]'
      }`}
      type="button"
      onClick={onClick}
    >
      {children}
    </button>
  );
}

export default function AdminLogin({
  onSubmit,
  onForgotPassword,
  onResetPassword,
  onInputChange,
  error,
  notice,
  fieldErrors,
  busy,
}: AdminLoginProps) {
  const [mode, setMode] = useState<AdminLoginMode>('login');
  const [emailOrUserName, setEmailOrUserName] = useState('');
  const [password, setPassword] = useState('');
  const [forgotEmail, setForgotEmail] = useState('');
  const [resetToken, setResetToken] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const emailOrUserNameError =
    fieldErrors?.EmailOrUserName?.[0] || fieldErrors?.emailOrUserName?.[0] || null;
  const passwordError = fieldErrors?.Password?.[0] || fieldErrors?.password?.[0] || null;
  const resetPasswordError = useMemo(() => {
    if (!confirmPassword.trim()) {
      return null;
    }

    return newPassword !== confirmPassword ? 'Yeni sifreler birbiriyle eslesmiyor.' : null;
  }, [confirmPassword, newPassword]);

  function changeMode(nextMode: AdminLoginMode) {
    onInputChange?.();
    setMode(nextMode);
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (mode === 'login') {
      await onSubmit(emailOrUserName, password);
      return;
    }

    if (mode === 'forgot') {
      await onForgotPassword(forgotEmail);
      return;
    }

    if (resetPasswordError) {
      return;
    }

    await onResetPassword(resetToken, newPassword);
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#060708] px-4 py-10 text-[#e3e2e3]">
      <div className="w-full max-w-[460px]">
        <section className="relative overflow-hidden rounded-[10px] bg-[#121315] p-7 text-[#e3e2e3] shadow-[0_32px_90px_rgba(0,0,0,0.55)]">
          <div className="absolute inset-x-0 top-0 h-[3px] bg-[linear-gradient(90deg,#121315_0%,#101527_16%,#14236c_36%,#1836b9_66%,#182b93_84%,#111735_100%)] shadow-[0_0_14px_rgba(24,54,185,0.42)]" />
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[#a4b1ff]">
                {MODE_COPY[mode].title}
              </p>
              <p className="mt-3 max-w-xl text-sm leading-6 text-[#8f8fa0]">
                {MODE_COPY[mode].description}
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              <AuthModeButton active={mode === 'login'} onClick={() => changeMode('login')}>
                Giris
              </AuthModeButton>
              <AuthModeButton active={mode === 'forgot'} onClick={() => changeMode('forgot')}>
                Sifre Yenile
              </AuthModeButton>
              <AuthModeButton active={mode === 'reset'} onClick={() => changeMode('reset')}>
                Kodu Kullan
              </AuthModeButton>
            </div>
          </div>

          <form className="mt-8 space-y-5" onSubmit={handleSubmit}>
            {mode === 'login' ? (
              <>
                <label className="block">
                  <span className="mb-2 block text-xs font-semibold uppercase tracking-[0.18em] text-[#8f8fa0]">
                    E-posta veya kullanici adi
                  </span>
                  <input
                    aria-invalid={emailOrUserNameError ? true : undefined}
                    className={`w-full rounded-[7px] border px-4 py-3 text-sm text-white outline-none transition focus:bg-[#343536] ${
                      emailOrUserNameError
                        ? 'border-rose-500/70 bg-rose-950/20 focus:border-rose-400'
                        : 'border-transparent bg-[#292a2b] focus:border-[#1836b9]'
                    }`}
                    value={emailOrUserName}
                    onChange={(event) => {
                      onInputChange?.();
                      setEmailOrUserName(event.target.value);
                    }}
                  />
                  {emailOrUserNameError ? (
                    <span className="mt-2 block text-xs text-rose-200">{emailOrUserNameError}</span>
                  ) : null}
                </label>

                <label className="block">
                  <span className="mb-2 block text-xs font-semibold uppercase tracking-[0.18em] text-[#8f8fa0]">
                    Sifre
                  </span>
                  <input
                    aria-invalid={passwordError ? true : undefined}
                    className={`w-full rounded-[7px] border px-4 py-3 text-sm text-white outline-none transition focus:bg-[#343536] ${
                      passwordError
                        ? 'border-rose-500/70 bg-rose-950/20 focus:border-rose-400'
                        : 'border-transparent bg-[#292a2b] focus:border-[#1836b9]'
                    }`}
                    type="password"
                    value={password}
                    onChange={(event) => {
                      onInputChange?.();
                      setPassword(event.target.value);
                    }}
                  />
                  {passwordError ? (
                    <span className="mt-2 block text-xs text-rose-200">{passwordError}</span>
                  ) : null}
                </label>
              </>
            ) : null}

            {mode === 'forgot' ? (
              <label className="block">
                <span className="mb-2 block text-xs font-semibold uppercase tracking-[0.18em] text-[#8f8fa0]">
                  Kayitli e-posta adresi
                </span>
                <input
                  className="w-full rounded-[7px] border border-transparent bg-[#292a2b] px-4 py-3 text-sm text-white outline-none transition focus:border-[#1836b9] focus:bg-[#343536]"
                  type="email"
                  value={forgotEmail}
                  onChange={(event) => {
                    onInputChange?.();
                    setForgotEmail(event.target.value);
                  }}
                />
              </label>
            ) : null}

            {mode === 'reset' ? (
              <>
                <label className="block">
                  <span className="mb-2 block text-xs font-semibold uppercase tracking-[0.18em] text-[#8f8fa0]">
                    Sifirlama kodu
                  </span>
                  <textarea
                    className="min-h-[108px] w-full rounded-[7px] border border-transparent bg-[#292a2b] px-4 py-3 text-sm text-white outline-none transition focus:border-[#1836b9] focus:bg-[#343536]"
                    value={resetToken}
                    onChange={(event) => {
                      onInputChange?.();
                      setResetToken(event.target.value);
                    }}
                  />
                </label>
                <label className="block">
                  <span className="mb-2 block text-xs font-semibold uppercase tracking-[0.18em] text-[#8f8fa0]">
                    Yeni sifre
                  </span>
                  <input
                    className="w-full rounded-[7px] border border-transparent bg-[#292a2b] px-4 py-3 text-sm text-white outline-none transition focus:border-[#1836b9] focus:bg-[#343536]"
                    type="password"
                    value={newPassword}
                    onChange={(event) => {
                      onInputChange?.();
                      setNewPassword(event.target.value);
                    }}
                  />
                </label>
                <label className="block">
                  <span className="mb-2 block text-xs font-semibold uppercase tracking-[0.18em] text-[#8f8fa0]">
                    Yeni sifre tekrar
                  </span>
                  <input
                    aria-invalid={resetPasswordError ? true : undefined}
                    className={`w-full rounded-[7px] border px-4 py-3 text-sm text-white outline-none transition focus:bg-[#343536] ${
                      resetPasswordError
                        ? 'border-rose-500/70 bg-rose-950/20 focus:border-rose-400'
                        : 'border-transparent bg-[#292a2b] focus:border-[#1836b9]'
                    }`}
                    type="password"
                    value={confirmPassword}
                    onChange={(event) => {
                      onInputChange?.();
                      setConfirmPassword(event.target.value);
                    }}
                  />
                  {resetPasswordError ? (
                    <span className="mt-2 block text-xs text-rose-200">{resetPasswordError}</span>
                  ) : null}
                </label>
              </>
            ) : null}

            {error ? (
              <div className="border border-rose-500/30 bg-rose-950/30 px-4 py-3 text-sm text-rose-100">
                {error}
              </div>
            ) : null}

            {!error && notice ? (
              <div className="border border-emerald-500/30 bg-emerald-950/30 px-4 py-3 text-sm text-emerald-100">
                {notice}
              </div>
            ) : null}

            <button
              className="w-full rounded-[7px] border border-transparent bg-[#1836b9] px-4 py-3 text-sm font-semibold text-[#a4b1ff] transition hover:bg-[#1735b8] disabled:cursor-not-allowed disabled:opacity-60"
              disabled={
                busy ||
                (mode === 'login' && (!emailOrUserName.trim() || !password.trim())) ||
                (mode === 'forgot' && !forgotEmail.trim()) ||
                (mode === 'reset' &&
                  (!resetToken.trim() || !newPassword.trim() || !confirmPassword.trim() || !!resetPasswordError))
              }
              type="submit"
            >
              {busy
                ? 'Islem yapiliyor...'
                : mode === 'login'
                  ? 'Yonetim paneline gir'
                  : mode === 'forgot'
                    ? 'Sifirlama baglantisi gonder'
                    : 'Yeni sifreyi kaydet'}
            </button>
          </form>
        </section>
      </div>
    </div>
  );
}
