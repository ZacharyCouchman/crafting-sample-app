export type Token = {
  tokenId: number;
  value: number;
}

export type Recipe = {
  id: number;
  name: string;
  inputs: Token[];
  outputs: Token[]; 
};

export type Call = {
  target: `0x${string}`;
  functionSignature: string;
  data: `0x${string}`;
};

export type CraftResult = {
  multicallerAddress: `0x${string}`;
  multicallSigner: `0x${string}`;
  reference: `0x${string}`;
  calls: Call[];
  deadline: number;
  signature: `0x${string}`;
};

export type Collection = {
  address: `0x${string}`;
}
