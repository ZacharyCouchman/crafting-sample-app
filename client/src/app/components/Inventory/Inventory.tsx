import { useCollectionItemsQuery } from "@/app/hooks/useQuery";
import { Collection, nftToName } from "@/app/types";
import { usePassportProvider } from "@/app/context";
import { Body, Box, Caption, Card, Grid, Heading } from "@biom3/react";
import { useImagePreload } from "@/app/hooks/useImagePreload";
import { useMemo, useState } from "react";

export default function Inventory({ collection, heading }: { collection: Collection, heading:string }) {
  const [stacked, setStacked] = useState(false);
  const { walletAddress } = usePassportProvider();
  const { data, error, isLoading } = useCollectionItemsQuery({
    owner: walletAddress ? walletAddress as `0x${string}` : undefined,
    collection: collection.address
  });

  const imageUrls = useMemo(() => data?.map(nft => nft.image) || [], [data])

  const imagesLoaded = useImagePreload({srcArray: imageUrls})

  if (isLoading || !imagesLoaded) {
    return <Heading size="xSmall">Loading...</Heading>;
  } else if (error) {
    return <Heading size="xSmall">Error: {error.message}</Heading>;
  }
  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        gap: "base.spacing.x4",
        width: ["100%", "450px"],
        wordBreak: 'break-all'
      }}
    >
      <Heading>{heading}</Heading>
      <Heading size="xSmall">Collection:</Heading>
      <Body>{collection.address}</Body>
      <Grid>
        {data?.map((nft) => (
          <Card key={`${nft.name}-${nft.tokenId}`}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img alt='img' src={nft.image} style={{objectFit: 'cover', borderRadius: '8px'}} width={'100%'} />
            <Box sx={{padding: 'base.spacing.x1', display: 'flex', flexDirection: 'column', gap:'base.spacing.x1'}}>
              <Heading size={'xSmall'}>{nftToName(nft)}</Heading>
              <Caption>{nft.value}</Caption>
              <Body size={'small'} sx={{wordBreak: 'break-all'}}>Token {nft.tokenId}</Body>
            </Box>
          </Card>
        ))}
      </Grid>
    </Box>
  );
}
