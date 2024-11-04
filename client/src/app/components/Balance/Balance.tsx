import { CRAFTING_GOLD_TOKEN_ADDRESS } from '@/app/contants';
import { useBalanceQuery } from '@/app/hooks/useQuery'
import { Box, FramedImage, Heading } from '@biom3/react'
import React from 'react'

function Balance() {
  const balanceResult = useBalanceQuery({tokenAddress: CRAFTING_GOLD_TOKEN_ADDRESS});
  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "row",
        alignItems: "center",
        gap: "base.spacing.x4",
        width: ["100%", "450px"],
      }}
    >
      <FramedImage 
        circularFrame
        relativeImageSizeInLayout={'lg'}
        imageUrl={balanceResult?.token.image_url || ''} 
        alt={balanceResult?.token.name || 'token img'} 
        sx={{height: 'base.icon.size.200', width: 'base.icon.size.200'}} 
        />
      <Heading size={'xSmall'}>{`${balanceResult?.token.name}: ${balanceResult?.formattedBalance}`}</Heading>
    </Box>
  )
}

export default Balance