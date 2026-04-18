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
      className={`admin-login-mode-button ${active ? 'is-active' : ''}`}
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
    <div className="admin-login-shell">
      <div className="admin-login-wrap">
        <section className="admin-login-card">
          <div className="admin-login-accent" />
          <div className="admin-login-head">
            <div className="admin-login-copy">
              <p className="admin-login-kicker">
                {MODE_COPY[mode].title}
              </p>
              <p className="admin-login-description">
                {MODE_COPY[mode].description}
              </p>
            </div>
            <div className="admin-login-modes">
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

          <form className="admin-login-form" onSubmit={handleSubmit}>
            {mode === 'login' ? (
              <>
                <label className="admin-login-field">
                  <span className="admin-login-label">
                    E-posta veya kullanici adi
                  </span>
                  <input
                    aria-invalid={emailOrUserNameError ? true : undefined}
                    className={`admin-login-input ${emailOrUserNameError ? 'has-error' : ''}`}
                    value={emailOrUserName}
                    onChange={(event) => {
                      onInputChange?.();
                      setEmailOrUserName(event.target.value);
                    }}
                  />
                  {emailOrUserNameError ? (
                    <span className="admin-login-error">{emailOrUserNameError}</span>
                  ) : null}
                </label>

                <label className="admin-login-field">
                  <span className="admin-login-label">
                    Sifre
                  </span>
                  <input
                    aria-invalid={passwordError ? true : undefined}
                    className={`admin-login-input ${passwordError ? 'has-error' : ''}`}
                    type="password"
                    value={password}
                    onChange={(event) => {
                      onInputChange?.();
                      setPassword(event.target.value);
                    }}
                  />
                  {passwordError ? (
                    <span className="admin-login-error">{passwordError}</span>
                  ) : null}
                </label>
              </>
            ) : null}

            {mode === 'forgot' ? (
              <label className="admin-login-field">
                <span className="admin-login-label">
                  Kayitli e-posta adresi
                </span>
                <input
                  className="admin-login-input"
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
                <label className="admin-login-field">
                  <span className="admin-login-label">
                    Sifirlama kodu
                  </span>
                  <textarea
                    className="admin-login-input admin-login-textarea"
                    value={resetToken}
                    onChange={(event) => {
                      onInputChange?.();
                      setResetToken(event.target.value);
                    }}
                  />
                </label>
                <label className="admin-login-field">
                  <span className="admin-login-label">
                    Yeni sifre
                  </span>
                  <input
                    className="admin-login-input"
                    type="password"
                    value={newPassword}
                    onChange={(event) => {
                      onInputChange?.();
                      setNewPassword(event.target.value);
                    }}
                  />
                </label>
                <label className="admin-login-field">
                  <span className="admin-login-label">
                    Yeni sifre tekrar
                  </span>
                  <input
                    aria-invalid={resetPasswordError ? true : undefined}
                    className={`admin-login-input ${resetPasswordError ? 'has-error' : ''}`}
                    type="password"
                    value={confirmPassword}
                    onChange={(event) => {
                      onInputChange?.();
                      setConfirmPassword(event.target.value);
                    }}
                  />
                  {resetPasswordError ? (
                    <span className="admin-login-error">{resetPasswordError}</span>
                  ) : null}
                </label>
              </>
            ) : null}

            {error ? (
              <div className="admin-login-alert is-error">
                {error}
              </div>
            ) : null}

            {!error && notice ? (
              <div className="admin-login-alert is-success">
                {notice}
              </div>
            ) : null}

            <button
              className="admin-login-submit"
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
