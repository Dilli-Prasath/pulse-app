import { MenuItem } from './types'

/**
 * Built-in (static) office canteen menus, keyed by DAY OF WEEK (0=Sun … 6=Sat).
 * Each weekday can have its own menu. menuForToday() returns the right one.
 *
 * Status: Tuesday and Thursday are the real menus you shared (Thursday
 * breakfast last refreshed 08-Oct-2026). The other
 * weekdays currently fall back to Thursday's menu (marked "default") until you
 * share each day's — just paste them and I'll fill them in precisely. Sat & Sun
 * are limited placeholders.
 */
export interface CanteenDay { office: string; note?: string; items: MenuItem[] }
const OFFICE = 'Zoho · Chennai'

// ---------- Thursday (exact) ----------
const THURSDAY: MenuItem[] = [
  // Breakfast (08.00–10.30 AM) — updated 08-Oct-2026
  { meal: 'breakfast', name: 'Wheat Bread Omelette', calories: 356, qty: '1 No' },
  { meal: 'breakfast', name: 'Dosa', calories: 120, qty: '1 No' },
  { meal: 'breakfast', name: 'Toor Dall Moong Dall Sambar', calories: 62, qty: '100 Gms' },
  { meal: 'breakfast', name: 'Poori', calories: 107, qty: '1 No' },
  { meal: 'breakfast', name: 'Podi Dosa', calories: 140, qty: '1 No' },
  { meal: 'breakfast', name: 'Idli', calories: 60, qty: '1 No' },
  { meal: 'breakfast', name: 'Samai Kanji', calories: 75, qty: '100 Gms' },
  { meal: 'breakfast', name: 'Fermented Rice', calories: 376, qty: '100 Gms' },
  { meal: 'breakfast', name: 'Kaldosa', calories: 78, qty: '1 No' },
  { meal: 'breakfast', name: 'Noi Rice Upma', calories: 78, qty: '100 Gms' },
  { meal: 'breakfast', name: 'Coconut Chutney', calories: 120, qty: '100 Gms' },
  { meal: 'breakfast', name: 'Poori Sagu', calories: 81, qty: '100 Gms' },
  { meal: 'breakfast', name: 'Vada', calories: 309, qty: '1 No' },
  { meal: 'breakfast', name: 'Boiled Egg', calories: 78, qty: '1 No' },
  { meal: 'breakfast', name: 'Banana', calories: 90, qty: '1 No' },
  { meal: 'breakfast', name: 'Onion Chutney', calories: 149, qty: '100 Gms' },
  { meal: 'breakfast', name: 'Omelette', calories: 94, qty: '1 No' },
  { meal: 'breakfast', name: 'Green Chilly Ginger Buttermilk', calories: 80, qty: '200 Gms' },
  // Morning juice + live snacks (4–6 PM)
  { meal: 'snack', name: 'Cucumber Mint Lemonade', calories: 80, qty: '200 Gms' },
  { meal: 'snack', name: 'Black Chana Sundal', calories: 167, qty: '100 Gms' },
  { meal: 'snack', name: 'Veg Cutlet', calories: 132, qty: '1 No' },
  { meal: 'snack', name: 'Sweet Chutney', calories: 149, qty: '100 Gms' },
  { meal: 'snack', name: 'Mint Chutney', calories: 149, qty: '100 Gms' },
  // Zoho Lunch (12.00–03.00 PM)
  { meal: 'lunch', name: 'Keerai Sadam', calories: 148, qty: '100 Gms' },
  { meal: 'lunch', name: 'Channa Kurma', calories: 160, qty: '100 Gms' },
  { meal: 'lunch', name: 'Poori', calories: 107, qty: '1 No' },
  { meal: 'lunch', name: 'Curd Rice', calories: 60, qty: '100 Gms' },
  { meal: 'lunch', name: 'Banana', calories: 90, qty: '1 No' },
  { meal: 'lunch', name: 'Boiled Egg', calories: 78, qty: '1 No' },
  { meal: 'lunch', name: 'Paruppu Thuvaiyal', calories: 97, qty: '100 Gms' },
  { meal: 'lunch', name: 'Green Chilly Ginger Buttermilk', calories: 80, qty: '200 Gms' },
  // Annalakshmi Lunch (12.00–03.00 PM)
  { meal: 'lunch', name: 'Chapathi', calories: 70, qty: '1 No' },
  { meal: 'lunch', name: 'Paneer Butter Masala', calories: 131, qty: '100 Gms' },
  { meal: 'lunch', name: 'Hyderabad Biryani', calories: 141, qty: '100 Gms' },
  { meal: 'lunch', name: 'Onion Raitha', calories: 67, qty: '100 Gms' },
  { meal: 'lunch', name: 'Plain Rice', calories: 113, qty: '100 Gms' },
  { meal: 'lunch', name: 'Drumstick Mango Sambar', calories: 75, qty: '100 Gms' },
  { meal: 'lunch', name: 'Mangalore Rasam', calories: 26, qty: '100 Gms' },
  { meal: 'lunch', name: 'Kovakkai Onion Curry', calories: 64, qty: '100 Gms' },
  { meal: 'lunch', name: 'Cabbage Kootu', calories: 89, qty: '100 Gms' },
  { meal: 'lunch', name: 'Sago Payasam', calories: 202, qty: '100 Gms' },
  { meal: 'lunch', name: 'Appalam', calories: 99, qty: '1 No' },
  // Dinner (07.00–10.30 PM)
  { meal: 'dinner', name: 'White Rice', calories: 113, qty: '100 Gms' },
  { meal: 'dinner', name: 'Idli', calories: 60, qty: '1 No' },
  { meal: 'dinner', name: 'Tomato Rice', calories: 115, qty: '100 Gms' },
  { meal: 'dinner', name: 'Chapathi', calories: 70, qty: '1 No' },
  { meal: 'dinner', name: 'Dosa', calories: 120, qty: '1 No' },
  { meal: 'dinner', name: 'Toor Dall Moong Dall Sambar', calories: 62, qty: '100 Gms' },
  { meal: 'dinner', name: 'Kaldosa', calories: 78, qty: '1 No' },
  { meal: 'dinner', name: 'Curd', calories: 58, qty: '100 Gms' },
  { meal: 'dinner', name: 'Rajma Dal', calories: 127, qty: '100 Gms' },
  { meal: 'dinner', name: 'Boiled Egg', calories: 78, qty: '1 No' },
  { meal: 'dinner', name: 'Onion Chutney', calories: 149, qty: '100 Gms' },
  { meal: 'dinner', name: 'Beetroot Kara Curry', calories: 155, qty: '100 Gms' },
  { meal: 'dinner', name: 'Omelette', calories: 94, qty: '1 No' },
  { meal: 'dinner', name: 'Appalam', calories: 99, qty: '1 No' },
  { meal: 'dinner', name: 'Pepper Jeera Rasam', calories: 26, qty: '100 Gms' },
  { meal: 'dinner', name: 'Coconut Chutney', calories: 120, qty: '100 Gms' },
]

