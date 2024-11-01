import { Injectable } from '@nestjs/common';
import { CraftResult, Recipe } from './types';
import { v4 as uuidv4 } from 'uuid';
import { ethers } from 'ethers';

const recipeMap: Map<string, Recipe> = new Map<string, Recipe>([
  [
    '1',
    {
      id: 1,
      name: 'Craft wood',
      inputs: [],
      outputs: [
        {
          type: 'ERC1155',
          address: process.env.ERC1155_COLLECTION_ADDRESS as `0x${string}`,
          tokenId: 1,
          value: 10,
        },
      ],
    },
  ],
  [
    '2',
    {
      id: 2,
      name: 'Craft stone',
      inputs: [],
      outputs: [
        {
          type: 'ERC1155',
          address: process.env.ERC1155_COLLECTION_ADDRESS as `0x${string}`,
          tokenId: 2,
          value: 2,
        },
      ],
    },
  ],
  [
    '3',
    {
      id: 3,
      name: 'Craft axe',
      inputs: [
        {
          type: 'ERC1155',
          address: process.env.ERC1155_COLLECTION_ADDRESS as `0x${string}`,
          tokenId: 1,
          value: 10,
        },
        {
          type: 'ERC1155',
          address: process.env.ERC1155_COLLECTION_ADDRESS as `0x${string}`,
          tokenId: 2,
          value: 2,
        },
      ],
      outputs: [
        {
          type: 'ERC1155',
          address: process.env.ERC1155_COLLECTION_ADDRESS as `0x${string}`,
          tokenId: 3,
          value: 1,
        },
      ],
    },
  ],
  [
    '4',
    {
      id: 4,
      name: 'Craft Golden Axe',
      inputs: [
        {
          type: 'ERC20',
          address: process.env.ERC20_ADDRESS as `0x${string}`,
          value: 5,
        },
        {
          type: 'ERC1155',
          address: process.env.ERC1155_COLLECTION_ADDRESS as `0x${string}`,
          tokenId: 3,
          value: 1,
        },
      ],
      outputs: [
        {
          type: 'ERC721',
          address: process.env.ERC721_COLLECTION_ADDRESS as `0x${string}`,
          value: 1,
        },
      ],
    },
  ],
]);

@Injectable()
export class AppService {
  getRecipes(): Recipe[] {
    return Array.from(recipeMap.values());
  }

  async postCraft(
    playerAddress: `0x${string}`,
    recipeId: number,
  ): Promise<CraftResult> {
    const recipe = recipeMap.get(recipeId.toString());
    if (!recipe) {
      throw new Error('Recipe not found');
    }

    const craftId = uuidv4().replace(/-/g, '');
    const reference = ethers.zeroPadBytes(
      ethers.toUtf8Bytes(craftId),
      32,
    ) as `0x${string}`;

    const calls = [];
    recipe.inputs.forEach((input) => {
      switch (input.type) {
        case 'ERC20': {
          calls.push({
            target: input.address, //process.env.COLLECTION_ADDRESS as `0x${string}`,
            functionSignature: 'burnFrom(address,uint256)',
            functionArgs: [
              playerAddress.toString(),
              (BigInt(input.value) * BigInt(10 ** 18)).toString(),
            ],
            data: ethers.AbiCoder.defaultAbiCoder().encode(
              ['address', 'uint256'],
              [
                playerAddress.toString(),
                BigInt(input.value) * BigInt(10 ** 18),
              ],
            ),
          });
          break;
        }
        case 'ERC721': {
          break;
        }
        case 'ERC1155': {
          calls.push({
            target: input.address, //process.env.COLLECTION_ADDRESS as `0x${string}`,
            functionSignature: 'burn(address,uint256,uint256)',
            functionArgs: [
              playerAddress.toString(),
              input.tokenId.toString(),
              input.value.toString(),
            ],
            data: ethers.AbiCoder.defaultAbiCoder().encode(
              ['address', 'uint256', 'uint256'],
              [playerAddress, BigInt(input.tokenId), BigInt(input.value)],
            ),
          });
          break;
        }
      }
    });

    recipe.outputs.forEach((output) => {
      switch (output.type) {
        case 'ERC20': {
          break;
        }
        case 'ERC721': {
          calls.push({
            target: output.address, //process.env.COLLECTION_ADDRESS as `0x${string}`,
            functionSignature: 'safeMintByQuantity(address,uint256)',
            functionArgs: [playerAddress.toString(), output.value.toString()],
            data: ethers.AbiCoder.defaultAbiCoder().encode(
              ['address', 'uint256'],
              [playerAddress, output.value],
            ),
          });

          break;
        }
        case 'ERC1155': {
          calls.push({
            target: output.address, //process.env.COLLECTION_ADDRESS as `0x${string}`,
            functionSignature: 'safeMint(address,uint256,uint256,bytes)',
            functionArgs: [
              playerAddress.toString(),
              output.tokenId.toString(),
              output.value.toString(),
              '',
            ],
            data: ethers.AbiCoder.defaultAbiCoder().encode(
              ['address', 'uint256', 'uint256', 'bytes'],
              [playerAddress, output.tokenId, output.value, '0x'],
            ),
          });

          break;
        }
        default:
      }
    });

    const deadline = Math.round((Date.now() + 1000 * 60 * 10) / 1000);

    const payload = {
      multi_caller: {
        address: process.env.MULTICALLER_ADDRESS as `0x${string}`,
        name: process.env.MULTICALLER_NAME as string,
        version: process.env.MULTICALLER_VERSION as string,
      },
      reference_id: craftId,
      calls: calls.map((call) => ({
        target_address: call.target,
        function_signature: call.functionSignature,
        function_args: call.functionArgs,
      })),
      expires_at: new Date(deadline * 1000).toISOString(),
    };
    const res = await fetch(
      `${process.env.IMMUTABLE_API_URL}/v1/chains/${process.env.CHAIN_NAME}/crafting/sign`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-immutable-api-key': process.env.IMMUTABLE_API_KEY as string,
        },
        body: JSON.stringify(payload),
      },
    );
    const sigData = await res.json();
    console.log(payload);
    console.log(sigData);

    return {
      multicallerAddress: process.env.MULTICALLER_ADDRESS as `0x${string}`,
      multicallSigner: sigData.signer_address,
      reference: reference,
      calls: calls,
      deadline: deadline,
      signature: sigData.signature,
    };
  }
}
