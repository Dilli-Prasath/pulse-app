import { useEffect, useState, ReactNode } from 'react'
import { useStore } from '../lib/store'
import { Card, Modal, PageHeader, Empty, Toggle } from '../components/ui'
import { workoutsThisWeek, streak, totalLost, latestWeight, bmi, bmiLabel, calorieTarget, proteinTarget, carbTarget, fatTarget, caloriesOn, macrosOn, waterToday, prs, totalVolume } from '../lib/calcs'
import { dayReport } from '../lib/nutrition'
import { getProgram } from '../lib/programs'
import { today } from '../lib/seed'
import { ACHIEVEMENTS } from '../lib/achievements'
import { Friend, AppData, SHARE_PAGES, SharePage } from '../lib/types'
import { isAdmin, fetchLeaderboard, upsertEntry, deleteEntry, LbEntry, ADMIN_EMAIL } from '../lib/leaderboard'
import { myGroups, groupMembers, createGroup, joinByCode, publishStats, leaveGroup, inviteLink, fetchMemberData, currentUserId, Group, GroupMember, MemberStats } from '../lib/groups'
import { Trash2, Pencil, ShieldCheck, Globe, Plus, Users2, Copy, LogOut, UserPlus, Eye, Lock, Loader2 } from 'lucide-react'

interface Row { me?: boolean; name: string; color: string; weeklyWorkouts: number; streak: number; weightLost: number; caloriesAvg: number }

