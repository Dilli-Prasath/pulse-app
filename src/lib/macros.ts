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

/**
 * Beyond P/C/F, real "is this healthy?" judgement needs the nutrients that
 * Indian food varies on most: fibre (whole grains / dals / veg), free sugar
 * (sweets, juices, payasam), sodium (pickle, papad, fried snacks, gravies) and
 * saturated fat (ghee, coconut, fried, paneer). We estimate them per food using
 * Indian-cuisine-aware heuristics so the health engine can grade any dish even
 * when a menu only lists calories. Grams for fibre/sugar/satFat; mg for sodium.
 */
export interface Micros { fiber: number; sugar: number; sodium: number; satFat: number }

export function estimateMicros(name: string, calories: number, macros?: Macros): Micros {
  const n = name.toLowerCase()
  const m = macros || estimateMacros(name, calories)

  // ---- Fibre: grams per 100 kcal by food group, then scaled by calories ----
  let fiberPer100 = 1.0
  if (/sprout|salad|keerai|spinach|palak|methi|greens/.test(n)) fiberPer100 = 4.5
  else if (/dal\b|dall|sambar|sambhar|rajma|chana|chole|gram|moong|toor|masoor|lentil|kootu|peas|legume|usili|paruppu/.test(n)) fiberPer100 = 3.4
  else if (/poriyal|sabzi|sabji|cabbage|cauliflower|beans|carrot|beetroot|gourd|brinjal|okra|bhindi|avial|aviyal|vegetable|\bveg\b|capsicum|peas/.test(n)) fiberPer100 = 3.6
  else if (/ragi|kambu|bajra|jowar|millet|samai|thinai|varagu|oats|dalia|brown rice|whole wheat|wheat|koozh|multigrain/.test(n)) fiberPer100 = 2.6
  else if (/banana|guava|apple|orange|fruit|grape|melon|papaya|berry|pomegranate|sapota|pear/.test(n)) fiberPer100 = 1.8
  else if (/chapathi|chapati|roti|phulka|adai|pesarattu|uttapam/.test(n)) fiberPer100 = 1.6
  else if (/idli|dosa|rice|pongal|upma|poha|poori|puri|naan|parotta|paratha|bread|maida|noodle|pasta|sugar|sweet|halwa|jamun|jalebi|payasam|kheer|laddu|mysore/.test(n)) fiberPer100 = 0.4
  const fiber = Math.max(0, Math.round((calories * fiberPer100) / 100))

  // ---- Sugar: as a fraction of the carbohydrate grams ----
  let sugarFrac = 0.08
  if (/halwa|jamun|jalebi|jangiri|payasam|kheer|laddu|ladoo|mysore pak|boondi|kesari|sweet|dessert|cake|pastry|ice cream|chocolate|barfi|burfi|peda|gulab|rasmalai|rasgulla|sugar|honey|jaggery/.test(n)) sugarFrac = 0.55
  else if (/juice|soda|cola|sherbet|sharbat|sweet lassi|milkshake|shake|frooti|maaza|thumbs|energy drink/.test(n)) sugarFrac = 0.65
  else if (/banana|guava|apple|orange|fruit|grape|melon|papaya|berry|pomegranate|sapota|mango|pear|dates/.test(n)) sugarFrac = 0.5
  else if (/tea|coffee|milk|lassi|buttermilk|curd|yogurt/.test(n)) sugarFrac = 0.3
  const sugar = Math.max(0, Math.round(m.carbs * sugarFrac))

  // ---- Sodium (mg): base by category ----
  let sodium = 220
  if (/pickle|achar|papad|appalam|fryums|vathal|vadagam|namkeen|chips|kara|mixture|podi/.test(n)) sodium = 900
  else if (/noodle|pasta|sauce|instant|maggi|soup|cup|processed|sausage|salami|ham|nugget/.test(n)) sodium = 750
  else if (/vada|vadai|bonda|bajji|pakoda|samosa|cutlet|kachori|fried|fry\b|chips|65\b/.test(n)) sodium = 480
  else if (/biryani|biriyani|pulao|kuzhambu|gravy|masala|curry|kurma|korma|gobi|manchurian|chettinad|65/.test(n)) sodium = 520
  else if (/sambar|rasam|dal|kootu|poriyal|sabzi|sabji|paneer|chicken|fish|mutton|egg|roti|chapathi|naan|parotta/.test(n)) sodium = 350
  else if (/fruit|banana|guava|apple|orange|grape|melon|salad|sprout|milk|curd|tea|coffee|water|juice|idli|dosa|rice|pongal|upma|poha/.test(n)) sodium = 120

  // ---- Saturated fat: a fraction of total fat ----
  let satFrac = 0.32
  if (/coconut|ghee|butter|vanaspati|dalda|cream|fried|fry\b|vada|bonda|bajji|pakoda|samosa|poori|puri|deep/.test(n)) satFrac = 0.5
  else if (/paneer|cheese|whole milk|khoya|mawa|halwa|jamun|payasam|kheer|laddu|mysore|sweet|barfi/.test(n)) satFrac = 0.48
  else if (/egg|chicken|fish|mutton|prawn|meat/.test(n)) satFrac = 0.3
  else if (/oil|sunflower|groundnut|gingelly|sesame|olive/.test(n)) satFrac = 0.18
  const satFat = Math.max(0, Math.round(m.fat * satFrac))

  return { fiber, sugar, sodium, satFat }
}
