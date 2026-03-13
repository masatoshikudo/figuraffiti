import Image from "next/image"
import Link from "next/link"
import { headers } from "next/headers"
import { SiteHeader } from "@/components/layout/site-header"
import { SiteFooter } from "@/components/layout/site-footer"
import { Button } from "@/components/ui/button"
import { ArrowRight } from "lucide-react"
import { createClient } from "@/lib/supabase/supabase-server"

const DEFAULT_PREFECTURE = "東京都"

const PREFECTURE_BY_REGION_CODE: Record<string, string> = {
  "01": "北海道",
  "02": "青森県",
  "03": "岩手県",
  "04": "宮城県",
  "05": "秋田県",
  "06": "山形県",
  "07": "福島県",
  "08": "茨城県",
  "09": "栃木県",
  "10": "群馬県",
  "11": "埼玉県",
  "12": "千葉県",
  "13": "東京都",
  "14": "神奈川県",
  "15": "新潟県",
  "16": "富山県",
  "17": "石川県",
  "18": "福井県",
  "19": "山梨県",
  "20": "長野県",
  "21": "岐阜県",
  "22": "静岡県",
  "23": "愛知県",
  "24": "三重県",
  "25": "滋賀県",
  "26": "京都府",
  "27": "大阪府",
  "28": "兵庫県",
  "29": "奈良県",
  "30": "和歌山県",
  "31": "鳥取県",
  "32": "島根県",
  "33": "岡山県",
  "34": "広島県",
  "35": "山口県",
  "36": "徳島県",
  "37": "香川県",
  "38": "愛媛県",
  "39": "高知県",
  "40": "福岡県",
  "41": "佐賀県",
  "42": "長崎県",
  "43": "熊本県",
  "44": "大分県",
  "45": "宮崎県",
  "46": "鹿児島県",
  "47": "沖縄県",
} as const

const PREFECTURE_BY_SLUG: Record<string, string> = {
  hokkaido: "北海道",
  aomori: "青森県",
  iwate: "岩手県",
  miyagi: "宮城県",
  akita: "秋田県",
  yamagata: "山形県",
  fukushima: "福島県",
  ibaraki: "茨城県",
  tochigi: "栃木県",
  gunma: "群馬県",
  saitama: "埼玉県",
  chiba: "千葉県",
  tokyo: "東京都",
  kanagawa: "神奈川県",
  niigata: "新潟県",
  toyama: "富山県",
  ishikawa: "石川県",
  fukui: "福井県",
  yamanashi: "山梨県",
  nagano: "長野県",
  gifu: "岐阜県",
  shizuoka: "静岡県",
  aichi: "愛知県",
  mie: "三重県",
  shiga: "滋賀県",
  kyoto: "京都府",
  osaka: "大阪府",
  hyogo: "兵庫県",
  nara: "奈良県",
  wakayama: "和歌山県",
  tottori: "鳥取県",
  shimane: "島根県",
  okayama: "岡山県",
  hiroshima: "広島県",
  yamaguchi: "山口県",
  tokushima: "徳島県",
  kagawa: "香川県",
  ehime: "愛媛県",
  kochi: "高知県",
  fukuoka: "福岡県",
  saga: "佐賀県",
  nagasaki: "長崎県",
  kumamoto: "熊本県",
  oita: "大分県",
  miyazaki: "宮崎県",
  kagoshima: "鹿児島県",
  okinawa: "沖縄県",
} as const

const ahhHumPillars = [
  {
    title: "街にひそんでいる",
    body: "AhhHum は画面の中だけじゃない。ストリートの余白にひそみ、街のどこかでキミを待っている。",
  },
  {
    title: "見つけたら「タッチ」できる",
    body: "フィギュアには NFC タグと QR コードがついている。見つけたキミだけが「タッチ」して、発見を記録できる。",
  },
  {
    title: "いつまでそこにいるかわからない",
    body: "AhhHum は、ずっと同じ場所にいるとは限らない。だからこそ、見つけた瞬間がキミだけの発見になる。",
  },
] as const

const searchSteps = [
  {
    step: "01",
    title: "マップで手がかりを見る",
    body: "正確なピンではなく、サークルやヒントから場所の気配をつかむ。どこにいるかを想像するところから始まる。",
  },
  {
    step: "02",
    title: "街を歩いて探す",
    body: "近くまで来たら、自分の目で周囲を観察する。普段は見過ごす街の余白が、探索の舞台に変わる。",
  },
  {
    step: "03",
    title: "見つけたら次へ進む",
    body: "AhhHum を見つけたら、その場で「タッチ」へ。発見を記録することで、出会った事実が自分のものになる。",
  },
] as const

