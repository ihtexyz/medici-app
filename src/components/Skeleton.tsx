/**
 * Skeleton Loading Components
 *
 * Provides skeleton screens for various UI elements while data is loading
 */

import './Skeleton.css'

interface SkeletonProps {
  width?: string | number
  height?: string | number
  borderRadius?: string | number
  className?: string
}

/**
 * Base Skeleton - Generic skeleton element
 */
export function Skeleton({
  width = '100%',
  height = '20px',
  borderRadius = '4px',
  className = ''
}: SkeletonProps) {
  return (
    <div
      className={`skeleton ${className}`}
      style={{
        width,
        height,
        borderRadius,
      }}
    />
  )
}

/**
 * Skeleton Card - Full card layout skeleton
 */
export function SkeletonCard() {
  return (
    <div className="skeleton-card">
      <Skeleton height="24px" width="60%" className="mb-3" />
      <Skeleton height="16px" width="80%" className="mb-2" />
      <Skeleton height="16px" width="70%" className="mb-2" />
      <Skeleton height="16px" width="50%" />
    </div>
  )
}

/**
 * Skeleton Balance - For balance display
 */
export function SkeletonBalance() {
  return (
    <div className="skeleton-balance">
      <Skeleton height="14px" width="80px" className="mb-2" />
      <Skeleton height="32px" width="180px" />
    </div>
  )
}

/**
 * Skeleton Stat - For statistics display
 */
export function SkeletonStat() {
  return (
    <div className="skeleton-stat">
      <Skeleton height="14px" width="100px" className="mb-2" />
      <Skeleton height="28px" width="120px" className="mb-1" />
      <Skeleton height="12px" width="90px" />
    </div>
  )
}

/**
 * Skeleton Table Row - For table data
 */
export function SkeletonTableRow({ columns = 4 }: { columns?: number }) {
  return (
    <div className="skeleton-table-row">
      {Array.from({ length: columns }).map((_, index) => (
        <Skeleton key={index} height="16px" className="skeleton-table-cell" />
      ))}
    </div>
  )
}

/**
 * Skeleton Table - Complete table skeleton
 */
export function SkeletonTable({ rows = 5, columns = 4 }: { rows?: number; columns?: number }) {
  return (
    <div className="skeleton-table">
      {/* Header */}
      <div className="skeleton-table-header">
        {Array.from({ length: columns }).map((_, index) => (
          <Skeleton key={index} height="14px" width="80%" className="skeleton-table-cell" />
        ))}
      </div>

      {/* Rows */}
      {Array.from({ length: rows }).map((_, index) => (
        <SkeletonTableRow key={index} columns={columns} />
      ))}
    </div>
  )
}

/**
 * Skeleton Trove Card - For Trove display
 */
export function SkeletonTrove() {
  return (
    <div className="skeleton-trove">
      <div className="skeleton-trove-header">
        <Skeleton height="20px" width="120px" />
        <Skeleton height="32px" width="80px" borderRadius="16px" />
      </div>

      <div className="skeleton-trove-stats">
        <SkeletonStat />
        <SkeletonStat />
        <SkeletonStat />
        <SkeletonStat />
      </div>

      <div className="skeleton-trove-actions">
        <Skeleton height="40px" width="100%" borderRadius="8px" />
      </div>
    </div>
  )
}

/**
 * Skeleton Transaction - For transaction history
 */
export function SkeletonTransaction() {
  return (
    <div className="skeleton-transaction">
      <div className="skeleton-transaction-icon">
        <Skeleton width="40px" height="40px" borderRadius="50%" />
      </div>
      <div className="skeleton-transaction-content">
        <Skeleton height="16px" width="150px" className="mb-2" />
        <Skeleton height="14px" width="100px" />
      </div>
      <div className="skeleton-transaction-amount">
        <Skeleton height="18px" width="100px" className="mb-1" />
        <Skeleton height="12px" width="80px" />
      </div>
    </div>
  )
}

/**
 * Skeleton List - Generic list skeleton
 */
export function SkeletonList({ items = 3 }: { items?: number }) {
  return (
    <div className="skeleton-list">
      {Array.from({ length: items }).map((_, index) => (
        <div key={index} className="skeleton-list-item">
          <Skeleton height="60px" className="mb-2" />
        </div>
      ))}
    </div>
  )
}

/**
 * Skeleton Button - For button loading state
 */
export function SkeletonButton({ width = '120px', height = '40px' }: SkeletonProps) {
  return <Skeleton width={width} height={height} borderRadius="8px" />
}

/**
 * Skeleton Input - For input field
 */
export function SkeletonInput({ width = '100%' }: SkeletonProps) {
  return (
    <div className="skeleton-input-wrapper">
      <Skeleton height="12px" width="80px" className="mb-2" />
      <Skeleton height="48px" width={width} borderRadius="8px" />
    </div>
  )
}

/**
 * Skeleton Page - Full page skeleton
 */
export function SkeletonPage() {
  return (
    <div className="skeleton-page">
      <Skeleton height="40px" width="300px" className="mb-4" />
      <div className="skeleton-page-content">
        <SkeletonCard />
        <SkeletonCard />
        <SkeletonCard />
      </div>
    </div>
  )
}

export default Skeleton
