export interface ConfigProps {
  multicallerAddress: string;
  multicallerName: string;
  multicallerVersion: string;
  immutableApiKey: string;
  erc20Address: string;
  erc1155Address: string;
  erc721Address: string;
  immutableApiUrl: string;
  chainName: string;
}

export const config = (): ConfigProps => ({
  multicallerAddress: process.env.MULTICALLER_ADDRESS,
  multicallerName: process.env.MULTICALLER_NAME,
  multicallerVersion: process.env.MULTICALLER_VERSION,
  immutableApiKey: process.env.IMMUTABLE_API_KEY,
  erc20Address: process.env.ERC20_ADDRESS,
  erc1155Address: process.env.ERC1155_COLLECTION_ADDRESS,
  erc721Address: process.env.ERC721_COLLECTION_ADDRESS,
  immutableApiUrl: process.env.IMMUTABLE_API_URL,
  chainName: process.env.CHAIN_NAME,
});