const touchSteps = [
  "スポットの近くまで行く",
  "QRを読み取る / NFCでタッチする",
  "発見の証を記録する",
] as const

function normalizePrefecture(value: string | null | undefined) {
  if (!value) return null

  const normalized = value.trim()
  if (!normalized) return null

  if (normalized in PREFECTURE_BY_REGION_CODE) {
    return PREFECTURE_BY_REGION_CODE[normalized]
  }

  if (normalized in PREFECTURE_BY_SLUG) {
    return PREFECTURE_BY_SLUG[normalized]
  }

  const lowercase = normalized.toLowerCase()
  if (lowercase in PREFECTURE_BY_SLUG) {
    return PREFECTURE_BY_SLUG[lowercase]
  }

  if (Object.values(PREFECTURE_BY_REGION_CODE).includes(normalized)) {
    return normalized
  }

  return null
}

function getAreaLabel(prefecture: string) {
  return prefecture === "北海道" ? prefecture : prefecture.replace(/(都|道|府|県)$/u, "")
}

async function getUserPrefectureFromHeaders() {
  const headerStore = await headers()
  const country = headerStore.get("x-vercel-ip-country")
  if (country && country !== "JP") {
    return DEFAULT_PREFECTURE
  }

  return (
    normalizePrefecture(headerStore.get("x-vercel-ip-country-region")) ??
    normalizePrefecture(headerStore.get("x-vercel-ip-region")) ??
    DEFAULT_PREFECTURE
  )
}

async function getHomeStats(prefecture: string) {
  try {
    const supabase = await createClient()

    const countSpotsInPrefecture = async (targetPrefecture: string) => {
      const { count } = await supabase
        .from("spots")
        .select("id", { count: "exact", head: true })
        .eq("prefecture", targetPrefecture)
        .or("status.eq.approved,status.is.null")

      return count ?? 0
    }

    const [initialSpotCount, { count: discoveryCount }] = await Promise.all([
      countSpotsInPrefecture(prefecture),
      supabase
        .from("discovery_logs")
        .select("id", { count: "exact", head: true }),
    ])

    const shouldFallbackToTokyo = prefecture !== DEFAULT_PREFECTURE && initialSpotCount === 0
    const effectivePrefecture = shouldFallbackToTokyo ? DEFAULT_PREFECTURE : prefecture
    const localSpotCount = shouldFallbackToTokyo ? await countSpotsInPrefecture(DEFAULT_PREFECTURE) : initialSpotCount

    return {
      prefecture: effectivePrefecture,
      localSpotCount: localSpotCount ?? 0,
      discoveryCount: discoveryCount ?? 0,
    }
  } catch {
    return {
      prefecture: DEFAULT_PREFECTURE,
      localSpotCount: null,
      discoveryCount: null,
    }
  }
}

