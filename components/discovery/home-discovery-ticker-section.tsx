"use client"

import { DiscoveryTicker } from "@/components/discovery/discovery-ticker"
import { useTicker } from "@/hooks/use-ticker"

export function HomeDiscoveryTickerSection() {
  const { items, isLoading } = useTicker()

  return (
    <section className="w-full py-3">
      <div className="w-full">
        <DiscoveryTicker
          items={items}
          isLoading={isLoading}
          className="w-full border-0 bg-transparent shadow-none backdrop-blur-none"
        />
      </div>
    </section>
  )
}
