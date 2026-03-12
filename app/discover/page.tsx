import { redirect } from "next/navigation"

type SearchParams = Record<string, string | string[] | undefined>

export default function LegacyDiscoverPage({
  searchParams,
}: {
  searchParams: SearchParams
}) {
  const params = new URLSearchParams()

  for (const [key, value] of Object.entries(searchParams)) {
    if (typeof value === "string") {
      params.set(key, value)
    } else if (Array.isArray(value)) {
      value.forEach((item) => params.append(key, item))
    }
  }

  const query = params.toString()
  redirect(query ? `/discover/nfc?${query}` : "/discover/nfc")
}
