import { MenuItem } from './types'

/**
 * Built-in (static) office canteen menus, keyed by DAY OF WEEK (0=Sun … 6=Sat).
 * Each weekday can have its own menu. menuForToday() returns the right one.
 *
 * Status: Tuesday and Thursday are the real menus you shared. The other
 * weekdays currently fall back to Thursday's menu (marked "default") until you
 * share each day's — just paste them and I'll fill them in precisely. Sat & Sun
 * are limited placeholders.
 */
export interface CanteenDay { office: string; note?: string; items: MenuItem[] }
const OFFICE = 'Zoho · Chennai'

// ---------- Thursday (exact) ----------
const THURSDAY: MenuItem[] = [
  // Breakfast (08.00–10.30 AM)
  { meal: 'breakfast', name: 'Poori', calories: 107 },
  { meal: 'breakfast', name: 'Pongal', calories: 131 },
  { meal: 'breakfast', name: 'Wheat Bread Omelette', calories: 356 },
  { meal: 'breakfast', name: 'Toor Dall Moong Dall Sambar', calories: 62 },
  { meal: 'breakfast', name: 'Idli', calories: 60 },
  { meal: 'breakfast', name: 'Koozh', calories: 328 },
  { meal: 'breakfast', name: 'Dosa', calories: 120 },
  { meal: 'breakfast', name: 'Fermented Rice', calories: 376 },
  { meal: 'breakfast', name: 'Kaldosa', calories: 78 },
  { meal: 'breakfast', name: 'Vada', calories: 309 },
  { meal: 'breakfast', name: 'Coconut Thuvaiyal', calories: 149 },
  { meal: 'breakfast', name: 'Boiled Egg', calories: 78 },
  { meal: 'breakfast', name: 'Omelette', calories: 94 },
  { meal: 'breakfast', name: 'Green Chilly Ginger Buttermilk', calories: 80 },
  { meal: 'breakfast', name: 'Potato Masala', calories: 99 },
  { meal: 'breakfast', name: 'Papaya', calories: 39 },
  { meal: 'breakfast', name: 'Onion Chutney', calories: 149 },
  { meal: 'breakfast', name: 'Coconut Chutney', calories: 120 },
  // Morning juice + live snacks (4–6 PM)
  { meal: 'snack', name: 'Cucumber Mint Lemonade', calories: 80 },
  { meal: 'snack', name: 'Black Chana Sundal', calories: 167 },
  { meal: 'snack', name: 'Veg Cutlet', calories: 132 },
  { meal: 'snack', name: 'Sweet Chutney', calories: 149 },
  { meal: 'snack', name: 'Mint Chutney', calories: 149 },
  // Zoho Lunch (12.00–03.00 PM)
  { meal: 'lunch', name: 'Keerai Sadam', calories: 148 },
  { meal: 'lunch', name: 'Channa Kurma', calories: 160 },
  { meal: 'lunch', name: 'Poori', calories: 107 },
  { meal: 'lunch', name: 'Curd Rice', calories: 60 },
  { meal: 'lunch', name: 'Banana', calories: 90 },
  { meal: 'lunch', name: 'Boiled Egg', calories: 78 },
  { meal: 'lunch', name: 'Paruppu Thuvaiyal', calories: 97 },
  { meal: 'lunch', name: 'Green Chilly Ginger Buttermilk', calories: 80 },
  // Annalakshmi Lunch (12.00–03.00 PM)
  { meal: 'lunch', name: 'Chapathi', calories: 70 },
  { meal: 'lunch', name: 'Paneer Butter Masala', calories: 131 },
  { meal: 'lunch', name: 'Hyderabad Biryani', calories: 141 },
  { meal: 'lunch', name: 'Onion Raitha', calories: 67 },
  { meal: 'lunch', name: 'Plain Rice', calories: 113 },
  { meal: 'lunch', name: 'Drumstick Mango Sambar', calories: 75 },
  { meal: 'lunch', name: 'Mangalore Rasam', calories: 26 },
  { meal: 'lunch', name: 'Kovakkai Onion Curry', calories: 64 },
  { meal: 'lunch', name: 'Cabbage Kootu', calories: 89 },
  { meal: 'lunch', name: 'Sago Payasam', calories: 202 },
  { meal: 'lunch', name: 'Appalam', calories: 99 },
  // Dinner (07.00–10.30 PM)
  { meal: 'dinner', name: 'White Rice', calories: 113 },
  { meal: 'dinner', name: 'Idli', calories: 60 },
  { meal: 'dinner', name: 'Tomato Rice', calories: 115 },
  { meal: 'dinner', name: 'Chapathi', calories: 70 },
  { meal: 'dinner', name: 'Dosa', calories: 120 },
  { meal: 'dinner', name: 'Toor Dall Moong Dall Sambar', calories: 62 },
  { meal: 'dinner', name: 'Kaldosa', calories: 78 },
  { meal: 'dinner', name: 'Curd', calories: 58 },
  { meal: 'dinner', name: 'Rajma Dal', calories: 127 },
  { meal: 'dinner', name: 'Boiled Egg', calories: 78 },
  { meal: 'dinner', name: 'Onion Chutney', calories: 149 },
  { meal: 'dinner', name: 'Beetroot Kara Curry', calories: 155 },
  { meal: 'dinner', name: 'Omelette', calories: 94 },
  { meal: 'dinner', name: 'Appalam', calories: 99 },
  { meal: 'dinner', name: 'Pepper Jeera Rasam', calories: 26 },
  { meal: 'dinner', name: 'Coconut Chutney', calories: 120 },
]

