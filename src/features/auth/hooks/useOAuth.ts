import { useCallback, useState } from 'react';
import * as AuthSession from 'expo-auth-session';
import * as WebBrowser from 'expo-web-browser';
import * as Google from 'expo-auth-session/providers/google';
import { useAuthStore } from '@shared/stores/authStore';
import { Platform } from 'react-native';

// Ensure browser sessions complete correctly
WebBrowser.maybeCompleteAuthSession();

const GOOGLE_CLIENT_ID = process.env.EXPO_PUBLIC_GOOGLE_CLIENT_ID;

export function useGoogleAuth() {
  const loginWithOAuth = useAuthStore((s) => s.loginWithOAuth);
  const [isLoading, setIsLoading] = useState(false);

  const [, response, promptAsync] = Google.useAuthRequest({
    androidClientId: GOOGLE_CLIENT_ID,
    iosClientId: GOOGLE_CLIENT_ID,
    webClientId: GOOGLE_CLIENT_ID,
    scopes: ['openid', 'email', 'profile'],
  });

  const signIn = useCallback(async () => {
    setIsLoading(true);
    try {
      const result = await promptAsync();
      if (result.type === 'success' && result.authentication?.accessToken) {
        await loginWithOAuth('google', result.authentication.accessToken);
        return true;
      }
      return false;
    } catch (error) {
      console.error('[OAuth] Google sign-in error:', error);
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [promptAsync, loginWithOAuth]);

  return { signIn, isLoading };
}

export function useAppleAuth() {
  const loginWithOAuth = useAuthStore((s) => s.loginWithOAuth);
  const [isLoading, setIsLoading] = useState(false);

  const signIn = useCallback(async () => {
    if (Platform.OS !== 'ios') return false;

    setIsLoading(true);
    try {
      // Apple Sign In is only available on iOS via expo-apple-authentication
      const AppleAuthentication = require('expo-apple-authentication');
      const credential = await AppleAuthentication.signInAsync({
        requestedScopes: [
          AppleAuthentication.AppleAuthenticationScope.FULL_NAME,
          AppleAuthentication.AppleAuthenticationScope.EMAIL,
        ],
      });

      if (credential.identityToken) {
        // For Apple, we need to send the idToken
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

export function useGitHubAuth() {
  const loginWithOAuth = useAuthStore((s) => s.loginWithOAuth);
  const [isLoading, setIsLoading] = useState(false);

  const signIn = useCallback(async () => {
    setIsLoading(true);
    try {
      // GitHub OAuth via web browser redirect
      const redirectUri = AuthSession.makeRedirectUri({ scheme: 'theprimeway' });
      const authUrl = `https://github.com/login/oauth/authorize?client_id=${process.env.EXPO_PUBLIC_GITHUB_CLIENT_ID}&redirect_uri=${encodeURIComponent(redirectUri)}&scope=read:user+user:email`;

      const result = await WebBrowser.openAuthSessionAsync(authUrl, redirectUri);

      if (result.type === 'success' && result.url) {
        const url = new URL(result.url);
        const code = url.searchParams.get('code');
        if (code) {
          // Exchange code for token on backend
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
