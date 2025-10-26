import { Link, useLocation } from "react-router-dom"

type NavItem = {
  path: string
  label: string
}

const NAV_ITEMS: NavItem[] = [
  { path: "/", label: "Dashboard" },
  { path: "/borrow", label: "Borrow" },
  { path: "/earn", label: "Earn" },
  { path: "/rewards", label: "Rewards" },
  { path: "/bank", label: "Bank" },
  { path: "/swap", label: "Swap" },
  { path: "/portfolio", label: "Portfolio" },
  { path: "/settings", label: "Settings" },
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