// ---------- Tuesday (exact) ----------
const TUESDAY: MenuItem[] = [
  // Breakfast (08.00–10.30 AM)
  { meal: 'breakfast', name: 'Poori', calories: 107 },
  { meal: 'breakfast', name: 'Idli', calories: 60 },
  { meal: 'breakfast', name: 'Kambu Koozh', calories: 326 },
  { meal: 'breakfast', name: 'Dosa', calories: 120 },
  { meal: 'breakfast', name: 'Kaldosa', calories: 78 },
  { meal: 'breakfast', name: 'Kadappa', calories: 109 },
  { meal: 'breakfast', name: 'Pongal', calories: 131 },
  { meal: 'breakfast', name: 'Wheat Bread Omelette', calories: 356 },
  { meal: 'breakfast', name: 'Fermented Rice', calories: 376 },
  { meal: 'breakfast', name: 'Coconut Thuvaiyal', calories: 149 },
  { meal: 'breakfast', name: 'Vada', calories: 309 },
  { meal: 'breakfast', name: 'Coconut Chutney', calories: 120 },
  { meal: 'breakfast', name: 'Black Orid Chutney', calories: 149 },
  { meal: 'breakfast', name: 'Muskmelon Fruit', calories: 34 },
  { meal: 'breakfast', name: 'Boiled Egg', calories: 78 },
  { meal: 'breakfast', name: 'Sambar', calories: 60 },
  { meal: 'breakfast', name: 'Omelette', calories: 94 },
  { meal: 'breakfast', name: 'Green Chilly Ginger Buttermilk', calories: 80 },
  // Morning juice + live snacks (4–6 PM)
  { meal: 'snack', name: 'Ginger Mint Lemonade Juice', calories: 80 },
  { meal: 'snack', name: 'Sweet Avul Puttu', calories: 183 },
  { meal: 'snack', name: 'Fried Gram Chutney', calories: 217 },
  { meal: 'snack', name: 'Keerai Vadai', calories: 131 },
  // Zoho Lunch (12.00–03.00 PM)
  { meal: 'lunch', name: 'Peerkangai Thuvaiyal', calories: 92 },
  { meal: 'lunch', name: 'Seeraga Samba Veg Briyani', calories: 141 },
  { meal: 'lunch', name: 'Curd Rice', calories: 60 },
  { meal: 'lunch', name: 'Semiya Rava Kitchdi', calories: 175 },
  { meal: 'lunch', name: 'Boiled Egg', calories: 78 },
  { meal: 'lunch', name: 'Cucumber Raita', calories: 40 },
  { meal: 'lunch', name: 'Groundnut Chutney', calories: 318 },
  { meal: 'lunch', name: 'Appalam', calories: 99 },
  { meal: 'lunch', name: 'Green Chilly Ginger Buttermilk', calories: 80 },
  { meal: 'lunch', name: 'Guava', calories: 66 },
  // Dinner (07.00–10.30 PM)
  { meal: 'dinner', name: 'Garlic Rice', calories: 153 },
  { meal: 'dinner', name: 'Kothavarangai Poriyal', calories: 66 },
  { meal: 'dinner', name: 'Poori', calories: 107 },
  { meal: 'dinner', name: 'Kaldosa', calories: 78 },
  { meal: 'dinner', name: 'White Rice', calories: 113 },
  { meal: 'dinner', name: 'Idli', calories: 60 },
  { meal: 'dinner', name: 'Dosa', calories: 120 },
  { meal: 'dinner', name: 'Chapathi', calories: 70 },
  { meal: 'dinner', name: 'Boiled Egg', calories: 78 },
  { meal: 'dinner', name: 'Karamani Dal Fry', calories: 104 },
  { meal: 'dinner', name: 'Coconut Chutney', calories: 120 },
  { meal: 'dinner', name: 'Poori Sagu', calories: 81 },
  { meal: 'dinner', name: 'Omelette', calories: 94 },
  { meal: 'dinner', name: 'Black Orid Chutney', calories: 149 },
  { meal: 'dinner', name: 'Pepper Rasam', calories: 26 },
  { meal: 'dinner', name: 'Curd', calories: 58 },
  { meal: 'dinner', name: 'Sambar', calories: 60 },
  { meal: 'dinner', name: 'Appalam', calories: 99 },
]

