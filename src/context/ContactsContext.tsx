import React, { createContext, useContext, useEffect, useMemo, useState } from "react"

/**
 * A simple contact record.  Each contact has a user-friendly name
 * and an associated wallet address.  Additional metadata can be added
 * later (notes, favourite flag, etc.) as needed.
 */
export interface Contact {
  id: string
  name: string
  address: string
}

interface ContactsContextValue {
  contacts: Contact[]
  addContact: (name: string, address: string) => void
  updateContact: (id: string, name: string, address: string) => void
  removeContact: (id: string) => void
}

const ContactsContext = createContext<ContactsContextValue | undefined>(
  undefined,
)

/**
 * A provider that persists contacts to localStorage.  When
 * initialised it loads any existing contacts from localStorage.  On
 * every change it writes the updated list back.  Using localStorage
 * keeps the data on the user's device without sending it to a
 * backend.
 */
export function ContactsProvider({ children }: { children: React.ReactNode }) {
  const [contacts, setContacts] = useState<Contact[]>([])

  // Load contacts from localStorage on initial mount
  useEffect(() => {
    try {
      const raw = localStorage.getItem("origami.contacts")
      if (raw) {
        const parsed = JSON.parse(raw) as Contact[]
        setContacts(parsed)
      }
    } catch (err) {
      // ignore parse errors
      console.warn("Failed to parse saved contacts", err)
    }
  }, [])

  // Persist contacts whenever they change
  useEffect(() => {
    localStorage.setItem("origami.contacts", JSON.stringify(contacts))
  }, [contacts])

  const addContact = (name: string, address: string) => {
    setContacts((prev) => [
      ...prev,
      { id: crypto.randomUUID(), name: name.trim(), address: address.trim() },
    ])
  }

  const updateContact = (id: string, name: string, address: string) => {
    setContacts((prev) =>
      prev.map((contact) =>
        contact.id === id
          ? { ...contact, name: name.trim(), address: address.trim() }
          : contact,
      ),
    )
  }

  const removeContact = (id: string) => {
    setContacts((prev) => prev.filter((c) => c.id !== id))
  }

  const value = useMemo<ContactsContextValue>(
    () => ({ contacts, addContact, updateContact, removeContact }),
    [contacts],
  )

  return (
    <ContactsContext.Provider value={value}>{children}</ContactsContext.Provider>
  )
}

/**
 * Hook to access the contacts context.  Throws if used outside of
 * ContactsProvider.
 */
export function useContacts(): ContactsContextValue {
  const ctx = useContext(ContactsContext)
  if (!ctx) {
    throw new Error("useContacts must be used within a ContactsProvider")
  }
  return ctx
}