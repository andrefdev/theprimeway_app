import { useCallback, useState } from 'react';
import * as WebBrowser from 'expo-web-browser';
import { Linking } from 'react-native';
import { useAuthStore } from '@shared/stores/authStore';
import { Platform } from 'react-native';

// Ensure browser sessions complete correctly
WebBrowser.maybeCompleteAuthSession();

// Lazy-load native Google Sign-In (crashes in Expo Go, works in dev builds & production)
let GoogleSigninModule: typeof import('@react-native-google-signin/google-signin') | null = null;
let googleConfigured = false;

function getGoogleSignin() {
  if (!GoogleSigninModule) {
    try {
      GoogleSigninModule = require('@react-native-google-signin/google-signin');
    } catch {
      console.warn('[OAuth] @react-native-google-signin not available (Expo Go?)');
      return null;
    }
  }
  if (!googleConfigured && GoogleSigninModule) {
    GoogleSigninModule.GoogleSignin.configure({
      webClientId: process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID,
      iosClientId: process.env.EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID,
      offlineAccess: false,
      scopes: ['email', 'profile'],
    });
    googleConfigured = true;
  }
  return GoogleSigninModule;
}

/**
 * Google One Tap / Native Sign-In.
 * Signs out first to always show account picker.
 */
export function useGoogleAuth() {
  const loginWithOAuth = useAuthStore((s) => s.loginWithOAuth);
  const [isLoading, setIsLoading] = useState(false);

  const signIn = useCallback(async () => {
    setIsLoading(true);
    try {
      const mod = getGoogleSignin();
      if (!mod) {
        console.error('[OAuth] Google Sign-In not available in this environment');
        return false;
      }

      await mod.GoogleSignin.hasPlayServices();

      // Sign out first so the account picker always shows
      try {
        await mod.GoogleSignin.signOut();
      } catch {
        // Ignore — may not be signed in
      }

      const response = await mod.GoogleSignin.signIn();

      if (mod.isSuccessResponse(response)) {
        const idToken = response.data?.idToken;
        if (idToken) {
          await loginWithOAuth('google', idToken);
          return true;
        }
      }
      return false;
    } catch (error: any) {
      if (error?.code === 'SIGN_IN_CANCELLED') {
        // User cancelled — not an error
      } else if (error?.code === 'IN_PROGRESS') {
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
 * GitHub OAuth via Device Flow.
 * 1. App gets device_code + user_code from backend
 * 2. Opens GitHub verification page (non-blocking via Linking)
 * 3. Polls backend until user authorizes
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

      // Step 1: Get device code from backend
      console.log('[OAuth] Requesting GitHub device code...');
      const { data: deviceData } = await api.post('/api/auth/mobile/github/device-code');
      console.log('[OAuth] Device code response:', JSON.stringify(deviceData));

      const { device_code, user_code, verification_uri, interval = 5 } = deviceData;

      if (!device_code || !user_code || !verification_uri) {
        console.error('[OAuth] Invalid device code response:', deviceData);
        return false;
      }

      setUserCode(user_code);

      // Open GitHub verification page (non-blocking — Linking.openURL returns immediately)
      await Linking.openURL(verification_uri);

      // Step 2: Poll for token (max 3 minutes)
      const pollInterval = Math.max(interval, 5) * 1000;
      const maxAttempts = Math.ceil(180000 / pollInterval);

      for (let i = 0; i < maxAttempts; i++) {
        await new Promise((r) => setTimeout(r, pollInterval));

        try {
          const { data: tokenData, status } = await api.post('/api/auth/mobile/github/device-token', {
            device_code,
          });

          if (status === 202) continue;
          if (tokenData.error === 'authorization_pending') continue;
          if (tokenData.error === 'slow_down') {
            // GitHub asked us to slow down, wait extra
            await new Promise((r) => setTimeout(r, 5000));
            continue;
          }
          if (tokenData.error) {
            console.error('[OAuth] GitHub device token error:', tokenData.error);
            break;
          }

          if (tokenData.access_token) {
            await loginWithOAuth('github', tokenData.access_token);
            setUserCode(null);
            return true;
          }
        } catch (pollError: any) {
          if (pollError?.response?.status === 202) continue;
          console.error('[OAuth] GitHub poll error:', pollError?.message);
          break;
        }
      }

      setUserCode(null);
      return false;
    } catch (error: any) {
      console.error('[OAuth] GitHub sign-in error:', error?.message || error);
      setUserCode(null);
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [loginWithOAuth]);

  return { signIn, isLoading, userCode };
}
