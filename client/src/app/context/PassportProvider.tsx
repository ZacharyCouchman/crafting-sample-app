import { config, passport } from "@imtbl/sdk";
import React, { useCallback, useContext, useEffect, useMemo, useState } from "react";
import { createContext } from "react";
import { providers } from "ethers";

export const passportInstance = new passport.Passport({
  baseConfig: {
    environment: config.Environment.SANDBOX,
    publishableKey: process.env.NEXT_PUBLIC_PUBLISHABLE_KEY ?? "", // replace with your publishable API key from Hub
  },
  clientId: process.env.NEXT_PUBLIC_PASSPORT_CLIENT_ID ?? "CLIENT_ID", // replace with your client ID from Hub
  redirectUri: process.env.NEXT_PUBLIC_PASSPORT_REDIRECT_URI ?? "REDIRECT_URI", // replace with one of your redirect URIs from Hub
  logoutRedirectUri: process.env.NEXT_PUBLIC_PASSPORT_LOGOUT_REDIRECT_URI ?? "LOGOUT_REDIRECT_URI", // replace with one of your logout URIs from Hub
  audience: "platform_api",
  scope: "openid offline_access email transact",
  popupOverlayOptions: {
    disableGenericPopupOverlay: false, // Set to true to disable the generic pop-up overlay
    disableBlockedPopupOverlay: false, // Set to true to disable the blocked pop-up overlay
  },
});

const PassportContext = createContext<{
  client: passport.Passport;
  web3Provider: providers.Web3Provider | undefined;
  walletAddress: string | undefined;
  userProfile: passport.UserProfile | null;
  authenticated: boolean;
  ready: boolean;
  login: () => Promise<void>;
  logout: () => Promise<void>;
  loginCallback: () => Promise<void>;
}>({
  client: passportInstance,
  web3Provider: undefined,
  walletAddress: undefined,
  userProfile: null,
  authenticated: false,
  ready: false,
  login: async () => {},
  logout: async () => {},
  loginCallback: async () => {},
});

export function PassportProvider({ children }: { children: React.ReactNode }) {
  const [web3Provider, setWeb3Provider] = useState<providers.Web3Provider | undefined>();
  const [walletAddress, setWalletAddress] = useState<string>();
  const [userProfile, setUserProfile] = useState<passport.UserProfile | null>(null);
  const [authenticated, setAuthenticated] = useState<boolean>(false);
  const [ready, setReady] = useState<boolean>(false);

  const login = useCallback(async () => {
    setUserProfile(await passportInstance.login());
  }, []);

  const loginCallback = useCallback(async () => passportInstance.loginCallback(), []);

  const logout = useCallback(async () => {
    await passportInstance.logout();
    setWeb3Provider(undefined);
    setWalletAddress(undefined);
    setUserProfile(null);
    setAuthenticated(false);
    setReady(true)
  }, []);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        setWeb3Provider(new providers.Web3Provider(passportInstance.connectEvm()));
        const profile = await passportInstance.getUserInfo();
        if (profile) {
          setUserProfile(profile);
        } else {
          setAuthenticated(false);
          setReady(true);
        }
      } catch (e) {
        // Likely due to invalid refresh token, force a re-auth
        await logout();
      }
    };
    fetchUser();
  }, [logout]);

  // Handle userProfile set
  useEffect(() => {
    const authenticate = async () => {
      if (!userProfile) return;

      try {
        const idToken = await passportInstance.getIdToken();
        const accessToken = await passportInstance.getAccessToken();
        if (!!accessToken && !!idToken) {
          setAuthenticated(true);
          const accounts = await web3Provider!.provider?.request!({ method: "eth_requestAccounts" });
          setWalletAddress(accounts[0]);
          setReady(true);
        } else {
          // Invalid session, no access or id token
          await logout();
        }
      } catch (error) {
        console.error({ error });
        await logout();
      }
    };
    authenticate();
  }, [logout, userProfile, web3Provider]);

  const values = useMemo(
    () => ({ web3Provider, walletAddress, client: passportInstance, login, logout, loginCallback, authenticated, ready, userProfile }),
    [web3Provider, walletAddress, login, logout, loginCallback, authenticated, ready, userProfile]
  );

  return <PassportContext.Provider value={values}>{children}</PassportContext.Provider>;
}

export function usePassportProvider() {
  return useContext(PassportContext);
}
