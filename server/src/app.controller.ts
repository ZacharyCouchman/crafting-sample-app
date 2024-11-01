import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { AppService } from './app.service';
import { Collection, CraftResult, Recipe } from './types';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) { }

  @Get('/collection')
  getCollection(): Collection[] {
    return [
      {
        type: 'ERC1155',
        address: process.env.ERC20_ADDRESS as `0x${string}`,
      },
      {
        type: 'ERC1155',
        address: process.env.ERC1155_COLLECTION_ADDRESS as `0x${string}`,
      },
      {
        type: 'ERC721',
        address: process.env.ERC721_COLLECTION_ADDRESS as `0x${string}`,
      },
    ];
  }

  @Get('/recipes')
  getRecipes(): Recipe[] {
    return this.appService.getRecipes();
  }

  @Post('/craft/:recipe_id')
  async postCraft(
    @Param('recipe_id') recipeId: number,
    @Body('player_address') playerAddress: `0x${string}`,
    @Body('inputs') inputs: number[],
  ): Promise<CraftResult> {
    return await this.appService.postCraft(playerAddress, recipeId);
  }
}
