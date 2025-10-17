import React, { useState } from "react"
import { useContacts, Contact } from "../context/ContactsContext"

/**
 * Contacts page allows users to view, add, edit and delete saved
 * recipients.  Persisted contacts live entirely in localStorage and are
 * never sent to a backend.  In a future version this could be tied to
 * a cloud wallet or user account so contacts sync across devices.
 */
export default function Contacts() {
  const { contacts, addContact, updateContact, removeContact } =
    useContacts()
  const [name, setName] = useState("")
  const [address, setAddress] = useState("")
  const [editing, setEditing] = useState<Contact | null>(null)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim() || !address.trim()) return
    if (editing) {
      updateContact(editing.id, name, address)
      setEditing(null)
    } else {
      addContact(name, address)
    }
    setName("")
    setAddress("")
  }

  const startEdit = (contact: Contact) => {
    setEditing(contact)
    setName(contact.name)
    setAddress(contact.address)
  }

  const cancelEdit = () => {
    setEditing(null)
    setName("")
    setAddress("")
  }

  return (
    <section className="hero">
      <div className="hero-lede">Contacts</div>
      <h1 className="hero-title">Manage your payees</h1>
      <p className="hero-sub">
        Save frequently used addresses here for one‑click payments and
        bridging.  Contacts are stored in your browser and never leave
        your device.
      </p>
      <form onSubmit={handleSubmit} style={{ marginTop: 20 }}>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          <input
            type="text"
            placeholder="Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            style={{ flex: 1, minWidth: 120 }}
          />
          <input
            type="text"
            placeholder="0x… address"
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            style={{ flex: 2, minWidth: 240 }}
          />
          <button type="submit" className="button">
            {editing ? "Update" : "Add"}
          </button>
          {editing && (
            <button type="button" className="button" onClick={cancelEdit}>
              Cancel
            </button>
          )}
        </div>
      </form>
      <div style={{ marginTop: 24 }}>
        {contacts.length === 0 ? (
          <p style={{ fontSize: 14, color: "rgba(255,255,255,0.6)" }}>
            You haven't added any contacts yet.
          </p>
        ) : (
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr>
                <th style={{ textAlign: "left", padding: 4 }}>Name</th>
                <th style={{ textAlign: "left", padding: 4 }}>Address</th>
                <th style={{ padding: 4 }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {contacts.map((contact) => (
                <tr key={contact.id}>
                  <td style={{ padding: 4 }}>{contact.name}</td>
                  <td style={{ padding: 4, fontFamily: "monospace" }}>
                    {contact.address}
                  </td>
                  <td style={{ padding: 4 }}>
                    <button
                      type="button"
                      className="button"
                      onClick={() => startEdit(contact)}
                    >
                      Edit
                    </button>
                    <button
                      type="button"
                      className="button"
                      style={{ marginLeft: 4 }}
                      onClick={() => removeContact(contact.id)}
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </section>
  )
}