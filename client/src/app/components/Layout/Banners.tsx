import React from "react";
import { Banner, Stack } from "@biom3/react";
import { useMessageProvider } from "@/app/context";

export default function Banners() {
  const { messages, removeMessage } = useMessageProvider();

  return (
    <>
      {messages ? (
        <Stack gap="base.spacing.x2">
          {messages.toReversed().map((message, index) => (
            <Banner key={index} variant={message.status}>
              <Banner.Caption>{message.message}</Banner.Caption>
              <Banner.RightButton onClick={() => removeMessage(index)}>Close</Banner.RightButton>
            </Banner>
          ))}
        </Stack>
      ) : null}
    </>
  );
}