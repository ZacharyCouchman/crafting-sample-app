import { useCollectionItemsQuery } from "@/app/hooks/useQuery";
import { Collection, nftToName } from "@/app/types";
import { usePassportProvider } from "@/app/context";
import { Box, Card, Grid, Heading } from "@biom3/react";
import { useImagePreload } from "@/app/hooks/useImagePreload";
import { useMemo } from "react";

export default function Inventory({ collection, heading }: { collection: Collection, heading:string }) {
  const { walletAddress } = usePassportProvider();
  const { data, error, isLoading } = useCollectionItemsQuery({
    owner: walletAddress ? walletAddress as `0x${string}` : undefined,
    collection: collection.address,
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
        width: "450px",
      }}
    >
      <Heading>{heading}</Heading>
      <Heading size="xSmall">Collection: {collection.address}</Heading>
      <Grid>
        {data?.map((nft) => (
          <Card key={`${nft.name}-${nft.tokenId}`}>
            <Card.AssetImage relativeImageSizeInLayout={'full'} imageUrl={nft.image} />
            <Card.Title>{nftToName(nft)}</Card.Title>
            <Card.Caption>{nft.value}</Card.Caption>
            <Card.Description>Token {nft.tokenId}</Card.Description>
          </Card>
        ))}
      </Grid>
    </Box>
  );
}
