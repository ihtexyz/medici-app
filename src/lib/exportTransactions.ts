import type { Transaction } from "../types/transaction"

/**
 * Export transactions to CSV format
 */
export function exportToCSV(transactions: Transaction[], filename = "transactions.csv") {
  if (transactions.length === 0) {
    alert("No transactions to export")
    return
  }

  // CSV headers
  const headers = ["Date", "Type", "Description", "Amount", "Token", "Status", "Hash", "Error"]

  // Convert transactions to CSV rows
  const rows = transactions.map(tx => {
    const date = new Date(tx.timestamp).toLocaleString()
    const hash = tx.hash || ""
    const error = tx.error || ""

    return [
      date,
      tx.type,
      `"${tx.description.replace(/"/g, '""')}"`, // Escape quotes
      tx.amount,
      tx.token,
      tx.status,
      hash,
      `"${error.replace(/"/g, '""')}"`,
    ].join(",")
  })

  // Combine headers and rows
  const csv = [headers.join(","), ...rows].join("\n")

  // Create blob and download
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" })
  const link = document.createElement("a")
  const url = URL.createObjectURL(blob)

  link.setAttribute("href", url)
  link.setAttribute("download", filename)
  link.style.visibility = "hidden"
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
}

/**
 * Export transactions to JSON format
 */
export function exportToJSON(transactions: Transaction[], filename = "transactions.json") {
  if (transactions.length === 0) {
    alert("No transactions to export")
    return
  }

  // Pretty print JSON
  const json = JSON.stringify(transactions, null, 2)

  // Create blob and download
  const blob = new Blob([json], { type: "application/json;charset=utf-8;" })
  const link = document.createElement("a")
  const url = URL.createObjectURL(blob)

  link.setAttribute("href", url)
  link.setAttribute("download", filename)
  link.style.visibility = "hidden"
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
}

/**
 * Filter transactions by date range
 */
export function filterByDateRange(
  transactions: Transaction[],
  startDate: Date | null,
  endDate: Date | null
): Transaction[] {
  return transactions.filter(tx => {
    const txDate = new Date(tx.timestamp)

    if (startDate && txDate < startDate) return false
    if (endDate && txDate > endDate) return false

    return true
  })
}

/**
 * Get date range for quick filters
 */
export function getDateRanges() {
  const now = new Date()

  return {
    today: {
      start: new Date(now.getFullYear(), now.getMonth(), now.getDate()),
      end: now,
    },
    thisWeek: {
      start: new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000),
      end: now,
    },
    thisMonth: {
      start: new Date(now.getFullYear(), now.getMonth(), 1),
      end: now,
    },
    thisYear: {
      start: new Date(now.getFullYear(), 0, 1),
      end: now,
    },
    all: {
      start: null,
      end: null,
    },
  }
}
