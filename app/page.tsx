import { redirect } from "next/navigation"

export default function Home() {
  // トップページは不要なので、マップページにリダイレクト
  redirect("/mapping")
}
