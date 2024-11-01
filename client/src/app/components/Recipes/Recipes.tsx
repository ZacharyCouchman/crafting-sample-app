import { useRecipesQuery } from "@/app/hooks";
import { Box, Heading, Stack } from "@biom3/react";
import RecipeBox from "./RecipeBox";
import { Collection } from "@/app/types";

export default function Recipes({collections}: {collections: Collection[]}) {
  const { data, error, isLoading } = useRecipesQuery();

  if (isLoading) {
    return <Heading size='xSmall'>Loading...</Heading>;
  } else if (error) {
    return <Heading size='xSmall'>Error: {error.message}</Heading>;
  }
  return (
    <Box sx={{
      display: 'flex',
      flexDirection: 'column',
      gap: 'base.spacing.x4',
    }}>
      <Heading>Recipes</Heading>
      <Stack gap='base.spacing.x4'>
        {data?.map((recipe) => (
          <RecipeBox key={recipe.id} recipe={recipe} collections={collections} />
        ))}
      </Stack>
    </Box>
  );
};