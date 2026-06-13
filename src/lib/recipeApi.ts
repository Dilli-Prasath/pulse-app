/**
 * Recipes from TheMealDB — a free, open, no-key recipe API with photos.
 * CORS-enabled, so it works directly from the browser. Reliable replacement
 * for the premium-gated API Ninjas recipe endpoint.
 */
export interface Recipe {
  id: string
  title: string
  image?: string
  category?: string
  area?: string
  ingredients: string[]
  instructions: string
  youtube?: string
}

/* eslint-disable @typescript-eslint/no-explicit-any */
function toRecipe(m: any): Recipe {
  const ingredients: string[] = []
  for (let i = 1; i <= 20; i++) {
    const ing = m[`strIngredient${i}`]
    const measure = m[`strMeasure${i}`]
    if (ing && ing.trim()) ingredients.push(`${measure?.trim() ? measure.trim() + ' ' : ''}${ing.trim()}`)
  }
  return {
    id: m.idMeal,
    title: m.strMeal,
    image: m.strMealThumb,
    category: m.strCategory,
    area: m.strArea,
    ingredients,
    instructions: m.strInstructions || '',
    youtube: m.strYoutube || undefined,
  }
}

export async function searchRecipes(query: string): Promise<Recipe[]> {
  const q = query.trim()
  if (!q) return []
  try {
    const res = await fetch(`https://www.themealdb.com/api/json/v1/1/search.php?s=${encodeURIComponent(q)}`)
    if (!res.ok) return []
    const json = await res.json()
    return (json.meals || []).map(toRecipe)
  } catch {
    return []
  }
}
