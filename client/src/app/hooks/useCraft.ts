import { GuardedMulticaller2Abi, ImmutableERC1155Abi } from "@imtbl/contracts";
import { Address, Collection, CraftResult } from "../types";
import { usePassportProvider } from "@/app/context";
import { Contract } from "ethers";

type Call = {
  target: `0x${string}`;
  functionSignature: string;
  data: `0x${string}`;
};

type ExecuteArgs = {
  multicallSigner: `0x${string}`;
  reference: `0x${string}`;
  calls: Call[];
  deadline: bigint;
  signature: `0x${string}`;
};

export function useSubmitCraft(): {
  submitCraft: (recipeId: number) => Promise<CraftResult>;
} {
  const { walletAddress } = usePassportProvider();

  const submitCraft = async (recipeId: number): Promise<CraftResult> => {
    if (!walletAddress) {
      throw new Error("User is not authenticated");
    }
    const res = await fetch(`${process.env.NEXT_PUBLIC_SERVER_URL}/craft/${recipeId}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        player_address: walletAddress,
      }),
    });
    const data = await res.json();
    const calls = data.calls.map((call: { target: any; functionSignature: any; data: any }) => ({
      target: call.target,
      functionSignature: call.functionSignature,
      data: call.data,
    }));
    return {
      multicallerAddress: data.multicallerAddress,
      multicallSigner: data.multicallSigner,
      reference: data.reference,
      calls: calls,
      deadline: data.deadline,
      signature: data.signature,
    };
  };

  return {
    submitCraft,
  };
}

export function useCraftTx(): {
  sendCraftTx: ({
    multicallerAddress,
    executeArgs,
  }: {
    multicallerAddress: Address;
    executeArgs: ExecuteArgs;
  }) => Promise<string>;
} {
  const { web3Provider } = usePassportProvider();

  const sendCraftTx = async ({
    multicallerAddress,
    executeArgs,
  }: {
    multicallerAddress: Address;
    executeArgs: ExecuteArgs;
  }) => {
    const contract = new Contract(multicallerAddress as string, GuardedMulticaller2Abi, web3Provider?.getSigner());
    const tx = await contract.execute(
      executeArgs.multicallSigner,
      executeArgs.reference,
      executeArgs.calls,
      executeArgs.deadline,
      executeArgs.signature,
    );
    const receipt = await web3Provider?.waitForTransaction(tx.hash);
    console.log(receipt);
    if (receipt.status === 0) {
      throw new Error("Craft failed");
    }
    return receipt!.transactionHash
  };

  return {
    sendCraftTx,
  };
}

export function useSetApprovalAllTx(): {
  setApprovalForAll: ({
    collection,
    operator,
  }: {
    collection: Collection;
    operator: Address;
  }) => Promise<void>;
} {
  const { web3Provider } = usePassportProvider();

  const setApprovalForAll = async ({
    collection,
    operator,
  }: {
    collection: Collection;
    operator: Address;
  }) => {
    const contract = new Contract(collection.address as string, ImmutableERC1155Abi, web3Provider?.getSigner());
    const tx = await contract.setApprovalForAll(operator, true);
    const receipt = await web3Provider?.waitForTransaction(tx.hash);
    console.log(receipt);
    if (receipt.status === 0) {
      throw new Error("Set approval failed");
    }
  };

  return {
    setApprovalForAll,
  };
}

export function useSetApproveSpendingTx(): {
  setApproveSpending: ({
    tokenAddress,
    operator,
    amount,
  }: {
    tokenAddress: Address;
    operator: Address;
    amount: BigInt
  }) => Promise<void>;
} {
  const { web3Provider } = usePassportProvider();

  const setApproveSpending = async ({
    tokenAddress,
    operator,
    amount,
  }: {
    tokenAddress: Address;
    operator: Address;
    amount: BigInt
  }) => {
    const contract = new Contract(tokenAddress as string, ["function approve(address,uint256)"], web3Provider?.getSigner());
    const tx = await contract.approve(operator, amount);
    const receipt = await web3Provider?.waitForTransaction(tx.hash);
    console.log(receipt);
    if (receipt.status === 0) {
      throw new Error("Set approve failed");
    }
  };

  return {
    setApproveSpending,
  };
}
