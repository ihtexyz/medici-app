import { create } from "zustand"

export type ActivityItem = {
  id: string
  type: "borrow" | "earn"
  amountUSD: number
  asset: string
  timestamp: number
}

type ActivityState = {
  items: ActivityItem[]
  add: (item: ActivityItem) => void
}

const STORAGE_KEY = "origami_activity"

const loadInitial = (): ActivityItem[] => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return []
    const parsed = JSON.parse(raw)
    if (Array.isArray(parsed)) return parsed as ActivityItem[]
  } catch (error) {
    return []
  }
  return []
}

export const useActivityStore = create<ActivityState>((set) => ({
  items: typeof window !== "undefined" ? loadInitial() : [],
  add: (item) => {
    set((state) => {
      const next = [item, ...state.items].slice(0, 50)
      if (typeof window !== "undefined") {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(next))
      }
      return { items: next }
    })
  },
}))

export const useActivity = () => useActivityStore((s) => s.items)
export const recordActivity = (item: ActivityItem) =>
  useActivityStore.getState().add(item)
