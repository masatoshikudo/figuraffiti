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
    const { spotId, spotName, submittedBy, submittedByEmail, trickName, mediaUrl } = await req.json()

    if (!spotId || !spotName) {
      return new Response(
        JSON.stringify({ error: "Missing required fields: spotId, spotName" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      )
    }

    // Supabaseクライアントを作成
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    )

    // 管理者のメールアドレスを取得
    const { data: adminUsers, error: adminError } = await supabaseClient
      .from("admin_users")
      .select("user_id")

    if (adminError || !adminUsers || adminUsers.length === 0) {
      console.warn("No admin users found")
      return new Response(
        JSON.stringify({ success: true, message: "No admin users to notify" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      )
    }

    // 各管理者のメールアドレスを取得して通知を送信
    const adminEmails: string[] = []
    for (const adminUser of adminUsers) {
      try {
        const { data: userData, error: userError } = await supabaseClient.auth.admin.getUserById(
          adminUser.user_id
        )

        if (!userError && userData?.user?.email) {
          adminEmails.push(userData.user.email)
        }
      } catch (error) {
        console.error(`Error fetching email for admin user ${adminUser.user_id}:`, error)
      }
    }

    if (adminEmails.length === 0) {
      console.warn("No admin emails found")
      return new Response(
        JSON.stringify({ success: true, message: "No admin emails to notify" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      )
    }

    // 承認ページのURL（環境変数から取得、デフォルトは開発環境）
    const adminUrl = Deno.env.get("ADMIN_URL") || "http://localhost:3000/admin"
    const approvalLink = `${adminUrl}`

    // メール送信（各管理者に送信）
    // Mailgun APIを使用してメールを送信
    const mailgunApiKey = Deno.env.get("MAILGUN_API_KEY")
    const mailgunDomain = Deno.env.get("MAILGUN_DOMAIN")
    const mailgunFromEmail = Deno.env.get("MAILGUN_FROM_EMAIL") || "noreply@skateright.io"

    if (!mailgunApiKey || !mailgunDomain) {
      console.warn("Mailgun API key or domain not configured, skipping email notification")
      // メール送信をスキップしても、成功レスポンスを返す（通知エラーは致命的ではない）
      return new Response(
        JSON.stringify({ 
          success: true, 
          message: "Mailgun not configured, notification skipped",
          adminEmails: adminEmails.length
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      )
    }

    const emailPromises = adminEmails.map(async (email) => {
      try {
        // Mailgun APIを使用してメールを送信
        const mailgunUrl = `https://api.mailgun.net/v3/${mailgunDomain}/messages`
        const formData = new FormData()
        formData.append("from", mailgunFromEmail)
        formData.append("to", email)
        formData.append("subject", "新しい記録が承認待ちです")
        formData.append("html", `
          <h2>新しい記録が承認待ちです</h2>
          <p>新しい記録が投稿され、承認待ちになっています。</p>
          <hr>
          <p><strong>記録情報:</strong></p>
          <ul>
            <li><strong>記録ID:</strong> ${spotId}</li>
            <li><strong>場所:</strong> ${spotName}</li>
            ${trickName ? `<li><strong>技名:</strong> ${trickName}</li>` : ""}
            ${submittedByEmail ? `<li><strong>投稿者:</strong> ${submittedByEmail}</li>` : ""}
            ${mediaUrl ? `<li><strong>メディアURL:</strong> <a href="${mediaUrl}">${mediaUrl}</a></li>` : ""}
            <li><strong>投稿日時:</strong> ${new Date().toLocaleString("ja-JP")}</li>
          </ul>
          <hr>
          <p><a href="${approvalLink}" style="display: inline-block; padding: 10px 20px; background-color: #007bff; color: white; text-decoration: none; border-radius: 5px;">承認ページを開く</a></p>
          <p>承認ページで、この記録を承認または却下できます。</p>
        `)

        const response = await fetch(mailgunUrl, {
          method: "POST",
          headers: {
            Authorization: `Basic ${btoa(`api:${mailgunApiKey}`)}`,
          },
          body: formData,
        })

        if (!response.ok) {
          const errorText = await response.text()
          console.error(`Error sending email to ${email}:`, errorText)
        } else {
          console.log(`Email sent successfully to ${email}`)
        }
      } catch (error) {
        console.error(`Error sending email to ${email}:`, error)
      }
    })

    await Promise.all(emailPromises)

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: "Admin notifications sent",
        adminEmails: adminEmails.length
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    )
  } catch (error) {
    console.error("Error:", error)
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    )
  }
})

