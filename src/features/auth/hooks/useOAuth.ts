import { useCallback, useEffect, useState } from 'react';
import * as AuthSession from 'expo-auth-session';
import * as WebBrowser from 'expo-web-browser';
import { useAuthStore } from '@shared/stores/authStore';
import { Platform } from 'react-native';
import {
  GoogleSignin,
  isSuccessResponse,
  statusCodes,
} from '@react-native-google-signin/google-signin';

// Ensure browser sessions complete correctly
WebBrowser.maybeCompleteAuthSession();

// Configure Google Sign-In once
GoogleSignin.configure({
  webClientId: process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID,
  iosClientId: process.env.EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID,
  offlineAccess: false,
  scopes: ['email', 'profile'],
});

/**
 * Google One Tap / Native Sign-In — no browser redirect needed.
 */
export function useGoogleAuth() {
  const loginWithOAuth = useAuthStore((s) => s.loginWithOAuth);
  const [isLoading, setIsLoading] = useState(false);

  const signIn = useCallback(async () => {
    setIsLoading(true);
    try {
      await GoogleSignin.hasPlayServices();
      const response = await GoogleSignin.signIn();

      if (isSuccessResponse(response)) {
        const idToken = response.data?.idToken;
        if (idToken) {
          await loginWithOAuth('google', idToken);
          return true;
        }
      }
      return false;
    } catch (error: any) {
      if (error?.code === statusCodes.SIGN_IN_CANCELLED) {
        // User cancelled — not an error
      } else if (error?.code === statusCodes.IN_PROGRESS) {
        console.warn('[OAuth] Google sign-in already in progress');
      } else {
        console.error('[OAuth] Google sign-in error:', error);
      }
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [loginWithOAuth]);

  return { signIn, isLoading };
}

/**
 * Apple Sign-In (iOS only) — native popup.
 */
export function useAppleAuth() {
  const loginWithOAuth = useAuthStore((s) => s.loginWithOAuth);
  const [isLoading, setIsLoading] = useState(false);

  const signIn = useCallback(async () => {
    if (Platform.OS !== 'ios') return false;

    setIsLoading(true);
    try {
      const AppleAuthentication = require('expo-apple-authentication');
      const credential = await AppleAuthentication.signInAsync({
        requestedScopes: [
          AppleAuthentication.AppleAuthenticationScope.FULL_NAME,
          AppleAuthentication.AppleAuthenticationScope.EMAIL,
        ],
      });

      if (credential.identityToken) {
        await loginWithOAuth('apple', credential.identityToken);
        return true;
      }
      return false;
    } catch (error: any) {
      if (error?.code !== 'ERR_REQUEST_CANCELED') {
        console.error('[OAuth] Apple sign-in error:', error);
      }
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [loginWithOAuth]);

  return { signIn, isLoading, isAvailable: Platform.OS === 'ios' };
}

/**
 * GitHub OAuth via Device Flow — no redirect_uri needed.
 * Flow:
 * 1. App requests device_code from backend
 * 2. User opens verification_uri in browser and enters user_code
 * 3. App polls backend until user authorizes
 * 4. Backend returns access_token → app logs in via OAuth endpoint
 */
export function useGitHubAuth() {
  const loginWithOAuth = useAuthStore((s) => s.loginWithOAuth);
  const [isLoading, setIsLoading] = useState(false);
  const [userCode, setUserCode] = useState<string | null>(null);

  const signIn = useCallback(async () => {
    setIsLoading(true);
    setUserCode(null);
    try {
      const { default: apiClient } = await import('@shared/api/client');
      const api = apiClient.getAxiosInstance();

      // Step 1: Get device code
      const { data: deviceData } = await api.post('/api/auth/mobile/github/device-code');
      const { device_code, user_code, verification_uri, interval = 5 } = deviceData;

      setUserCode(user_code);

      // Open GitHub verification page
      await WebBrowser.openBrowserAsync(verification_uri);

      // Step 2: Poll for token (max 2 minutes)
      const maxAttempts = Math.ceil(120 / interval);
      for (let i = 0; i < maxAttempts; i++) {
        await new Promise((r) => setTimeout(r, interval * 1000));

        try {
          const { data: tokenData, status } = await api.post('/api/auth/mobile/github/device-token', {
            device_code,
          });

          if (status === 202) continue; // authorization_pending
          if (tokenData.error === 'authorization_pending') continue;
          if (tokenData.error) break; // expired or denied

          if (tokenData.access_token) {
            await loginWithOAuth('github', tokenData.access_token);
            setUserCode(null);
            return true;
          }
        } catch (pollError: any) {
          if (pollError?.response?.status === 202) continue;
          break;
        }
      }

      setUserCode(null);
      return false;
    } catch (error) {
      console.error('[OAuth] GitHub sign-in error:', error);
      setUserCode(null);
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [loginWithOAuth]);

  return { signIn, isLoading, userCode };
}
