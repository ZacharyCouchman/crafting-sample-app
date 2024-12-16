import { CRAFTING_GOLD_TOKEN_ADDRESS, SIMPLE_FAUCET_ADDRESS } from '@/app/contants';
import { useBalanceQuery } from '@/app/hooks/useQuery'
import { Box, Button, Heading, LoopingText } from '@biom3/react'
import React, { useState } from 'react'
import {Contract} from "@ethersproject/contracts"
import { usePassportProvider } from '@/app/context';
import { useMutation } from '@tanstack/react-query';

function Balance() {
  const {data: balanceResult, isLoading} = useBalanceQuery({tokenAddress: CRAFTING_GOLD_TOKEN_ADDRESS});
  const {web3Provider} = usePassportProvider();

  const [claimed, setClaimed] = useState(false); // only 1 claim per day

 const tokenClaim = useMutation({
    mutationKey: ['claimTokens'],
    mutationFn: async () => {
      if(!web3Provider) return;
  
      try{
        setClaimed(true);
        const address = await web3Provider.getSigner().getAddress()
  
        const faucet = new Contract(
          SIMPLE_FAUCET_ADDRESS,
          ["function claim(address) public returns(bool)"],
          web3Provider.getSigner()
        )
    
        await faucet.claim(address);
      } catch(err: any) {
        // setClaimed(false);
        console.log(err)
        alert(err?.reason || 'Error occured while claiming tokens')
        throw err;
      }
    },
  })

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
      {/*eslint-disable-next-line @next/next/no-img-element*/}
      <img alt={balanceResult?.token.name || 'Gold'} src={balanceResult?.token.image_url || ''} height={'20px'} width={'20px'} />
      <Heading size={'xSmall'}>{`${balanceResult?.token.name}: ${balanceResult?.formattedBalance}`}</Heading>
      {!claimed && <Button onClick={() => tokenClaim.mutateAsync()}>Claim Crafting Gold</Button>}
      {tokenClaim.isPending && <Heading size={'xSmall'}>Loading...</Heading>}
      {tokenClaim.isSuccess && <Heading size={'xSmall'}>Claimed!</Heading>}
    </Box>
  )
}

export default Balance