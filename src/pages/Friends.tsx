import { useState } from 'react'
import { useStore } from '../lib/store'
import { Card, Modal, PageHeader, Empty } from '../components/ui'
import { workoutsThisWeek, streak, totalLost } from '../lib/calcs'
import { ACHIEVEMENTS } from '../lib/achievements'
import { Friend } from '../lib/types'
import { Trash2 } from 'lucide-react'

interface Row { me?: boolean; name: string; color: string; weeklyWorkouts: number; streak: number; weightLost: number; caloriesAvg: number }

export default function Friends() {
  const d = useStore((s) => s.data)
  const addFriend = useStore((s) => s.addFriend)
  const delFriend = useStore((s) => s.delFriend)
  const showToast = useStore((s) => s.showToast)
  const [open, setOpen] = useState(false)
  const [shareOpen, setShareOpen] = useState(false)

  const me: Row = { me: true, name: d.profile.name.split(' ')[0], color: d.profile.avatar,
    weeklyWorkouts: workoutsThisWeek(d), streak: streak(d), weightLost: Math.max(0, totalLost(d)), caloriesAvg: 0 }
  const all: Row[] = [me, ...d.friends]
  const medal = ['#ffcf5c', '#cfd8ff', '#ff9d5c']

  const board = (key: keyof Row, unit: string, color: string) =>
    [...all].sort((a, b) => (b[key] as number) - (a[key] as number)).map((p, i) => (
      <div key={p.name + i} className="flex items-center gap-3 p-3 rounded-xl"
        style={{ background: p.me ? 'rgba(139,92,255,.08)' : 'rgba(6,8,15,.4)', border: `1px solid ${p.me ? 'rgba(120,160,255,.22)' : 'rgba(120,160,255,.12)'}` }}>
        <div className="w-7 text-center font-extrabold text-base" style={{ color: medal[i] || '#7d89a8' }}>{i + 1}</div>
        <div className="w-10 h-10 rounded-xl grid place-items-center font-extrabold text-white" style={{ background: p.color }}>{p.name[0]}</div>
        <div className="flex-1 min-w-0"><b className="text-[14px]">{p.name}{p.me && <span className="tag bg-[rgba(139,92,255,.16)] text-[#c4b1ff] ml-1.5">YOU</span>}</b></div>
        <div className="font-extrabold text-right" style={{ color }}>{p[key] as number}<span className="block text-[11px] text-muted font-semibold">{unit}</span></div>
      </div>
    ))

  return (
    <>
      <PageHeader title="Friends & Challenges" sub="Compete on weight lost, streaks & consistency"
        action={<div className="flex gap-2.5"><button className="btn" onClick={() => setShareOpen(true)}>Share Code</button>
          <button className="btn btn-primary" onClick={() => setOpen(true)}>+ Add Friend</button></div>} />

      <Card><div className="h3 mb-3">🏆 Weight-Loss Leaderboard</div>
        <div className="flex flex-col gap-2.5">{board('weightLost', 'kg', '#2bffb0')}</div></Card>

      <div className="grid gap-4 mt-4" style={{ gridTemplateColumns: 'repeat(auto-fit,minmax(300px,1fr))' }}>
        <Card><div className="h3 mb-3">🔥 Streak Rankings</div><div className="flex flex-col gap-2.5">{board('streak', 'days', '#ffcf5c')}</div></Card>
        <Card><div className="h3 mb-3">💪 Weekly Consistency</div><div className="flex flex-col gap-2.5">{board('weeklyWorkouts', 'workouts', '#22e3ff')}</div></Card>
      </div>

      <Card className="mt-4"><div className="h3 mb-3">🎖️ Achievements & Challenges</div>
        <div className="grid gap-3" style={{ gridTemplateColumns: 'repeat(auto-fit,minmax(220px,1fr))' }}>
          {ACHIEVEMENTS.map((a) => {
            const done = a.done(d)
            const prog = done ? 1 : (a.progress ? a.progress(d) : 0)
            return (
              <div key={a.id} className="p-3.5 rounded-xl" style={{ background: done ? 'rgba(43,255,176,.07)' : 'rgba(6,8,15,.4)', border: `1px solid ${done ? '#2bffb033' : 'rgba(120,160,255,.12)'}`, opacity: done ? 1 : 0.92 }}>
                <div className="flex items-center gap-2.5">
                  <span className="text-2xl" style={{ filter: done ? 'none' : 'grayscale(.6)' }}>{a.icon}</span>
                  <div><b className="text-[13.5px]">{a.title}</b>{done && <span className="tag bg-[rgba(43,255,176,.16)] text-green ml-1.5">DONE</span>}</div>
                </div>
                <p className="text-[12px] text-muted mt-1.5">{a.desc}</p>
                <div className="h-1.5 rounded-full bg-[rgba(120,160,255,.1)] overflow-hidden mt-2">
                  <div className="h-full rounded-full" style={{ width: `${prog * 100}%`, background: done ? '#2bffb0' : 'linear-gradient(90deg,#22e3ff,#8b5cff)' }} />
                </div>
              </div>
            )
          })}
        </div></Card>

      <Card className="mt-4"><div className="h3 mb-3">Your Friends</div>
        {d.friends.length ? (
          <div className="flex flex-col gap-2.5">
            {d.friends.map((f) => (
              <div key={f.id} className="flex items-center gap-3.5 p-3 rounded-xl" style={{ background: 'rgba(6,8,15,.4)', border: '1px solid rgba(120,160,255,.12)' }}>
                <div className="w-10 h-10 rounded-xl grid place-items-center font-extrabold text-white" style={{ background: f.color }}>{f.name[0]}</div>
                <div className="flex-1 min-w-0"><b className="text-[14.5px]">{f.name}</b>
                  <span className="block text-xs text-muted">{f.weightLost} kg lost · {f.weeklyWorkouts} workouts/wk · 🔥{f.streak}</span></div>
                <button className="btn btn-sm btn-danger" onClick={() => delFriend(f.id)}><Trash2 size={14} /></button>
              </div>
            ))}
          </div>
        ) : <Empty icon="👥" title="No friends yet" sub="Add friends to compete" />}
      </Card>

      {open && <AddFriendModal onClose={() => setOpen(false)} onSave={(f) => { addFriend(f); showToast('Friend added 🎉'); setOpen(false) }} />}
      {shareOpen && <ShareModal me={me} onClose={() => setShareOpen(false)} />}
    </>
  )
}