// ---------- Tuesday (exact) ----------
const TUESDAY: MenuItem[] = [
  // Breakfast (08.00–10.30 AM)
  { meal: 'breakfast', name: 'Poori', calories: 107, qty: '1 No' },
  { meal: 'breakfast', name: 'Idli', calories: 60, qty: '1 No' },
  { meal: 'breakfast', name: 'Kambu Koozh', calories: 326, qty: '100 Gms' },
  { meal: 'breakfast', name: 'Dosa', calories: 120, qty: '1 No' },
  { meal: 'breakfast', name: 'Kaldosa', calories: 78, qty: '1 No' },
  { meal: 'breakfast', name: 'Kadappa', calories: 109, qty: '100 Gms' },
  { meal: 'breakfast', name: 'Pongal', calories: 131, qty: '100 Gms' },
  { meal: 'breakfast', name: 'Wheat Bread Omelette', calories: 356, qty: '1 No' },
  { meal: 'breakfast', name: 'Fermented Rice', calories: 376, qty: '100 Gms' },
  { meal: 'breakfast', name: 'Coconut Thuvaiyal', calories: 149, qty: '100 Gms' },
  { meal: 'breakfast', name: 'Vada', calories: 309, qty: '1 No' },
  { meal: 'breakfast', name: 'Coconut Chutney', calories: 120, qty: '100 Gms' },
  { meal: 'breakfast', name: 'Black Orid Chutney', calories: 149, qty: '100 Gms' },
  { meal: 'breakfast', name: 'Muskmelon Fruit', calories: 34, qty: '100 Gms' },
  { meal: 'breakfast', name: 'Boiled Egg', calories: 78, qty: '1 No' },
  { meal: 'breakfast', name: 'Sambar', calories: 60, qty: '100 Gms' },
  { meal: 'breakfast', name: 'Omelette', calories: 94, qty: '1 No' },
  { meal: 'breakfast', name: 'Green Chilly Ginger Buttermilk', calories: 80, qty: '200 Gms' },
  // Morning juice + live snacks (4–6 PM)
  { meal: 'snack', name: 'Ginger Mint Lemonade Juice', calories: 80, qty: '200 Gms' },
  { meal: 'snack', name: 'Sweet Avul Puttu', calories: 183, qty: '100 Gms' },
  { meal: 'snack', name: 'Fried Gram Chutney', calories: 217, qty: '100 Gms' },
  { meal: 'snack', name: 'Keerai Vadai', calories: 131, qty: '1 No' },
  // Zoho Lunch (12.00–03.00 PM)
  { meal: 'lunch', name: 'Peerkangai Thuvaiyal', calories: 92, qty: '100 Gms' },
  { meal: 'lunch', name: 'Seeraga Samba Veg Briyani', calories: 141, qty: '100 Gms' },
  { meal: 'lunch', name: 'Curd Rice', calories: 60, qty: '100 Gms' },
  { meal: 'lunch', name: 'Semiya Rava Kitchdi', calories: 175, qty: '100 Gms' },
  { meal: 'lunch', name: 'Boiled Egg', calories: 78, qty: '1 No' },
  { meal: 'lunch', name: 'Cucumber Raita', calories: 40, qty: '100 Gms' },
  { meal: 'lunch', name: 'Groundnut Chutney', calories: 318, qty: '100 Gms' },
  { meal: 'lunch', name: 'Appalam', calories: 99, qty: '1 No' },
  { meal: 'lunch', name: 'Green Chilly Ginger Buttermilk', calories: 80, qty: '200 Gms' },
  { meal: 'lunch', name: 'Guava', calories: 66, qty: '1 No' },
  // Dinner (07.00–10.30 PM)
  { meal: 'dinner', name: 'Garlic Rice', calories: 153, qty: '100 Gms' },
  { meal: 'dinner', name: 'Kothavarangai Poriyal', calories: 66, qty: '100 Gms' },
  { meal: 'dinner', name: 'Poori', calories: 107, qty: '1 No' },
  { meal: 'dinner', name: 'Kaldosa', calories: 78, qty: '1 No' },
  { meal: 'dinner', name: 'White Rice', calories: 113, qty: '100 Gms' },
  { meal: 'dinner', name: 'Idli', calories: 60, qty: '1 No' },
  { meal: 'dinner', name: 'Dosa', calories: 120, qty: '1 No' },
  { meal: 'dinner', name: 'Chapathi', calories: 70, qty: '1 No' },
  { meal: 'dinner', name: 'Boiled Egg', calories: 78, qty: '1 No' },
  { meal: 'dinner', name: 'Karamani Dal Fry', calories: 104, qty: '100 Gms' },
  { meal: 'dinner', name: 'Coconut Chutney', calories: 120, qty: '100 Gms' },
  { meal: 'dinner', name: 'Poori Sagu', calories: 81, qty: '100 Gms' },
  { meal: 'dinner', name: 'Omelette', calories: 94, qty: '1 No' },
  { meal: 'dinner', name: 'Black Orid Chutney', calories: 149, qty: '100 Gms' },
  { meal: 'dinner', name: 'Pepper Rasam', calories: 26, qty: '100 Gms' },
  { meal: 'dinner', name: 'Curd', calories: 58, qty: '100 Gms' },
  { meal: 'dinner', name: 'Sambar', calories: 60, qty: '100 Gms' },
  { meal: 'dinner', name: 'Appalam', calories: 99, qty: '1 No' },
]