export default async function Home() {
  const userPrefecture = await getUserPrefectureFromHeaders()
  const { prefecture, localSpotCount, discoveryCount } = await getHomeStats(userPrefecture)
  const areaLabel = getAreaLabel(prefecture)

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <SiteHeader variant="overlay" />
      <main className="flex-1 pt-24">
        <section className="relative overflow-hidden">
          <div className="container mx-auto max-w-5xl px-4 py-16 sm:py-24 lg:min-h-[calc(100vh-6rem)] lg:py-0">
            <div className="grid gap-10 lg:min-h-[calc(100vh-6rem)] lg:grid-cols-[minmax(0,1fr)_minmax(320px,420px)] lg:items-center">
              <div className="space-y-6">
                <div className="space-y-5">
                  <p className="text-sm font-medium uppercase tracking-[0.24em] text-muted-foreground">YOUR MISSION</p>
                  <h1 className="max-w-3xl text-5xl font-bold tracking-tight sm:text-6xl lg:text-7xl">
                    <span className="block">ストリートで</span>
                    <span className="block">AhhHumを</span>
                    <span className="block">探して、</span>
                    <span className="block whitespace-nowrap">
                      <span className="text-brand-strong">
                        <span className="-ml-[0.6em] inline-block">「</span>
                        <span className="inline-block">タッチ</span>
                        <span className="mr-[-0.2em] inline-block">」</span>
                      </span>
                      <span className="-ml-[0.34em] inline-block">しよう</span>
                    </span>
                  </h1>
                  <p className="max-w-xl text-lg leading-8 text-muted-foreground sm:text-xl">
                    いなくなる前に見つけたキミだけが、その証を残せる。
                    <br />
                    がんばって、楽しんで！
                  </p>
                </div>
                <div className="flex flex-col gap-3 sm:flex-row">
                  <Button size="lg" className="h-12 rounded-full px-8 text-base" asChild>
                    <Link href="/discover/mapping">
                      マップで探索を始める
                      <ArrowRight className="h-4 w-4" />
                    </Link>
                  </Button>
                  <Button size="lg" variant="outline" className="h-12 rounded-full border-border/80 bg-background/40 px-8 text-base" asChild>
                    <Link href="/education">遊び方を見る</Link>
                  </Button>
                </div>
                <div className="space-y-2 border-t border-border/70 pt-6">
                  <p className="text-2xl font-semibold tracking-tight sm:text-3xl">
                    {localSpotCount !== null ? (
                      <>
                        {areaLabel}には
                        <span className="px-2 text-brand-strong">{localSpotCount.toLocaleString("ja-JP")}</span>
                        個のスポットがあります。
                      </>
                    ) : (
                      <>{areaLabel}で AhhHum スポットを探せます。</>
                    )}
                  </p>
                  {discoveryCount !== null && discoveryCount > 0 ? (
                    <p className="text-sm leading-6 text-muted-foreground">
                      {areaLabel}で実際に探せるスポットがあり、これまでに {discoveryCount.toLocaleString("ja-JP")} 件の発見が記録されています。
                    </p>
                  ) : (
                    <p className="text-sm leading-6 text-muted-foreground">
                      {areaLabel}で実際に探せます。まずは近くの 1 体から探してみてください。
                    </p>
                  )}
                </div>
              </div>

              <figure className="mx-auto w-full max-w-[360px] space-y-3 lg:mx-0 lg:justify-self-end">
                <div className="overflow-hidden rounded-[1.5rem] bg-black shadow-[0_18px_40px_rgba(28,34,40,0.08)]">
                <video
                  className="aspect-[9/16] h-auto w-full object-cover"
                  autoPlay
                  muted
                  loop
                  playsInline
                  preload="metadata"
                  poster="/ahh-hum-figures.png"
                >
                  <source src="/video_1_e2e864ad14b4469caee7e82180dbd0cd.MP4" type="video/mp4" />
                </video>
                </div>
              </figure>
            </div>
          </div>
        </section>

        <section className="relative overflow-hidden border-y border-border/70 bg-card/35">
          <div className="pointer-events-none absolute inset-y-0 left-0 hidden lg:flex items-center">
            <Image
              src="/Ahh.png"
              alt=""
              aria-hidden="true"
              width={540}
              height={1080}
              className="-translate-x-[46%] h-auto w-[240px] xl:w-[300px]"
            />
          </div>
          <div className="pointer-events-none absolute inset-y-0 right-0 hidden lg:flex items-center">
            <Image
              src="/Hum.png"
              alt=""
              aria-hidden="true"
              width={540}
              height={1080}
              className="translate-x-[46%] h-auto w-[240px] xl:w-[300px]"
            />
          </div>
          <div className="container relative z-10 mx-auto max-w-5xl px-4 py-14 sm:py-16">
            <div className="mx-auto max-w-3xl space-y-8">
              <div className="max-w-2xl space-y-4">
                <p className="text-sm font-medium uppercase tracking-[0.24em] text-brand-strong">What Is AhhHum</p>
                <h2 className="text-3xl font-semibold tracking-tight sm:text-4xl">AhhHumって、なに？</h2>
                <div className="relative min-h-40 lg:hidden">
                  <div className="pointer-events-none absolute bottom-0 -left-4 overflow-hidden h-48 w-[7.5rem] sm:-left-6 sm:h-52 sm:w-36">
                    <Image
                      src="/Ahh.png"
                      alt=""
                      aria-hidden="true"
                      width={120}
                      height={240}
                      className="h-full w-auto max-w-none -translate-x-[44%]"
                    />
                  </div>
                  <div className="pointer-events-none absolute bottom-0 -right-4 overflow-hidden h-48 w-[7.5rem] sm:-right-6 sm:h-52 sm:w-36">
                    <Image
                      src="/Hum.png"
                      alt=""
                      aria-hidden="true"
                      width={120}
                      height={240}
                      className="ml-auto h-full w-auto max-w-none translate-x-[44%]"
                    />
                  </div>
                  <p className="relative z-10 px-10 pt-8 text-sm leading-7 text-muted-foreground sm:px-14">
                    ストリートにひそんでる Ahh（アー） と Hum（ハム） の2種のケモノ。
                  </p>
                </div>
                <p className="hidden text-base leading-7 text-muted-foreground sm:text-lg lg:block">
                  ストリートにひそんでる Ahh（アー） と Hum（ハム） の2種のケモノ。
                </p>
              </div>
              <div className="grid gap-4 md:grid-cols-3">
                {ahhHumPillars.map((pillar) => (
                  <div key={pillar.title} className="rounded-[2rem] border border-border/70 bg-background/75 p-6">
                    <p className="text-sm font-medium uppercase tracking-[0.2em] text-brand-strong">Point</p>
                    <h3 className="mt-4 text-xl font-semibold tracking-tight">{pillar.title}</h3>
                    <p className="mt-3 text-sm leading-7 text-muted-foreground">{pillar.body}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section className="container mx-auto max-w-5xl px-4 py-14 sm:py-16">
          <div className="max-w-2xl space-y-4">
            <p className="text-sm font-medium uppercase tracking-[0.24em] text-brand-strong">Find AhhHum</p>
            <h2 className="text-3xl font-semibold tracking-tight sm:text-4xl">どうやって探す？</h2>
            <p className="text-base leading-7 text-muted-foreground sm:text-lg">
              まずはヒントを見て、次に街を歩いて、自分の目で探す。答えが最初から見えないからこそ、見つけた瞬間がうれしい。
            </p>
          </div>
          <div className="mt-8 grid gap-4 md:grid-cols-3">
            {searchSteps.map((item) => (
              <div key={item.step} className="rounded-[2rem] border border-border/70 bg-card/60 p-6">
                <p className="text-sm font-medium tracking-[0.24em] text-brand-strong">{item.step}</p>
                <h3 className="mt-4 text-xl font-semibold tracking-tight">{item.title}</h3>
                <p className="mt-3 text-sm leading-7 text-muted-foreground">{item.body}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="border-t border-border/70 bg-card/35">
          <div className="container mx-auto max-w-5xl px-4 py-14 sm:py-16">
            <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(280px,360px)] lg:items-center">
              <div className="space-y-4">
                <p className="text-sm font-medium uppercase tracking-[0.24em] text-brand-strong">Touch AhhHum</p>
                <h2 className="text-3xl font-semibold tracking-tight sm:text-4xl">見つけたら「タッチ」しよう</h2>
                <p className="text-base leading-7 text-muted-foreground sm:text-lg">
                  AhhHum を見つけたら、その場で記録へ。フィギュアの QR を読み取るか、対応端末なら NFC でタッチすると、現地で見つけた証が残る。
                </p>
                <div className="flex flex-col gap-3 sm:flex-row">
                  <Button size="lg" className="h-12 rounded-full px-8 text-base" asChild>
                    <Link href="/discover/mapping">
                      マップで探索を始める
                      <ArrowRight className="h-4 w-4" />
                    </Link>
                  </Button>
                  <Button size="lg" variant="outline" className="h-12 rounded-full px-8 text-base" asChild>
                    <Link href="/education">遊び方を見る</Link>
                  </Button>
                </div>
                <p className="text-sm leading-6 text-muted-foreground">
                  スポットや端末に応じて QR / NFC のどちらかで記録できる。見つけた人だけが、発見を自分の履歴として残せる。
                </p>
              </div>
              <div className="rounded-[2rem] border border-border/70 bg-background/80 p-6 sm:p-7">
                <ol className="space-y-4">
                  {touchSteps.map((step, index) => (
                    <li key={step} className="flex gap-4">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-brand/30 bg-brand/10 text-sm font-semibold text-brand-strong">
                        {index + 1}
                      </div>
                      <div className="pt-1">
                        <p className="text-base font-medium tracking-tight">{step}</p>
                      </div>
                    </li>
                  ))}
                </ol>
              </div>
            </div>
          </div>
        </section>
      </main>
      <SiteFooter />
    </div>
  )
}
