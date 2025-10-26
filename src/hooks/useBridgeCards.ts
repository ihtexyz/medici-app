import { useState, useEffect } from "react"
import { useAppKitAccount } from '@reown/appkit/react'

import { listCards, getCardTransactions } from "../services/bridge"
import type { PaymentCard, CardTransaction } from "../types/bridge"

export function useBridgeCards() {
  const { address } = useAppKitAccount()
  const [cards, setCards] = useState<PaymentCard[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!address) {
      setCards([])
      return
    }

    const loadCards = async () => {
      setLoading(true)
      setError(null)
      try {
        const response = await listCards()
        if (response.success && response.data) {
          setCards(response.data.data)
        } else {
          setError(response.error?.message || "Failed to load cards")
        }
      } catch (e) {
        setError(e instanceof Error ? e.message : "Failed to load cards")
      } finally {
        setLoading(false)
      }
    }

    loadCards()
  }, [address])

  const activeCards = cards.filter(card => card.status === 'active')
  const primaryCard = activeCards.length > 0 ? activeCards[0] : null

  return {
    cards,
    activeCards,
    primaryCard,
    loading,
    error,
  }
}

export function useCardTransactions(cardId: string | undefined) {
  const [transactions, setTransactions] = useState<CardTransaction[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!cardId) {
      setTransactions([])
      return
    }

    const loadTransactions = async () => {
      setLoading(true)
      setError(null)
      try {
        const response = await getCardTransactions(cardId)
        if (response.success && response.data) {
          setTransactions(response.data.data)
        } else {
          setError(response.error?.message || "Failed to load transactions")
        }
      } catch (e) {
        setError(e instanceof Error ? e.message : "Failed to load transactions")
      } finally {
        setLoading(false)
      }
    }

    loadTransactions()
  }, [cardId])

  return {
    transactions,
    loading,
    error,
  }
}
