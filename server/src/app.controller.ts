import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { AppService } from './app.service';
import { Collection, CraftResult, Recipe } from './types';
import { ConfigService } from '@nestjs/config';
import { ConfigProps } from './config';

@Controller()
export class AppController {
  constructor(
    private readonly appService: AppService,
    private readonly config: ConfigService<ConfigProps>,
  ) { }

  @Get('/collection')
  getCollection(): Collection[] {
    return [
      {
        type: 'ERC20',
        address: this.config.get<string>('erc20Address') as `0x${string}`,
      },
      {
        type: 'ERC1155',
        address: this.config.get<string>('erc1155Address') as `0x${string}`,
      },
      {
        type: 'ERC721',
        address: this.config.get<string>('erc721Address') as `0x${string}`,
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
