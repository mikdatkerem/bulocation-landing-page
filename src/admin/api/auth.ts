import { request } from './client';
import type { AuthResponse, UserProfile } from './types';

export const authApi = {
  login: (emailOrUserName: string, password: string) =>
    request<AuthResponse>('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ emailOrUserName, password }),
    }),

  refreshToken: (refreshToken: string) =>
    request<AuthResponse>('/api/auth/refresh-token', {
      method: 'POST',
      body: JSON.stringify({ refreshToken }),
    }),

  forgotPassword: (email: string) =>
    request<void>('/api/auth/forgot-password', {
      method: 'POST',
      body: JSON.stringify({ email }),
    }),

  resetPassword: (token: string, newPassword: string) =>
    request<void>('/api/auth/reset-password', {
      method: 'POST',
      body: JSON.stringify({ token, newPassword }),
    }),

  resendEmailVerification: (email: string) =>
    request<void>('/api/auth/resend-email-verification', {
      method: 'POST',
      body: JSON.stringify({ email }),
    }),

  verifyEmail: (token: string) =>
    request<void>('/api/auth/verify-email', {
      method: 'POST',
      body: JSON.stringify({ token }),
    }),

  getCurrentUser: (token: string) =>
    request<UserProfile>('/api/auth/me', {}, token),
};