function AddFriendModal({ onClose, onSave }: { onClose: () => void; onSave: (f: Omit<Friend, 'id'>) => void }) {
  const [name, setName] = useState('')
  const [code, setCode] = useState('')
  const colors = ['#22e3ff', '#ff4fd8', '#2bffb0', '#ffcf5c', '#8b5cff']
  function save() {
    if (code.startsWith('PULSE:')) {
      try {
        const data = JSON.parse(atob(code.slice(6)))
        return onSave({ name: data.name || 'Friend', color: data.color || '#22e3ff', weeklyWorkouts: data.weeklyWorkouts || 0, streak: data.streak || 0, weightLost: data.weightLost || 0, caloriesAvg: data.caloriesAvg || 0 })
      } catch { return alert('Invalid code') }
    }
    if (!name.trim()) return alert('Enter a name')
    onSave({ name: name.trim(), color: colors[Math.floor(Math.random() * colors.length)], weeklyWorkouts: Math.floor(Math.random() * 5) + 1, streak: Math.floor(Math.random() * 15), weightLost: +(Math.random() * 8).toFixed(1), caloriesAvg: 2000 })
  }
  return (
    <Modal title="Add Friend" onClose={onClose}>
      <div className="mt-4">
        <p className="text-muted text-[13px] mb-3.5">Enter a friend's name, or paste their PULSE share code to import their real stats.</p>
        <div className="mb-3.5"><label className="label">Friend's Name</label><input className="input" value={name} onChange={(e) => setName(e.target.value)} placeholder="Name" /></div>
        <div className="mb-1"><label className="label">Or paste Share Code</label><textarea className="input" rows={3} value={code} onChange={(e) => setCode(e.target.value)} placeholder="PULSE:..." /></div>
        <button className="btn btn-primary w-full mt-4" onClick={save}>Add Friend</button>
      </div>
    </Modal>
  )
}

function ShareModal({ me, onClose }: { me: Row; onClose: () => void }) {
  const code = 'PULSE:' + btoa(JSON.stringify({ name: me.name, color: me.color, weeklyWorkouts: me.weeklyWorkouts, streak: me.streak, weightLost: me.weightLost, caloriesAvg: me.caloriesAvg }))
  return (
    <Modal title="Your Share Code" onClose={onClose}>
      <div className="mt-4">
        <p className="text-muted text-[13px] mb-3">Send this to a friend. They paste it in “Add Friend” to see your stats on their leaderboard.</p>
        <textarea className="input" rows={4} readOnly value={code} onClick={(e) => (e.target as HTMLTextAreaElement).select()} />
        <button className="btn btn-primary w-full mt-3" onClick={() => navigator.clipboard?.writeText(code)}>Copy Code</button>
      </div>
    </Modal>
  )
}