// ---------- Saturday / Sunday (limited — placeholders, share real menus to refine) ----------
const SATURDAY: MenuItem[] = [
  { meal: 'snack', name: 'Sukku Tea', calories: 35, qty: '200 Gms' },
  { meal: 'breakfast', name: 'Idli', calories: 60, qty: '1 No' },
  { meal: 'breakfast', name: 'Dosa', calories: 120, qty: '1 No' },
  { meal: 'breakfast', name: 'Sambar', calories: 60, qty: '100 Gms' },
  { meal: 'breakfast', name: 'Coconut Chutney', calories: 120, qty: '100 Gms' },
  { meal: 'lunch', name: 'Curd Rice', calories: 60, qty: '100 Gms' },
  { meal: 'lunch', name: 'White Rice', calories: 113, qty: '100 Gms' },
  { meal: 'dinner', name: 'Chapathi', calories: 70, qty: '1 No' },
  { meal: 'dinner', name: 'Curd', calories: 58, qty: '100 Gms' },
]
const SUNDAY: MenuItem[] = [
  { meal: 'snack', name: 'Masala Milk', calories: 75, qty: '200 Gms' },
  { meal: 'breakfast', name: 'Poori', calories: 141, qty: '1 No' },
  { meal: 'breakfast', name: 'Aloo Masala', calories: 86, qty: '100 Gms' },
  { meal: 'lunch', name: 'Curd Rice', calories: 60, qty: '100 Gms' },
  { meal: 'lunch', name: 'White Rice', calories: 113, qty: '100 Gms' },
  { meal: 'dinner', name: 'Chapathi', calories: 70, qty: '1 No' },
  { meal: 'dinner', name: 'Curd', calories: 58, qty: '100 Gms' },
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
