import { render, screen } from "@testing-library/react"

import App from "../App"

test("Renders main page", () => {
  render(<App />)
  expect(true).toBeTruthy()
})

test("Bottom nav renders Home link", async () => {
  render(<App />)
  const homeLinks = await screen.findAllByText(/Home/i)
  expect(homeLinks.length).toBeGreaterThan(0)
})
