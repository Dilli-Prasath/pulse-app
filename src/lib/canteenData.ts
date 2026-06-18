import { MenuItem } from './types'

/**
 * Built-in (static) office canteen menus, keyed by DAY OF WEEK (0=Sun … 6=Sat).
 * Each weekday can have its own menu. menuForToday() returns the right one.
 *
 * Status: Thursday is the real menu you shared. The other weekdays currently
 * fall back to Thursday's menu (marked "default") until you share each day's —
 * just paste them and I'll fill THURSDAY/MONDAY/etc. precisely. Sat & Sun are
 * limited placeholders.
 */
export interface CanteenDay { office: string; note?: string; items: MenuItem[] }
const OFFICE = 'Zoho · Chennai'

// ---------- Thursday (exact) ----------
const THURSDAY: MenuItem[] = [
  // Beverages & juice
  { meal: 'snack', name: 'Sukku Tea', calories: 35 },
  { meal: 'snack', name: 'Masala Milk', calories: 75 },
  { meal: 'snack', name: 'Jaljeera', calories: 84 },
  // Live snacks (4–6 PM)
  { meal: 'snack', name: 'Suzhiyam', calories: 120 },
  { meal: 'snack', name: 'White Peas Masala', calories: 77 },
  // Zoho Lunch
  { meal: 'lunch', name: 'Curd Rice', calories: 60 },
  { meal: 'lunch', name: 'Schezhwan Fried Rice', calories: 201 },
  { meal: 'lunch', name: 'Pongal', calories: 131 },
  { meal: 'lunch', name: 'Boiled Egg', calories: 78 },
  { meal: 'lunch', name: 'Green Chilly Ginger Buttermilk', calories: 80 },
  { meal: 'lunch', name: 'Appalam', calories: 99 },
  { meal: 'lunch', name: 'Guava', calories: 66 },
  { meal: 'lunch', name: 'Gramdal Chutney', calories: 149 },
  { meal: 'lunch', name: 'Small Onion Thuvaiyal', calories: 114 },
  // Annalakshmi Lunch
  { meal: 'lunch', name: 'Poori', calories: 141 },
  { meal: 'lunch', name: 'Aloo Masala', calories: 86 },
  { meal: 'lunch', name: 'Coconut Rice', calories: 210 },
  { meal: 'lunch', name: 'Plain Rice', calories: 113 },
  { meal: 'lunch', name: 'Garlic Rasam', calories: 50 },
  { meal: 'lunch', name: 'Beetroot Poriyal', calories: 81 },
  { meal: 'lunch', name: 'Pudalangai Kootu', calories: 86 },
  { meal: 'lunch', name: 'Kara Boondhi', calories: 536 },
  { meal: 'lunch', name: 'Banana', calories: 90 },
  // Dinner
  { meal: 'dinner', name: 'Idli', calories: 60 },
  { meal: 'dinner', name: 'Kaldosa', calories: 78 },
  { meal: 'dinner', name: 'Mangai Rasam', calories: 21 },
  { meal: 'dinner', name: 'White Rice', calories: 113 },
  { meal: 'dinner', name: 'Chapathi', calories: 70 },
  { meal: 'dinner', name: 'Dosa', calories: 120 },
  { meal: 'dinner', name: 'Toor Dall Moong Dall Sambar', calories: 62 },
  { meal: 'dinner', name: 'Cauliflower Rice', calories: 40 },
  { meal: 'dinner', name: 'Curd', calories: 58 },
  { meal: 'dinner', name: 'Coconut Chutney', calories: 120 },
  { meal: 'dinner', name: 'Tomato Thokku', calories: 70 },
  { meal: 'dinner', name: 'Boiled Egg', calories: 78 },
  { meal: 'dinner', name: 'Cabbage Poriyal', calories: 76 },
  { meal: 'dinner', name: 'Appalam', calories: 99 },
  { meal: 'dinner', name: 'Malli Chutney', calories: 44 },
  { meal: 'dinner', name: 'Omelette', calories: 94 },
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
  2: { items: THURSDAY, note: 'default — share Tuesday menu to set exactly' },
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
