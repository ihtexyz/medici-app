import { Link, useLocation } from "react-router-dom"

type NavItem = {
  path: string
  label: string
}

const NAV_ITEMS: NavItem[] = [
  { path: "/", label: "Overview" },
  { path: "/borrow", label: "Borrow" },
  { path: "/explore", label: "Earn" },
  { path: "/swap", label: "Swap" },
  { path: "/pay", label: "Pay" },
  { path: "/rewards", label: "Rewards" },
]

export default function MobileNav() {
  const location = useLocation()

  return (
    <nav className="mobile-nav">
      {NAV_ITEMS.map((item) => (
        <Link
          key={item.path}
          to={item.path}
          className={location.pathname === item.path ? "active" : ""}
        >
          {item.label}
        </Link>
      ))}
    </nav>
  )
}
