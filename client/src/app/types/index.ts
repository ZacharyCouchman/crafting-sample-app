export type Recipe = {
  id: number;
  name: string;
  inputs: Token[];
  outputs: Token[];
}

export type Token = {
  type: 'ERC20' | 'ERC721' | 'ERC1155'
  tokenId: string;
  value: string;
  image: string;
  name: string;
}

export const nftToName = (nft: Token): string => {
  switch (nft.tokenId?.toString()) {
    case '1':
      return 'Wood';
    case '2':
      return 'Stone';
    case '3':
      return 'Axe';
    default:
      return nft?.name ?? 'Gold';
  }
}

export type Call = {
  target: `0x${string}`;
  functionSignature: string;
  data: `0x${string}`;
}

export type CraftResult = {
  multicallerAddress: `0x${string}`;
  multicallSigner: `0x${string}`;
  reference: `0x${string}`;
  calls: Call[];
  deadline: number;
  signature: `0x${string}`;
}

export type Address = `0x${string}`

export type Collection = {
  address: Address;
}

export type Message = {
  status: 'success' | 'fatal';
  message: string;
  link?: string;
}
