import { useQuery } from "@tanstack/react-query";
import { Address, Collection, Token, Recipe } from "../types";
import { useImmutableProvider, usePassportProvider } from "@/app/context";
import { ImmutableERC1155Abi } from "@imtbl/contracts";
import { Contract } from "ethers";

const serverURL = process.env.NEXT_PUBLIC_SERVER_URL;

export function useCollectionQuery(): {
  data: Collection[] | undefined;
  error: any;
  isLoading: boolean;
} {
  return useQuery<any, any, Collection[], any>({
    queryKey: ["collections"],
    queryFn: async () => {
      const response = await fetch(`${serverURL}/collection`);
      return response.json();
    },
    select: (data) => {
      console.log(data);
      return data.map((collection: any) => <Collection>{
        type: collection.type,
        address: collection.address,
      })
    }
    ,
  });
}

export function useRecipesQuery(): {
  data: Recipe[] | undefined;
  error: any;
  isLoading: boolean;
} {
  return useQuery<any, any, Recipe[], any>({
    queryKey: ["recipes"],
    queryFn: async () => {
      const response = await fetch(`${serverURL}/recipes`);
      return response.json();
    },
    select: (data) =>
      data.map(
        (recipe: any) =>
          <Recipe>{
            id: recipe.id,
            name: recipe.name,
            inputs: recipe.inputs,
            outputs: recipe.outputs,
          }
      ),
  });
}

export function useCollectionItemsQuery({
  collection,
  owner,
}: {
  collection: Address;
  owner: Address | undefined;
}): {
  data: Token[] | undefined;
  error: any;
  isLoading: boolean;
} {
  const { blockchainDataClient } = useImmutableProvider();

  return useQuery<any, any, Token[], any>({
    queryKey: ["collection_items", collection],
    refetchInterval: 1000 * 2,
    enabled: !!owner && !!collection,
    queryFn: async () => blockchainDataClient.listNFTsByAccountAddress({
      chainName: "imtbl-zkevm-testnet",
      accountAddress: owner!,
      contractAddress: collection,
    }),
    select: (data) =>
      data.result.map(
        (nft: any) =>
          <Token>{
            type: nft.contract_type,
            tokenId: nft.token_id,
            value: nft.balance,
            image: nft.image,
            name: nft.name
          }
      ),
  });
}

export function useApprovalQuery(): {
  getIsApprovedForAll: ({
    collection,
    operator,
  }: {
    collection: Collection;
    operator: Address;
  }) => Promise<boolean>;
} {
  const { web3Provider, walletAddress } = usePassportProvider();

  const getIsApprovedForAll = async ({
    collection,
    operator,
  }: {
    collection: Collection;
    operator: Address;
  }): Promise<boolean> => {
    if (!walletAddress) {
      throw new Error("User is not authenticated");
    }
    const contract = new Contract(
      collection.address as string,
      ImmutableERC1155Abi,
      web3Provider?.getSigner()
    );
    const res = await contract.isApprovedForAll(walletAddress as `0x${string}`, operator);
    return res;
  };

  return {
    getIsApprovedForAll,
  };
}

export function useAllowanceQuery(): {
  getAllowance: ({
    tokenAddress,
    operator,
  }: {
    tokenAddress: Address;
    operator: Address;
  }) => Promise<bigint>;
} {
  const { web3Provider, walletAddress } = usePassportProvider();

  const getAllowance = async ({
    tokenAddress,
    operator
  }: {
    tokenAddress: Address;
    operator: Address;
  }): Promise<bigint> => {
    if (!walletAddress) {
      throw new Error("User is not authenticated");
    }
    const contract = new Contract(
      tokenAddress as string,
      ["function allowance(address,address) view returns (uint256)"],
      web3Provider?.getSigner()
    );
    const res = await contract.allowance(walletAddress as `0x${string}`, operator as `0x${string}`);
    console.log("ALLOWANCE res", res)
    return BigInt(res);
  };

  return {
    getAllowance,
  };
}

export function useBalanceQuery({
  tokenAddress
}: {
  tokenAddress: Address
}) {
  const { blockchainDataClient } = useImmutableProvider();
  const { web3Provider, walletAddress } = usePassportProvider();

  const { data, isLoading } = useQuery({
    queryKey: ['balances'],
    refetchInterval: 1000 * 5,
    queryFn: async () => {
      const token = await blockchainDataClient.getToken({
        chainName: 'imtbl-zkevm-testnet',
        contractAddress: tokenAddress
      });
      const balanceHex = await web3Provider!.provider.request!({
        method: 'eth_call', params: [{
          to: tokenAddress,
          data: `0x70a08231${walletAddress!.slice(2).padStart(64, "0")}`
        },
          "latest"
        ]
      })
      const balance = BigInt(balanceHex);

      return {
        token: token.result, balance: balance.toString(),
        formattedBalance: (balance / BigInt(10 ** (token?.result?.decimals ?? 18))).toString()
      }
    }
  })

  return { data, isLoading };
}
