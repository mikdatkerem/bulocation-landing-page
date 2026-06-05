import type { Dispatch, SetStateAction } from 'react';
import { adminApi, getApiErrorMessage, getApiFieldErrors } from '../services/adminApi';
import type { Session, SidebarKey } from '../types/admin.types';

type UseAdminAuthActionsArgs = {
  error: string | null;
  loginFieldErrors: Record<string, string[]> | null;
  success: string | null;
  clearSession: () => void;
  setSession: (session: Session) => void;
  setActiveView: Dispatch<SetStateAction<SidebarKey>>;
  setBusy: Dispatch<SetStateAction<boolean>>;
  setError: Dispatch<SetStateAction<string | null>>;
  setLoginFieldErrors: Dispatch<SetStateAction<Record<string, string[]> | null>>;
  setSuccess: Dispatch<SetStateAction<string | null>>;
};

export default function useAdminAuthActions({
  error,
  loginFieldErrors,
  success,
  clearSession,
  setSession,
  setActiveView,
  setBusy,
  setError,
  setLoginFieldErrors,
  setSuccess,
}: UseAdminAuthActionsArgs) {
  async function handleLogin(emailOrUserName: string, password: string) {
    try {
      setBusy(true);
      setError(null);
      setSuccess(null);
      setLoginFieldErrors(null);
      const auth = await adminApi.login(emailOrUserName, password);
      setSession({
        accessToken: auth.accessToken,
        refreshToken: auth.refreshToken,
        accessTokenExpiresAt: auth.accessTokenExpiresAt,
        refreshTokenExpiresAt: auth.refreshTokenExpiresAt,
      });
      setActiveView('organizations');
    } catch (loginError) {
      setLoginFieldErrors(getApiFieldErrors(loginError));
      setError(getApiErrorMessage(loginError, 'Giris yapilamadi.'));
    } finally {
      setBusy(false);
    }
  }

  async function handleForgotPassword(email: string) {
    try {
      setBusy(true);
      setError(null);
      setSuccess(null);
      setLoginFieldErrors(null);
      await adminApi.forgotPassword(email.trim());
      setSuccess('E-posta sistemde kayitliysa sifre yenileme baglantisi gonderildi.');
    } catch (requestError) {
      setError(getApiErrorMessage(requestError, 'Sifirlama baglantisi gonderilemedi.'));
    } finally {
      setBusy(false);
    }
  }

  async function handleResetPassword(token: string, newPassword: string) {
    try {
      setBusy(true);
      setError(null);
      setSuccess(null);
      setLoginFieldErrors(null);
      await adminApi.resetPassword(token.trim(), newPassword);
      setSuccess('Sifreniz guncellendi. Yeni sifrenizle giris yapabilirsiniz.');
    } catch (requestError) {
      setError(getApiErrorMessage(requestError, 'Sifre yenilenemedi.'));
    } finally {
      setBusy(false);
    }
  }

  function handleLogout() {
    clearSession();
    setError(null);
    setLoginFieldErrors(null);
    setSuccess(null);
  }

  function clearLoginFeedback() {
    if (!error && !loginFieldErrors && !success) {
      return;
    }

    setError(null);
    setLoginFieldErrors(null);
    setSuccess(null);
  }

  return {
    handleLogin,
    handleForgotPassword,
    handleResetPassword,
    handleLogout,
    clearLoginFeedback,
  };
}
