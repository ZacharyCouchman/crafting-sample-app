import { Body, Box, Button, LoadingOverlay } from "@biom3/react";
import Banners from "./Banners";
import SideMenu from "../SideMenu/SideMenu";
import { usePassportProvider } from "@/app/context";
import { useEffect, useState } from "react";

export default function Layout({ children }: Readonly<{ children: React.ReactNode }>) {
  const { ready, authenticated, login } = usePassportProvider();
  const [loadingMessage, setLoadingMessage] = useState<"Loading" | "Logging in" | undefined>(
    undefined
  );

  useEffect(() => {
    if (!ready && loadingMessage === undefined) {
      setLoadingMessage("Loading");
    } else if (ready && loadingMessage === "Loading") {
      setLoadingMessage(undefined);
    }
  }, [ready, loadingMessage]);

  

  return (
    <Box
      sx={{
        height: "100%",
      }}
    >
      <Box
        sx={{
          d: "flex",
          flexDirection: ["column", "row"],
          position: "auto",
          h: "100%",
          overflowY: "auto",
        }}
      >
        <SideMenu />
        {ready &&
          (authenticated ? (
            <Box>{children}</Box>
          ) : null)}
        <Box
          sx={{
            position: 'absolute',
            top: 'base.spacing.x4',
            right: 'base.spacing.x4',
            padding: "base.spacing.x4",
          }}
        >
          <Banners />
        </Box>
        <LoadingOverlay visible={!!loadingMessage}>
          <LoadingOverlay.Content>
            <Body>{loadingMessage}</Body>
          </LoadingOverlay.Content>
        </LoadingOverlay>
      </Box>
    </Box>
  );
}
