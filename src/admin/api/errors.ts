export type ApiProblem = {
  status?: number;
  title?: string;
  detail?: string;
  code?: string;
  traceId?: string;
  errors?: Record<string, string[]>;
};

export class ApiClientError extends Error {
  status?: number;
  title?: string;
  detail?: string;
  code?: string;
  traceId?: string;
  errors?: Record<string, string[]>;

  constructor(problem: ApiProblem, fallbackMessage: string) {
    super(problem.detail || problem.title || fallbackMessage);
    this.name = 'ApiClientError';
    this.status = problem.status;
    this.title = problem.title;
    this.detail = problem.detail;
    this.code = problem.code;
    this.traceId = problem.traceId;
    this.errors = problem.errors;
  }
}

export function isApiClientError(error: unknown): error is ApiClientError {
  return error instanceof ApiClientError;
}

export function getApiFieldErrors(error: unknown): Record<string, string[]> | null {
  return isApiClientError(error) ? error.errors ?? null : null;
}

export function getApiErrorMessage(error: unknown, fallbackMessage: string): string {
  if (!isApiClientError(error)) {
    return error instanceof Error ? error.message : fallbackMessage;
  }

  switch (error.code) {
    case 'auth.invalid_credentials':
      return 'E-posta veya kullanici adi ya da sifre hatali.';
    case 'auth.account_locked':
      return 'Hesap gecici olarak kilitlendi. Bir sure sonra tekrar deneyin.';
    case 'auth.account_inactive':
      return 'Hesap aktif degil. Sistem yoneticinizle iletisime gecin.';
    case 'auth.invalid_current_password':
      return 'Mevcut sifre hatali.';
    case 'conflict.email_in_use':
      return 'Bu e-posta adresi zaten kullaniliyor.';
    case 'conflict.username_in_use':
      return 'Bu kullanici adi zaten kullaniliyor.';
    case 'auth.google_not_configured':
      return 'Google ile giris henuz yapilandirilmamis.';
    case 'auth.default_role_missing':
      return 'Varsayilan kullanici rolu tanimli degil.';
    case 'auth.session_not_owned':
      return 'Bu oturum size ait degil.';
    case 'auth.authenticated_user_required':
      return 'Bu islem icin aktif oturum gerekli.';
    case 'validation_failed': {
      const firstError = Object.values(error.errors ?? {}).flat()[0];
      return firstError || 'Form alanlarini kontrol edin.';
    }
    case 'request_invalid':
      return error.detail || 'Istek tamamlanamadi. Girdileri kontrol edin.';
    case 'server_error':
      return fallbackMessage;
    case 'invalid_token':
      return 'Baglanti veya dogrulama kodu gecerli degil ya da suresi doldu.';
    default:
      return error.detail || error.title || fallbackMessage;
  }
}
