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
 * GitHub OAuth — uses PWA as redirect proxy since GitHub only allows 1 callback URL.
 * Flow: App → GitHub → PWA callback → PWA redirects to theprimeway://auth?code=xxx → App
 */
export function useGitHubAuth() {
  const loginWithOAuth = useAuthStore((s) => s.loginWithOAuth);
  const [isLoading, setIsLoading] = useState(false);

  const signIn = useCallback(async () => {
    setIsLoading(true);
    try {
      const redirectUri = `${process.env.EXPO_PUBLIC_API_URL}/api/auth/mobile/github/callback`;
      const appScheme = 'theprimeway://auth';
      const authUrl =
        `https://github.com/login/oauth/authorize` +
        `?client_id=${process.env.EXPO_PUBLIC_GITHUB_CLIENT_ID}` +
        `&redirect_uri=${encodeURIComponent(redirectUri)}` +
        `&scope=read:user+user:email` +
        `&state=${encodeURIComponent(appScheme)}`;

      const result = await WebBrowser.openAuthSessionAsync(authUrl, 'theprimeway://auth');

      if (result.type === 'success' && result.url) {
        const url = new URL(result.url);
        const code = url.searchParams.get('code');
        if (code) {
          await loginWithOAuth('github', code);
          return true;
        }
      }
      return false;
    } catch (error) {
      console.error('[OAuth] GitHub sign-in error:', error);
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [loginWithOAuth]);

  return { signIn, isLoading };
}
