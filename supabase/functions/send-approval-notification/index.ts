import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2"

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
}

serve(async (req) => {
  // CORS preflight request
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders })
  }

  try {
    const { spotId, spotName, userId, type } = await req.json()

    if (!spotId || !spotName || !userId || type !== "approved") {
      return new Response(
        JSON.stringify({ error: "Missing required fields" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      )
    }

    // Supabaseクライアントを作成
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    )

    // ユーザー情報を取得
    const { data: userData, error: userError } = await supabaseClient.auth.admin.getUserById(userId)

    if (userError || !userData?.user?.email) {
      console.error("Error fetching user:", userError)
      return new Response(
        JSON.stringify({ error: "User not found or email not available" }),
        { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      )
    }

    const userEmail = userData.user.email

    // メール送信（Supabaseのメール機能を使用）
    // 注意: Supabaseのメール機能を有効にする必要があります
    // または、SendGrid、Resendなどの外部サービスを使用することも可能です

    // ここではSupabaseのメール機能を使用する例を示します
    // 実際の実装では、Supabaseのメール設定が必要です
    const { error: emailError } = await supabaseClient.functions.invoke("send-email", {
      body: {
        to: userEmail,
        subject: "スポットが承認されました",
        html: `
          <h2>スポットが承認されました</h2>
          <p>あなたが投稿したスポット「${spotName}」が承認されました。</p>
          <p>承認日時: ${new Date().toLocaleString("ja-JP")}</p>
          <p>スポットID: ${spotId}</p>
          <p>ありがとうございます！</p>
        `,
      },
    })

    if (emailError) {
      console.error("Error sending email:", emailError)
      // メール送信エラーは致命的ではないので、続行
    }

    return new Response(
      JSON.stringify({ success: true, message: "Notification sent" }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    )
  } catch (error) {
    console.error("Error:", error)
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    )
  }
})

