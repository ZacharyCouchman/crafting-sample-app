import { usePassportProvider } from "@/app/context";
import { Box, Logo, Heading, Button, EllipsizedText, LoadingOverlay, Body } from "@biom3/react";
import { useState } from "react";

export default function SideMenu() {
  const { ready, authenticated, userProfile, walletAddress, login, logout } = usePassportProvider();
  const [loadingMessage, setLoadingMessage] = useState<string | undefined>();


  const onLogin = async () => {
    setLoadingMessage("Logging in");
    try {
      await login();
    } finally {
      setLoadingMessage(undefined);
    }
  };

  const onLogout = async () => {
    try {
      setLoadingMessage("Logging out");
      await logout();
    } catch (error) {
      console.error(error);
    } finally {
      setLoadingMessage(undefined);
    }
  };

  return (
    <Box
      sx={{
        w: "100%",
        maxw: "350px",
        h: "100%",
        top: [null, null, "0px"],
        pos: "sticky",
        d: "flex",
        background: "var(--on-dark-base-color-neutrals-800, #1F1F1F)",
        flexDirection: "column",
        transitionProperty: "transform",
        transitionDuration: "base.animation.fast.cssDuration",
        transitionTimingFunction: "base.animation.fast.cssEasing",
        overflow: "auto",
        boxShadow: "base.shadow.200",
        borderTopRightRadius: "base.borderRadius.x8",
        zIndex: 2,
      }}
      rc={<aside />}
    >
      <Box
        sx={{
          marginTop: "base.spacing.x4",
          padding: "base.spacing.x4",
          display: "flex",
          alignItems: "center",
          flexDirection: "column",
          gap: "base.spacing.x4",
        }}
      >
        <Logo logo="ImmutableHorizontalLockup" sx={{ maxh: "base.spacing.x10" }} />
        <Heading size="small">Crafting</Heading>
        {ready && authenticated && walletAddress && (
          <>
            {userProfile?.email && <Heading size="xSmall">{userProfile?.email}</Heading>}
            <EllipsizedText text={walletAddress} />
            <Button onClick={onLogout}>Logout</Button>
          </>
        )}
        {!authenticated && (
            <Box sx={{ padding: "base.spacing.x4" }}>
              <Button onClick={onLogin} variant="primary" sx={{ background: "base.gradient.1" }}>
                <Button.Logo logo="PassportSymbol" />
                Login with Passport
              </Button>
            </Box>
          )}
      </Box>
      <LoadingOverlay visible={!!loadingMessage}>
        <LoadingOverlay.Content>
          <Body>{loadingMessage}</Body>
        </LoadingOverlay.Content>
      </LoadingOverlay>
    </Box>
  );
}