export default function Friends() {
  const d = useStore((s) => s.data)
  const addFriend = useStore((s) => s.addFriend)
  const delFriend = useStore((s) => s.delFriend)
  const showToast = useStore((s) => s.showToast)
  const session = useStore((s) => s.session)
  const cloud = useStore((s) => s.cloud)
  const admin = isAdmin(session)
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

      {cloud && <GlobalLeaderboard admin={admin} />}

      {cloud && session && <GroupsSection />}

      <div className="h3 mt-6 mb-3 flex items-center gap-2">👥 Your Personal Board <span className="text-muted2 text-[11px] normal-case font-normal">(friends you add via code)</span></div>
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

/* ---------------- Groups / teams ---------------- */
function useMyStats(): MemberStats {
  const d = useStore((s) => s.data)
  return {
    name: d.profile.name.split(' ')[0] || 'You',
    color: d.profile.avatar,
    weight_lost: Math.max(0, totalLost(d)),
    streak: streak(d),
    weekly_workouts: workoutsThisWeek(d),
  }
}

function GroupsSection() {
  const showToast = useStore((s) => s.showToast)
  const me = useMyStats()
  const [groups, setGroups] = useState<Group[]>([])
  const [membersByGroup, setMembersByGroup] = useState<Record<string, GroupMember[]>>({})
  const [createOpen, setCreateOpen] = useState(false)
  const [joinCode, setJoinCode] = useState('')
  const [busy, setBusy] = useState(false)
  const [myId, setMyId] = useState<string | null>(null)
  const [viewing, setViewing] = useState<{ name: string; data: AppData } | null>(null)
  const [viewBusy, setViewBusy] = useState<string | null>(null)

  async function openMember(mem: GroupMember) {
    setViewBusy(mem.user_id)
    const data = await fetchMemberData(mem.user_id)
    setViewBusy(null)
    if (!data || !data.sharing?.enabled || !SHARE_PAGES.some((p) => data.sharing.pages?.[p.key])) {
      showToast(`${mem.name || 'This member'} hasn't shared any pages yet`)
      return
    }
    setViewing({ name: mem.name || 'Teammate', data })
  }

  async function load() {
    setMyId(await currentUserId())
    const gs = await myGroups()
    setGroups(gs)
    if (gs.length) await publishStats(gs.map((g) => g.id), me)
    const map: Record<string, GroupMember[]> = {}
    await Promise.all(gs.map(async (g) => { map[g.id] = await groupMembers(g.id) }))
    setMembersByGroup(map)
  }
  useEffect(() => { void load() }, []) // eslint-disable-line react-hooks/exhaustive-deps

  // handle invite link: /friends?join=CODE
  useEffect(() => {
    const code = new URLSearchParams(window.location.search).get('join')
    if (!code) return
    ;(async () => {
      const r = await joinByCode(code, me)
      if (r.error) showToast(r.error)
      else { showToast('Joined the group 🎉'); await load() }
      const url = new URL(window.location.href); url.searchParams.delete('join')
      window.history.replaceState({}, '', url.pathname)
    })()
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  async function doJoin() {
    if (!joinCode.trim()) return
    setBusy(true)
    const r = await joinByCode(joinCode, me)
    setBusy(false)
    if (r.error) { showToast(r.error); return }
    setJoinCode(''); showToast('Joined 🎉'); await load()
  }
  async function doLeave(id: string) { await leaveGroup(id); showToast('Left group'); await load() }

  const medal = ['#ffcf5c', '#cfd8ff', '#ff9d5c']

  return (
    <div className="mt-6">
      <div className="flex items-center gap-2 mb-3 flex-wrap">
        <Users2 size={16} className="text-violet" />
        <div className="h3">My Groups & Teams</div>
        <button className="btn btn-sm btn-primary ml-auto" onClick={() => setCreateOpen(true)}><Plus size={13} /> Create group</button>
      </div>

      <SharingPanel />

      <Card className="mb-4">
        <label className="label">Join a group with an invite code</label>
        <div className="flex gap-2">
          <input className="input" placeholder="e.g. 7K2Q9P" value={joinCode} onChange={(e) => setJoinCode(e.target.value.toUpperCase())} />
          <button className="btn btn-primary shrink-0" disabled={busy} onClick={doJoin}><UserPlus size={14} /> Join</button>
        </div>
      </Card>

      {groups.length === 0
        ? <Card><Empty icon="👥" title="No groups yet" sub="Create one and share the invite link with friends" /></Card>
        : groups.map((g) => (
          <Card key={g.id} className="mb-4">
            <div className="flex items-center justify-between gap-2 flex-wrap mb-3">
              <div><b className="text-[16px]">{g.name}</b>
                <div className="text-muted text-xs mt-0.5">Invite code: <span className="text-cyan font-bold tracking-wider">{g.invite_code}</span></div></div>
              <div className="flex gap-2">
                <button className="btn btn-sm" onClick={() => { navigator.clipboard?.writeText(inviteLink(g.invite_code)); showToast('Invite link copied 🔗') }}><Copy size={13} /> Invite link</button>
                <button className="btn btn-sm btn-danger" onClick={() => doLeave(g.id)}><LogOut size={13} /></button>
              </div>
            </div>
            <div className="flex flex-col gap-2">
              {(membersByGroup[g.id] || []).map((mem, i) => (
                <div key={mem.user_id} className="flex items-center gap-3 p-2.5 rounded-xl" style={{ background: 'rgba(6,8,15,.4)', border: '1px solid rgba(120,160,255,.12)' }}>
                  <div className="w-6 text-center font-extrabold text-sm" style={{ color: medal[i] || '#7d89a8' }}>{i + 1}</div>
                  <div className="w-9 h-9 rounded-lg grid place-items-center font-extrabold text-white shrink-0" style={{ background: mem.color }}>{(mem.name || '?')[0]}</div>
                  <div className="flex-1 min-w-0"><b className="text-[14px]">{mem.name}</b>
                    <span className="block text-[11px] text-muted">{mem.weekly_workouts}/wk · 🔥 {mem.streak}</span></div>
                  <div className="font-extrabold text-right text-green shrink-0" style={{ color: '#2bffb0' }}>{mem.weight_lost}<span className="block text-[10px] text-muted font-semibold">kg lost</span></div>
                  {mem.user_id !== myId && (
                    <button className="btn btn-sm shrink-0" title="View shared pages" disabled={viewBusy === mem.user_id} onClick={() => openMember(mem)}>
                      {viewBusy === mem.user_id ? <Loader2 size={14} className="animate-spin" /> : <Eye size={14} />}
                    </button>
                  )}
                </div>
              ))}
            </div>
          </Card>
        ))}

      {createOpen && <CreateGroupModal me={me} onClose={() => setCreateOpen(false)} onCreated={() => { setCreateOpen(false); void load() }} />}
      {viewing && <MemberViewer name={viewing.name} data={viewing.data} onClose={() => setViewing(null)} />}
    </div>
  )
}

/* ---------------- Privacy & sharing controls ---------------- */
function SharingPanel() {
  const sharing = useStore((s) => s.data.sharing)
  const setSharing = useStore((s) => s.setSharing)
  const showToast = useStore((s) => s.showToast)
  const anyOn = sharing.enabled && SHARE_PAGES.some((p) => sharing.pages[p.key])

  function toggleMaster(v: boolean) {
    setSharing({ ...sharing, enabled: v })
    showToast(v ? 'Sharing on — choose what teammates can see' : 'Sharing off — your data is private 🔒')
  }
  const togglePage = (k: SharePage, v: boolean) => setSharing({ ...sharing, pages: { ...sharing.pages, [k]: v } })

  return (
    <Card className="mb-4">
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div className="flex items-center gap-2">
          {sharing.enabled ? <Eye size={16} className="text-cyan" /> : <Lock size={16} className="text-muted" />}
          <div className="h3">Privacy &amp; Sharing</div>
          <span className="tag" style={{ background: sharing.enabled ? 'rgba(34,227,255,.14)' : 'rgba(120,160,255,.12)', color: sharing.enabled ? '#22e3ff' : '#7d89a8' }}>{sharing.enabled ? 'On' : 'Private'}</span>
        </div>
        <Toggle on={sharing.enabled} onChange={toggleMaster} />
      </div>
      <p className="text-muted text-[12.5px] mt-1.5">Pick what your group teammates can view. Everything is private by default — turn a page on to let teammates open a <b className="text-txt">read-only</b> view of it. Turn the master switch off anytime to instantly hide everything.</p>

      <div className={`mt-3 grid gap-2 transition-opacity ${sharing.enabled ? '' : 'opacity-45 pointer-events-none'}`} style={{ gridTemplateColumns: 'repeat(auto-fill,minmax(230px,1fr))' }}>
        {SHARE_PAGES.map((p) => (
          <div key={p.key} className="flex items-center gap-3 p-3 rounded-xl" style={{ background: sharing.pages[p.key] ? 'rgba(34,227,255,.07)' : 'rgba(6,8,15,.4)', border: `1px solid ${sharing.pages[p.key] ? 'rgba(34,227,255,.28)' : 'rgba(120,160,255,.12)'}` }}>
            <span className="text-xl shrink-0">{p.icon}</span>
            <div className="flex-1 min-w-0"><b className="text-[13.5px]">{p.label}</b><div className="text-[11px] text-muted leading-tight mt-0.5">{p.desc}</div></div>
            <Toggle on={!!sharing.pages[p.key]} onChange={(v) => togglePage(p.key, v)} disabled={!sharing.enabled} />
          </div>
        ))}
      </div>

      {sharing.enabled && !anyOn && <div className="text-[11.5px] text-amber mt-2.5">⚠️ Sharing is on but no pages are selected — teammates still can't see anything. Toggle a page above.</div>}
      <div className="text-[11px] text-muted2 mt-2.5">Only members of groups you belong to can view, and only the pages you enable. Requires cloud sync.</div>
    </Card>
  )
}

/* ---------------- Read-only teammate viewer ---------------- */
function VStat({ label, value, unit, color = '#e8edff' }: { label: string; value: string | number; unit?: string; color?: string }) {
  return (
    <div className="rounded-xl p-3 text-center" style={{ background: 'rgba(6,8,15,.5)', border: '1px solid rgba(120,160,255,.12)' }}>
      <div className="text-[18px] font-extrabold leading-none" style={{ color }}>{value}{unit ? <span className="text-[10px] text-muted font-semibold ml-0.5">{unit}</span> : null}</div>
      <div className="text-[10px] text-muted uppercase tracking-wide mt-1">{label}</div>
    </div>
  )
}
function VSection({ icon, title, children }: { icon: string; title: string; children: ReactNode }) {
  return (
    <div>
      <div className="h3 mb-2 flex items-center gap-1.5"><span>{icon}</span>{title}</div>
      {children}
    </div>
  )
}

function MemberViewer({ name, data, onClose }: { name: string; data: AppData; onClose: () => void }) {
  // normalise arrays so calc helpers are safe on any saved shape
  const d: AppData = {
    ...data,
    weights: data.weights || [], workouts: data.workouts || [], meals: data.meals || [],
    water: data.water || [], inbody: data.inbody || [], measurements: data.measurements || [],
  }
  const pages = d.sharing?.pages || { dashboard: false, workouts: false, nutrition: false, body: false }
  const shown = SHARE_PAGES.filter((p) => pages[p.key])
  const t = today()
  const w = latestWeight(d)
  const b = bmi(d)
  const [bLabel, bColor] = bmiLabel(b)
  const grid3 = { display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 8 } as const

  const todayMeals = d.meals.filter((m) => m.date === t)
  const rep = pages.nutrition ? dayReport(
    todayMeals.map((m) => ({ name: m.name, calories: m.calories, protein: m.protein, carbs: m.carbs, fat: m.fat })),
    { calories: calorieTarget(d), protein: proteinTarget(d), carbs: carbTarget(d), fat: fatTarget(d) }, d.profile.sex,
  ) : null
  const mac = macrosOn(d, t)
  const prCount = Object.keys(prs(d)).length
  const recentWorkouts = [...d.workouts].sort((a, c) => c.date.localeCompare(a.date)).slice(0, 6)
  const lastInbody = d.inbody[d.inbody.length - 1]
  const lastMeas = d.measurements[d.measurements.length - 1]
  const program = getProgram(d.profile.programId)

  return (
    <Modal wide title={`${name}'s PULSE`} onClose={onClose}>
      <div className="flex items-center gap-2 mt-1 mb-3 flex-wrap">
        <span className="tag bg-[rgba(43,255,176,.16)] text-green inline-flex items-center gap-1"><Eye size={11} /> Read-only</span>
        <span className="text-[12px] text-muted">Shared by {name} · {shown.length} page{shown.length !== 1 ? 's' : ''}</span>
      </div>

      {shown.length === 0 ? (
        <Empty icon="🔒" title="Nothing shared" sub={`${name} hasn't enabled any pages`} />
      ) : (
        <div className="flex flex-col gap-5">
          {pages.dashboard && (
            <VSection icon="📊" title="Dashboard">
              <div style={grid3}>
                <VStat label="Weight" value={w.toFixed(1)} unit="kg" color="#22e3ff" />
                <VStat label="BMI" value={b.toFixed(1)} color={bColor} />
                <VStat label="Streak" value={streak(d)} unit="d" color="#ffcf5c" />
                <VStat label="This week" value={workoutsThisWeek(d)} unit="wk" color="#8b5cff" />
                <VStat label="Lost" value={Math.max(0, totalLost(d))} unit="kg" color="#2bffb0" />
                <VStat label="Today kcal" value={caloriesOn(d, t)} color="#ff4fd8" />
              </div>
              <div className="text-[11px] mt-1.5" style={{ color: bColor }}>BMI status: {bLabel}</div>
            </VSection>
          )}

          {pages.workouts && (
            <VSection icon="🏋️" title="Workouts">
              <div style={grid3}>
                <VStat label="Total" value={d.workouts.length} color="#22e3ff" />
                <VStat label="This week" value={workoutsThisWeek(d)} color="#8b5cff" />
                <VStat label="Streak" value={streak(d)} unit="d" color="#ffcf5c" />
                <VStat label="PRs" value={prCount} color="#2bffb0" />
                <VStat label="Volume" value={totalVolume(d).toLocaleString()} unit="kg" color="#ff4fd8" />
              </div>
              {recentWorkouts.length > 0 && (
                <div className="mt-2 flex flex-col gap-1.5">
                  {recentWorkouts.map((wo) => (
                    <div key={wo.id} className="flex justify-between items-center text-[12.5px] px-3 py-2 rounded-lg" style={{ background: 'rgba(6,8,15,.4)', border: '1px solid rgba(120,160,255,.1)' }}>
                      <b className="truncate">{wo.name}</b><span className="text-muted shrink-0 ml-2">{wo.type} · {wo.date}</span>
                    </div>
                  ))}
                </div>
              )}
            </VSection>
          )}

          {pages.nutrition && rep && (
            <VSection icon="🥗" title="Nutrition (today)">
              <div style={grid3}>
                <VStat label="Calories" value={caloriesOn(d, t)} unit={`/${calorieTarget(d)}`} color="#2bffb0" />
                <VStat label="Health" value={rep.score} unit="/100" color="#ff4fd8" />
                <VStat label="Water" value={(waterToday(d) / 1000).toFixed(1)} unit="L" color="#22e3ff" />
                <VStat label="Protein" value={Math.round(mac.p)} unit="g" color="#22e3ff" />
                <VStat label="Carbs" value={Math.round(mac.c)} unit="g" color="#8b5cff" />
                <VStat label="Fat" value={Math.round(mac.f)} unit="g" color="#ff4fd8" />
              </div>
              <div className="text-[11.5px] text-muted mt-1.5">{rep.summary}</div>
            </VSection>
          )}

          {pages.body && (
            <VSection icon="🧬" title="Body & Programs">
              <div style={grid3}>
                <VStat label="Weight" value={w.toFixed(1)} unit="kg" color="#22e3ff" />
                <VStat label="BMI" value={b.toFixed(1)} color={bColor} />
                <VStat label="Target" value={d.profile.targetWeight || '—'} unit="kg" color="#2bffb0" />
                {lastInbody?.bodyFatPct != null && <VStat label="Body fat" value={lastInbody.bodyFatPct} unit="%" color="#ffcf5c" />}
                {lastInbody?.skeletalMuscleMass != null && <VStat label="Muscle" value={lastInbody.skeletalMuscleMass} unit="kg" color="#8b5cff" />}
                {lastMeas?.waist != null && <VStat label="Waist" value={lastMeas.waist} unit="cm" color="#ff4fd8" />}
              </div>
              <div className="mt-2 text-[12.5px] px-3 py-2 rounded-lg" style={{ background: 'rgba(139,92,255,.08)', border: '1px solid rgba(139,92,255,.2)' }}>
                Active program: <b className="text-txt">{program ? `${program.emoji} ${program.name}` : 'None set'}</b>
              </div>
            </VSection>
          )}
        </div>
      )}
    </Modal>
  )
}

function CreateGroupModal({ me, onClose, onCreated }: { me: MemberStats; onClose: () => void; onCreated: () => void }) {
  const showToast = useStore((s) => s.showToast)
  const [name, setName] = useState('')
  const [busy, setBusy] = useState(false)
  async function save() {
    if (!name.trim()) return
    setBusy(true)
    const r = await createGroup(name.trim(), me)
    setBusy(false)
    if (r.error) { showToast(r.error); return }
    showToast('Group created 🎉'); onCreated()
  }
  return (
    <Modal title="Create a group" onClose={onClose}>
      <div className="mt-4">
        <label className="label">Group name</label>
        <input className="input" value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Office Fitness Squad" />
        <button className="btn btn-primary w-full mt-4" disabled={busy} onClick={save}>{busy ? 'Creating…' : 'Create & get invite link'}</button>
      </div>
    </Modal>
  )
}

/* ---------------- Global admin-curated leaderboard ---------------- */
const MEDAL = ['#ffcf5c', '#cfd8ff', '#ff9d5c']
const BLANK: LbEntry = { name: '', avatar_color: '#22e3ff', weight_lost: 0, streak: 0, weekly_workouts: 0, note: '' }

function GlobalLeaderboard({ admin }: { admin: boolean }) {
  const showToast = useStore((s) => s.showToast)
  const [entries, setEntries] = useState<LbEntry[]>([])
  const [loading, setLoading] = useState(true)
  const [edit, setEdit] = useState<LbEntry | null>(null)

  async function load() { setLoading(true); setEntries(await fetchLeaderboard()); setLoading(false) }
  useEffect(() => { void load() }, [])

  async function save(e: LbEntry) {
    const err = await upsertEntry(e)
    if (err) { showToast(err.includes('row-level') ? 'Only the admin can edit this' : err); return }
    showToast('Leaderboard updated ✅'); setEdit(null); void load()
  }
  async function remove(id?: string) {
    if (!id) return
    const err = await deleteEntry(id)
    if (err) { showToast('Only the admin can delete'); return }
    showToast('Removed'); void load()
  }

  return (
    <Card glow>
      <div className="flex items-center gap-2 mb-3 flex-wrap">
        <Globe size={16} className="text-cyan" />
        <div className="h3">Global Leaderboard</div>
        {admin
          ? <span className="tag bg-[rgba(43,255,176,.16)] text-green inline-flex items-center gap-1"><ShieldCheck size={11} /> Admin</span>
          : <span className="tag bg-[rgba(120,160,255,.12)] text-muted">View only</span>}
        {admin && <button className="btn btn-sm btn-primary ml-auto" onClick={() => setEdit({ ...BLANK })}><Plus size={13} /> Add entry</button>}
      </div>

      {loading ? <div className="text-muted text-sm py-4">Loading…</div>
        : entries.length === 0 ? <Empty icon="🌍" title="Leaderboard is empty" sub={admin ? 'Add the first entry above' : 'Check back soon — the admin will post rankings'} />
        : (
          <div className="flex flex-col gap-2.5">
            {entries.map((e, i) => (
              <div key={e.id || i} className="flex items-center gap-3 p-3 rounded-xl" style={{ background: 'rgba(6,8,15,.4)', border: '1px solid rgba(120,160,255,.12)' }}>
                <div className="w-7 text-center font-extrabold text-base" style={{ color: MEDAL[i] || '#7d89a8' }}>{i + 1}</div>
                <div className="w-10 h-10 rounded-xl grid place-items-center font-extrabold text-white shrink-0" style={{ background: e.avatar_color }}>{(e.name || '?')[0]}</div>
                <div className="flex-1 min-w-0">
                  <b className="text-[14px] block truncate">{e.name}</b>
                  <span className="text-xs text-muted">{e.weekly_workouts}/wk · 🔥 {e.streak}{e.note ? ` · ${e.note}` : ''}</span>
                </div>
                <div className="font-extrabold text-right accent-green shrink-0" style={{ color: '#2bffb0' }}>{e.weight_lost}<span className="block text-[11px] text-muted font-semibold">kg lost</span></div>
                {admin && (
                  <div className="flex gap-1.5 shrink-0">
                    <button className="btn btn-sm" onClick={() => setEdit(e)}><Pencil size={13} /></button>
                    <button className="btn btn-sm btn-danger" onClick={() => remove(e.id)}><Trash2 size={13} /></button>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

      {!admin && <div className="text-[11px] text-muted2 mt-3">Only the admin ({ADMIN_EMAIL}) can edit these rankings.</div>}
      {edit && <EntryModal entry={edit} onClose={() => setEdit(null)} onSave={save} />}
    </Card>
  )
}

function EntryModal({ entry, onClose, onSave }: { entry: LbEntry; onClose: () => void; onSave: (e: LbEntry) => void }) {
  const [e, setE] = useState<LbEntry>(entry)
  const set = (k: keyof LbEntry, v: string | number) => setE({ ...e, [k]: v })
  return (
    <Modal title={entry.id ? 'Edit entry' : 'Add leaderboard entry'} onClose={onClose}>
      <div className="mt-4">
        <div className="mb-3.5"><label className="label">Name</label><input className="input" value={e.name} onChange={(ev) => set('name', ev.target.value)} /></div>
        <div className="grid grid-cols-2 gap-3.5">
          <div><label className="label">Weight lost (kg)</label><input className="input" type="number" step="0.1" value={e.weight_lost} onChange={(ev) => set('weight_lost', +ev.target.value)} /></div>
          <div><label className="label">Avatar color</label><input className="input" type="color" style={{ height: 44, padding: 4 }} value={e.avatar_color} onChange={(ev) => set('avatar_color', ev.target.value)} /></div>
          <div><label className="label">Streak (days)</label><input className="input" type="number" value={e.streak} onChange={(ev) => set('streak', +ev.target.value)} /></div>
          <div><label className="label">Workouts / week</label><input className="input" type="number" value={e.weekly_workouts} onChange={(ev) => set('weekly_workouts', +ev.target.value)} /></div>
        </div>
        <div className="mt-3.5 mb-1"><label className="label">Note (optional)</label><input className="input" value={e.note || ''} onChange={(ev) => set('note', ev.target.value)} placeholder="e.g. Member of the month" /></div>
        <button className="btn btn-primary w-full mt-4" onClick={() => { if (!e.name.trim()) return alert('Enter a name'); onSave(e) }}>Save</button>
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
