import { AppData } from './types'
import { streak, totalLost, totalVolume, prs, workoutsThisWeek } from './calcs'

export interface AchievementDef {
  id: string
  title: string
  desc: string
  icon: string
  done: (d: AppData) => boolean
  progress?: (d: AppData) => number // 0..1
}

export const ACHIEVEMENTS: AchievementDef[] = [
  { id: 'first_workout', title: 'First Rep', desc: 'Log your first workout', icon: '🎯',
    done: (d) => d.workouts.length >= 1, progress: (d) => Math.min(1, d.workouts.length) },
  { id: 'streak3', title: 'On a Roll', desc: '3-day workout streak', icon: '🔥',
    done: (d) => streak(d) >= 3, progress: (d) => Math.min(1, streak(d) / 3) },
  { id: 'streak7', title: 'Week Warrior', desc: '7-day workout streak', icon: '⚡',
    done: (d) => streak(d) >= 7, progress: (d) => Math.min(1, streak(d) / 7) },
  { id: 'lost2', title: 'Lighter Steps', desc: 'Lose your first 2 kg', icon: '⚖️',
    done: (d) => totalLost(d) >= 2, progress: (d) => Math.min(1, totalLost(d) / 2) },
  { id: 'lost5', title: 'Transformation', desc: 'Lose 5 kg', icon: '🏆',
    done: (d) => totalLost(d) >= 5, progress: (d) => Math.min(1, totalLost(d) / 5) },
  { id: 'goal', title: 'Goal Crusher', desc: 'Reach your target weight', icon: '👑',
    done: (d) => totalLost(d) >= d.profile.startWeight - d.profile.targetWeight },
  { id: 'vol10k', title: 'Heavy Lifter', desc: 'Move 10,000 kg total volume', icon: '💪',
    done: (d) => totalVolume(d) >= 10000, progress: (d) => Math.min(1, totalVolume(d) / 10000) },
  { id: 'pr5', title: 'Record Setter', desc: 'Set 5 personal records', icon: '📈',
    done: (d) => Object.keys(prs(d)).length >= 5, progress: (d) => Math.min(1, Object.keys(prs(d)).length / 5) },
  { id: 'consistent', title: 'Consistency King', desc: '5 workouts in one week', icon: '🗓️',
    done: (d) => workoutsThisWeek(d) >= 5, progress: (d) => Math.min(1, workoutsThisWeek(d) / 5) },
  { id: 'meals20', title: 'Macro Master', desc: 'Log 20 meals', icon: '🥗',
    done: (d) => d.meals.length >= 20, progress: (d) => Math.min(1, d.meals.length / 20) },
]