// ---------- Saturday / Sunday (limited — placeholders, share real menus to refine) ----------
const SATURDAY: MenuItem[] = [
  { meal: 'snack', name: 'Sukku Tea', calories: 35 },
  { meal: 'breakfast', name: 'Idli', calories: 60 },
  { meal: 'breakfast', name: 'Dosa', calories: 120 },
  { meal: 'breakfast', name: 'Sambar', calories: 60 },
  { meal: 'breakfast', name: 'Coconut Chutney', calories: 120 },
  { meal: 'lunch', name: 'Curd Rice', calories: 60 },
  { meal: 'lunch', name: 'White Rice', calories: 113 },
  { meal: 'dinner', name: 'Chapathi', calories: 70 },
  { meal: 'dinner', name: 'Curd', calories: 58 },
]
const SUNDAY: MenuItem[] = [
  { meal: 'snack', name: 'Masala Milk', calories: 75 },
  { meal: 'breakfast', name: 'Poori', calories: 141 },
  { meal: 'breakfast', name: 'Aloo Masala', calories: 86 },
  { meal: 'lunch', name: 'Curd Rice', calories: 60 },
  { meal: 'lunch', name: 'White Rice', calories: 113 },
  { meal: 'dinner', name: 'Chapathi', calories: 70 },
  { meal: 'dinner', name: 'Curd', calories: 58 },
]

// 0=Sun … 6=Sat. Weekdays without their own menu yet fall back to Thursday's.
const BY_DAY: Record<number, { items: MenuItem[]; note?: string }> = {
  0: { items: SUNDAY, note: 'Sunday · limited menu' },
  1: { items: THURSDAY, note: 'default — share Monday menu to set exactly' },
  2: { items: TUESDAY }, // Tuesday — exact
  3: { items: THURSDAY, note: 'default — share Wednesday menu to set exactly' },
  4: { items: THURSDAY }, // Thursday — exact
  5: { items: THURSDAY, note: 'default — share Friday menu to set exactly' },
  6: { items: SATURDAY, note: 'Saturday · limited menu' },
}

/** Canteen menu for today's weekday. */
export function menuForToday(d: Date = new Date()): CanteenDay {
  const e = BY_DAY[d.getDay()]
  return { office: OFFICE, note: e.note, items: e.items }
}
