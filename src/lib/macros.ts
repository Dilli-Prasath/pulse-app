/**
 * Estimate protein/carbs/fat (grams) for a food when only its calories are
 * known (e.g. an office canteen menu). We classify the item by keywords into a
 * macro split (% of calories from P/C/F), then convert to grams using
 * 4 kcal/g protein & carbs, 9 kcal/g fat. Estimates, not lab values.
 */
export interface Macros { protein: number; carbs: number; fat: number }

interface Split { p: number; c: number; f: number } // fractions, sum ~1

const RULES: { re: RegExp; split: Split }[] = [
  // lean protein
  { re: /chicken|fish|prawn|mutton|egg white|grilled/i, split: { p: 0.45, c: 0.1, f: 0.45 } },
  { re: /egg|omelette|omlet|boiled egg/i, split: { p: 0.28, c: 0.05, f: 0.67 } },
  // dairy
  { re: /paneer/i, split: { p: 0.26, c: 0.06, f: 0.68 } },
  { re: /curd|yogurt|buttermilk|milk|lassi/i, split: { p: 0.28, c: 0.34, f: 0.38 } },
  // legumes / dals
  { re: /dal|dall|sambar|sambhar|rajma|chana|gram|peas|moong|toor|lentil|kootu/i, split: { p: 0.26, c: 0.54, f: 0.20 } },
  // fat-heavy chutneys / nuts / fried
  { re: /chutney|thuvaiyal|thogayal|coconut|vada|bonda|bajji|pakoda|fry|fried|ghee|suzhiyam/i, split: { p: 0.08, c: 0.32, f: 0.60 } },
  // grains / breads / rice / tiffin
  { re: /idli|dosa|rice|upma|poori|puri|chapathi|chapati|roti|naan|bread|appalam|papad|pongal|koozh|kaldosa|uttapam|paratha|poha|biryani|noodle|pasta|fermented rice/i, split: { p: 0.11, c: 0.74, f: 0.15 } },
  // veg sides
  { re: /poriyal|sabzi|sabji|kootu|cabbage|cauliflower|beans|carrot|potato|masala|aloo|bhaji|veg/i, split: { p: 0.12, c: 0.58, f: 0.30 } },
  // drinks / fruit / juice
  { re: /tea|coffee|juice|jaljeera|jeera|water|fruit|guava|melon|banana|apple|orange|grape|musk/i, split: { p: 0.06, c: 0.88, f: 0.06 } },
]
const DEFAULT: Split = { p: 0.15, c: 0.55, f: 0.30 }

export function estimateMacros(name: string, calories: number): Macros {
  const s = RULES.find((r) => r.re.test(name))?.split || DEFAULT
  return {
    protein: Math.max(0, Math.round((calories * s.p) / 4)),
    carbs: Math.max(0, Math.round((calories * s.c) / 4)),
    fat: Math.max(0, Math.round((calories * s.f) / 9)),
  }
}
