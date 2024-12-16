# Crafting Sample App

This app provides a client and a server that simulate a simple crafting system. It demonstrates how to use Immutable Signing API to generate signatures for crafting recipes.

The client uses Next.js and React to provide a simple UI for the user to interact with the server. The server uses NestJS to provide simple APIs for the client to interact with. The server generates signatures by calling Immutable Signing API.

## Recipes

Crafting recipes refer to a description of the expected inputs and outputs of a particular crafting transaction. In this guide, we will be demonstrating a common gameplay mechanic where a player will exchange consumable base ingredients, i.e. `wood` and `stone`, for a weapon which can then be used as an in-game item (an `axe`). The resulting axe can then be upgraded by crafting with some `crafting gold` to enchance the axe to a more rare item.

We will model this example using the preset `ImmutableERC1155` (with extension to upgrade by burning some `ERC20` and minting the resulting `ERC721` Golden Axe). `ERC1155` contracts allows for semi-fungible tokens that make it ideal for in-game item representations such as consumables, since different amounts of the same token ID can be minted to different players.

Our example crafting recipe can be defined in non-technical terms as:

Player spends `10 wood` and `2 stone` and receives `1 axe`

Our `ERC1155` contract will be modelled as such:

- token ID of `1` represents wood
- token ID of `2` represents metal
- token ID of `3` represents axe

This translates to an atomic crafting transaction in which the following should occur:

- Player burns 10 of token ID `1` on `ERC1155` contract
- Player burns 2 of token ID `2` on `ERC1155` contract
- Game mints 1 of token ID `3` on `ERC1155` contract to Player

Afterwards the player can spend `5 gold` and `1 axe` to receive `1 golden axe`
- Player burns token ID `3` of the `ERC1155` contract
- Player burns `5` tokens of the `ERC20` contract
- Game mints 1 `ERC721` token to the Player

## Getting Started

To get started, you will need to have Node.js installed on your machine. You can download it from [here](https://nodejs.org/).

Your node version should be at least `20.0.0`.

Once you have Node.js installed, you can clone this repository.

```bash
git clone https://github.com/immutable/crafting-sample-app.git
```

### Running the Server

To run the server, navigate to the `server` directory and run the following command to configure the server:

```bash
cd server
cp .env.example .env
```

Fill the necessary environment variables in the `.env`.

```bash
# To be filled by the developer
MULTICALLER_ADDRESS=0xMULTICALLER_ADDRESS
MULTICALLER_NAME=MULTICALLER_NAME
MULTICALLER_VERSION=MULTICALLER_VERSION
COLLECTION_ADDRESS=0xCOLLECTION_ADDRESS
IMMUTABLE_API_KEY=IMMUTABLE_API_KEY
```

| Environment variable  | Description                                                                                       |
| --------------------- | ------------------------------------------------------------------------------------------------- |
| `MULTICALLER_ADDRESS` | The address of the Multicaller contract to perform the crafting transcation.                      |
| `MULTICALLER_NAME`    | The name of the Multicaller contract to perform the crafting transcation.                         |
| `MULTICALLER_VERSION` | The version of the Multicaller contract to perform the crafting transcation.                      |
| `COLLECTION_ADDRESS`  | The address of the deployed token contract used in crafting recipe.                               |
| `IMMUTABLE_API_KEY`   | The organisation API key required for request authentication. Can be exported from Immutable Hub. |

Then, run the following command to start the server:

```bash
yarn install # install dependencies
yarn start # start the server
```

The server will start on `http://localhost:3000`.

### Running the Client

In a separate terminal, navigate to the `client` directory and run the following command to configure the client:

```bash
cp .env.example .env
```

Then, run the following command to start the client:

```bash
yarn install # install dependencies
yarn dev --port 3001 # start the client
```

The client will start on `http://localhost:3001`.

## Testing

Open your browser and navigate to `http://localhost:3001` to see the client in action. You can interact with the client to craft items and see the server generate signatures.

1. Login with Passport
2. Click on the `Execute` on `Craft wood` recipe to receive 10 wood
3. Click on the `Execute` on `Craft stone` recipe to receive 2 stone
4. Click on the `Execute` on `Craft axe` recipe to craft 1 axe using 10 wood and 2 stone
