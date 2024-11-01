"use client";

import { Box, Heading } from "@biom3/react";
import Recipes from "./components/Recipes/Recipes";
import Inventory from "./components/Inventory/Inventory";
import { useCollectionQuery } from "./hooks";
import Layout from "@/app/components/Layout/Layout";
import Balance from "./components/Balance/Balance";
import { GOLDEN_AXE_ADDRESS } from "./contants";

export default function Home() {
  const { data: collections, error, isLoading } = useCollectionQuery();

  return (
    <Layout>
      <Box
        sx={{
          display: "flex",
          flexDirection: "row",
          gap: "base.spacing.x8",
          padding: "base.spacing.x8",
        }}
      >
        {isLoading && <Heading size="xSmall">Loading Collection...</Heading>}
        {error && <Heading size="xSmall">Error: {error.message}</Heading>}
        {collections && collections.length > 0 && (
          <>
            <Recipes collections={collections} />
            <Box sx={{display: 'flex', flexDirection: 'column', paddingLeft: "base.spacing.x8"}}>
              <Balance />
              <Box
              sx={{
                display: "flex",
                flexDirection: "row",
                gap: "base.spacing.x8",
                paddingTop: "base.spacing.x8",
              }}
            >
              <Inventory collection={collections.find((col) => col.type === 'ERC1155')!} heading="Resources" />
              <Inventory collection={collections.find((col) => col.type === 'ERC721')!} heading="Rare items" />
              </Box>
            </Box>
            
          </>
        )}
      </Box>
    </Layout>
  );
}
