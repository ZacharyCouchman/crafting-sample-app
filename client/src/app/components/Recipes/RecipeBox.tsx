import {
  Box,
  Heading,
  Button,
  Icon,
  MenuItem,
  Stack,
  LoadingOverlay,
} from '@biom3/react';
import { Collection, tokenToName, Recipe } from '@/app/types';
import {
  useSubmitCraft,
  useCraftTx,
  useApprovalQuery,
  useSetApprovalAllTx,
} from '@/app/hooks';
import { useMessageProvider } from '@/app/context';
import { useState } from 'react';
import { useAllowanceQuery } from '@/app/hooks/useQuery';
import { useSetApproveSpendingTx } from '@/app/hooks/useCraft';
import { CRAFTING_GOLD_TOKEN_ADDRESS } from '@/app/contants';

export default function RecipeBox({
  recipe,
  collections,
}: {
  recipe: Recipe;
  collections: Collection[];
}) {
  const { submitCraft } = useSubmitCraft();
  const { sendCraftTx } = useCraftTx();
  const { getIsApprovedForAll } = useApprovalQuery();
  const { setApprovalForAll } = useSetApprovalAllTx();
  const { getAllowance } = useAllowanceQuery();
  const { setApproveSpending } = useSetApproveSpendingTx();
  const [isLoading, setIsLoading] = useState(false);
  const { addMessage } = useMessageProvider();

  const erc20Contract = collections.find((collection) => collection.type === 'ERC20')!;
  const erc1155Collection = collections.find((collection) => collection.type === 'ERC1155')!;
  const erc721Collection = collections.find((collection) => collection.type === 'ERC721')!;

  const execute = async (recipe: Recipe) => {
    try {
      setIsLoading(true);
      const res = await submitCraft(recipe.id);

      const isApproved = await getIsApprovedForAll({
        collection: erc1155Collection,
        operator: res.multicallerAddress,
      });

      if(recipe.inputs.some((input) => input.type === 'ERC20')) {
        const allowance = await getAllowance({
          tokenAddress: erc20Contract.address, 
          operator: res.multicallerAddress
        });
  
        if(allowance < BigInt(5*10**18)) {
          await setApproveSpending({
            tokenAddress: erc20Contract.address,
            operator: res.multicallerAddress,
            amount: BigInt(5*10**18)
          })
        }
      }

      if (!isApproved) {
        await setApprovalForAll({
          collection: erc1155Collection,
          operator: res.multicallerAddress,
        });
      }

      const txHash = await sendCraftTx({
        multicallerAddress: res.multicallerAddress,
        executeArgs: {
          multicallSigner: res.multicallSigner,
          reference: res.reference,
          calls: res.calls,
          deadline: BigInt(res.deadline),
          signature: res.signature,
        },
      });
      addMessage({
        status: 'success',
        message: 'Crafting succeeded!',
        link: `https://explorer.testnet.immutable.com/tx/${txHash}`
      });
    } catch (e: any) {
      console.error(e);
      addMessage({
        status: 'fatal',
        message: 'Crafting failed! View console for more details.',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Box
      sx={{
        background: 'base.color.neutral.800',
        borderRadius: 'base.borderRadius.x2',
        borderStyle: 'solid',
        borderWidth: 'base.border.size.100',
        borderColor: 'base.color.accent.1',
        minHeight: '150px',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        padding: 'base.spacing.x4',
        gap: 'base.spacing.x4',
      }}
    >
      <Heading size="small">{recipe.name}</Heading>
      <Box
        sx={{
          display: 'flex',
          direction: 'row',
          justifyContent: 'space-between',
        }}
      >
        <Box>
          {recipe.inputs.length > 0 ? (
            <Stack>
              {recipe.inputs.map((input) => (
                <MenuItem key={`${input.type}-${input.tokenId}`} emphasized size="small">
                  <MenuItem.Label>{tokenToName(input)}</MenuItem.Label>
                  <MenuItem.Caption>{input.value}</MenuItem.Caption>
                </MenuItem>
              ))}
            </Stack>
          ) : (
            <MenuItem emphasized size="small">
              <MenuItem.Label>No Inputs</MenuItem.Label>
            </MenuItem>
          )}
        </Box>
        <Box sx={{ alignContent: 'center' }}>
          <Icon icon="ArrowForward" sx={{ width: 'base.icon.size.300' }} />
        </Box>
        <Box>
          {recipe.outputs.length > 0 ? (
            <Stack>
              {recipe.outputs.map((output) => (
                <MenuItem key={`${output.type}-${output.value}`} emphasized size="small">
                  <MenuItem.Label>{tokenToName(output)}</MenuItem.Label>
                  <MenuItem.Caption>{output.value}</MenuItem.Caption>
                </MenuItem>
              ))}
            </Stack>
          ) : (
            <MenuItem emphasized size="small">
              <MenuItem.Label>No Outputs</MenuItem.Label>
            </MenuItem>
          )}
        </Box>
      </Box>
      <Button
        onClick={() => {
          execute(recipe);
        }}
      >
        Execute
      </Button>
      <LoadingOverlay visible={isLoading}>
        <LoadingOverlay.Content>
          <LoadingOverlay.Content.LoopingText
            text={['Sending crafting transaction', recipe.name]}
            textDuration={1000}
          />
        </LoadingOverlay.Content>
      </LoadingOverlay>
    </Box>
  );
}
