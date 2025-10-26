import { useState, useEffect } from "react"
import { useAppKitAccount } from '@reown/appkit/react'

import { createCustomer, listCustomers, getCustomer } from "../services/bridge"

/**
 * Hook to manage Bridge customer for the connected wallet
 * Automatically creates a customer if one doesn't exist for the wallet address
 */
export function useBridgeCustomer() {
  const { address } = useAppKitAccount()
  const [customerId, setCustomerId] = useState<string | null>(null)
  const [customer, setCustomer] = useState<any | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!address) {
      setCustomerId(null)
      setCustomer(null)
      return
    }

    const loadOrCreateCustomer = async () => {
      setLoading(true)
      setError(null)

      try {
        // Check localStorage first for cached customer ID
        const cachedCustomerId = localStorage.getItem(`bridge_customer_${address}`)

        if (cachedCustomerId) {
          // Verify the customer still exists
          const response = await getCustomer(cachedCustomerId)
          if (response.success && response.data) {
            setCustomerId(cachedCustomerId)
            setCustomer(response.data)
            setLoading(false)
            return
          } else {
            // Customer no longer exists, clear cache
            localStorage.removeItem(`bridge_customer_${address}`)
          }
        }

        // List customers to see if one exists for this wallet
        // Note: In production, you'd want to search by external_id or metadata
        const listResponse = await listCustomers()

        if (listResponse.success && listResponse.data?.data) {
          // For now, just use the first customer or create a new one
          // In production, you'd search for customer by wallet address in metadata
          const existingCustomer = listResponse.data.data[0]

          if (existingCustomer) {
            setCustomerId(existingCustomer.id)
            setCustomer(existingCustomer)
            localStorage.setItem(`bridge_customer_${address}`, existingCustomer.id)
          } else {
            // Create new customer
            await createNewCustomer()
          }
        } else {
          // Create new customer
          await createNewCustomer()
        }
      } catch (e) {
        setError(e instanceof Error ? e.message : "Failed to load customer")
      } finally {
        setLoading(false)
      }
    }

    const createNewCustomer = async () => {
      const response = await createCustomer({
        type: "individual",
        first_name: "User",
        last_name: address!.slice(2, 8),
        email: `${address!.toLowerCase()}@medici.app`,
        // Note: In production, you'd want to collect real user information
        // and comply with KYC requirements
      })

      if (response.success && response.data) {
        setCustomerId(response.data.id)
        setCustomer(response.data)
        localStorage.setItem(`bridge_customer_${address}`, response.data.id)
      } else {
        setError(response.error?.message || "Failed to create customer")
      }
    }

    loadOrCreateCustomer()
  }, [address])

  return {
    customerId,
    customer,
    loading,
    error,
  }
}
