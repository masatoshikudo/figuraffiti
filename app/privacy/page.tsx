import Link from "next/link"

const containerClass = "min-h-screen bg-[#1C1C1C] p-4 py-12"
const wrapperClass = "max-w-3xl mx-auto space-y-8"
const titleClass = "text-4xl font-bold text-[#F5F5F5]"
const subtitleClass = "text-[#AAAAAA] text-sm"
const heading1Class = "text-2xl font-semibold text-[#F5F5F5] mt-10"
const heading2Class = "text-lg font-semibold text-[#E0E0E0] mt-6"
const paraClass = "text-[#CCCCCC] leading-relaxed"
const listClass = "list-disc list-inside text-[#CCCCCC] space-y-1 mt-2"
const noteClass = "text-[#AAAAAA] text-sm italic border-l-2 border-[#444] pl-4 my-4"

export default function PrivacyPage() {
  return (
    <div className={containerClass}>
      <div className={wrapperClass}>
        <div className="mb-8">
          <Link href="/" className="text-muted-foreground hover:text-primary text-sm">
            ← トップへ
          </Link>
        </div>

        <h1 className={titleClass}>AhhHum プライバシーポリシー</h1>
        <p className={subtitleClass}>最終更新日：2025年3月7日</p>
        <p className={noteClass}>
          本ポリシーは Geocaching のプライバシーポリシーを参考に、AhhHum のサービス内容および日本国内での運営に合わせて作成しています。正式公開前に事業者名・連絡先等を実態に合わせて修正し、必要に応じて法務の確認を受けてください。
        </p>

        <section>
          <h2 className={heading1Class}>1. 運営者について</h2>
          <p className={paraClass}>
            AhhHum（当社）は、AhhHum ウェブサイト・アプリ、マップ上のスポット（立体グラフィティ等）の閲覧・投稿・承認、キャラクター（QR・NFC 等）コンテンツを提供する本サービスの運営者です。本サービスは日本国内で運営しており、個人情報の取扱いについては日本の法令（個人情報の保護に関する法律など）に従います。
          </p>
        </section>

        <section>
          <h2 className={heading1Class}>2. 本ポリシーについて</h2>
          <p className={paraClass}>
            本プライバシーポリシーは、本サービスの利用に際して当社が取得・利用・保管・第三者提供等を行う個人情報の種類、利用目的、取扱い方法、お客様の権利について説明するものです。本サービスを利用することにより、本ポリシーに同意したものとみなします。
          </p>
        </section>

        <section>
          <h2 className={heading1Class}>3. 収集する個人情報の種類</h2>
          <p className={paraClass}>本サービスでは、以下のような個人情報を収集・利用する場合があります。</p>
          <ul className={listClass}>
            <li><strong>アカウント・本人識別情報</strong>：メールアドレス、ユーザー名、パスワード、プロバイダー（Google、Apple 等）経由の識別子など</li>
            <li><strong>活動情報</strong>：スポットの投稿・閲覧、投稿した写真・動画・位置、プロフィール設定、ログの日時など</li>
            <li><strong>閲覧・利用状況</strong>：アクセス日時、閲覧ページ、検索履歴、IP アドレス、参照元など</li>
            <li><strong>位置情報</strong>：IP から推定される地域、検索した緯度・経度、端末の位置（許可がある場合）</li>
            <li><strong>デバイス情報</strong>：端末の種類・OS・ブラウザ、識別子、アプリバージョン、クラッシュレポートなど</li>
            <li><strong>連絡先・問い合わせ内容</strong>：お問い合わせ時の氏名、メール、電話、内容</li>
            <li><strong>プロフィール情報</strong>：表示名、アバター、自己紹介、公開する地域など</li>
          </ul>
        </section>

        <section>
          <h2 className={heading1Class}>4. 利用目的</h2>
          <p className={paraClass}>
            当社は、収集した個人情報を、本サービスの提供・アカウント管理・本人確認、スポットの投稿・承認・マップ表示、購入・決済の処理（有料機能がある場合）、会員向け連絡・規約・ポリシー変更の通知、サービス・サイト・アプリの改善・分析、カスタマーサポート、利用規約違反の調査・対応、マーケティング・ニュースレター（同意がある場合）、ログイン連携（Google、Apple 等）、地図・位置に基づく機能の提供などに利用します。法令で認められる範囲で、これらに付随する目的でも利用することがあります。
          </p>
        </section>

        <section>
          <h2 className={heading1Class}>5. 個人情報の第三者提供・委託</h2>
          <h3 className={heading2Class}>第三者への提供</h3>
          <p className={paraClass}>
            当社は、お客様の同意がある場合、法令に基づく場合、生命・身体・財産の保護に必要な場合、合併・事業譲渡等に伴う場合を除き、個人情報を第三者に提供しません。本サービス上で、ユーザー名・プロフィール・投稿内容・活動が他の利用者に表示されることがあります。これは本サービスの機能としての公開・共有です。
          </p>
          <h3 className={heading2Class}>委託</h3>
          <p className={paraClass}>
            本サービスの運営に必要な範囲で、クラウド・認証（例：Supabase）、地図・位置情報（例：Mapbox、Google Maps）、メール送信・分析・サポートツール等の業者に個人情報の処理を委託することがあります。委託先には適切な取扱いを求め、契約で義務づけます。データが日本国外で処理される場合でも、安全管理措置および必要な契約・確認を行います。
          </p>
        </section>

        <section>
          <h2 className={heading1Class}>6. 個人情報の保有期間</h2>
          <p className={paraClass}>
            当社は、利用目的の達成に必要な期間および法令で保存が義務づけられている期間、個人情報を保有します。アカウント削除後も、バックアップ・問い合わせ対応・法令に基づく保存のため一定期間保持することがあり、完全な削除まで最大 30 日程度かかることがあります。アクセスログ・分析データは数ヶ月〜最大 24 ヶ月程度を目安にし、その後は集計・匿名化した形でのみ保持することがあります。
          </p>
        </section>

        <section>
          <h2 className={heading1Class}>7. お客様の権利（開示・訂正・削除・利用停止等）</h2>
          <p className={paraClass}>
            個人情報保護法に基づき、ご本人から、当社の保有する個人データについて、利用目的の通知、開示、訂正・追加・削除、利用停止・消去を請求していただくことができます。請求は本ポリシー末尾の「お問い合わせ」の連絡先で受け付けます。ご本人確認のため、必要な書類・情報の提出をお願いする場合があり、法令に従い合理的な期間内に回答します。マーケティングメール等は、メール内の配信停止リンクまたはアカウント設定からいつでも停止できます。
          </p>
        </section>

        <section>
          <h2 className={heading1Class}>8. Cookie・その他のトラッカー</h2>
          <p className={paraClass}>
            本サービスでは、Cookie、ピクセルタグ、SDK 等を用いて、利用状況・デバイス情報・参照元等を収集することがあります。サイトの動作に必要不可欠なもの、利用状況の分析・サービス改善、広告の配信・効果測定（広告を利用する場合）に利用します。ブラウザの設定で Cookie を無効化できますが、ログインや一部機能が利用できなくなることがあります。第三者（広告・分析事業者）が設置する Cookie については、当該事業者のプライバシーポリシーもご確認ください。
          </p>
        </section>

        <section>
          <h2 className={heading1Class}>9. 個人情報の安全管理</h2>
          <p className={paraClass}>
            当社は、個人情報の漏えい・滅失・毀損の防止のため、アクセス制限、暗号化（通信の TLS 等）、担当者の教育、委託先の監督等、個人情報保護法およびガイドラインに沿った安全管理措置を講じます。パスワードはお客様ご自身で厳重に管理し、第三者に開示しないでください。
          </p>
        </section>

        <section>
          <h2 className={heading1Class}>10. 本ポリシーの変更</h2>
          <p className={paraClass}>
            本プライバシーポリシーは、法令や本サービスの変更等に伴い改定することがあります。重要な変更がある場合は、本サービス上での表示の更新、メール・アプリ内通知等でお知らせします。改定後のポリシーは本ページに掲載した時点から効力を生じます。
          </p>
        </section>

        <section>
          <h2 className={heading1Class}>11. お問い合わせ</h2>
          <p className={paraClass}>
            個人情報の取扱いに関するご質問、開示・訂正・削除・利用停止等のご請求、苦情は、下記のお問い合わせフォームからご連絡ください。入力内容は Google のサービス上で送信・保存され、
            <a
              href="https://policies.google.com/privacy"
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary underline hover:no-underline"
            >
              Google のプライバシーポリシー
            </a>
            が適用されます。
          </p>
          <p className={`${paraClass} mt-4`}>
            <a
              href="https://forms.gle/9BctdNRMvT8kA1MD8"
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary font-medium underline hover:no-underline"
            >
              お問い合わせフォーム（Google フォーム）を開く
            </a>
          </p>
        </section>

        <section>
          <h2 className={heading1Class}>12. 日本国外からのアクセス</h2>
          <p className={paraClass}>
            本サービスは日本国内で運営しています。日本国外からアクセスされる場合でも、本ポリシーおよび日本の個人情報保護法に基づいて取り扱います。お客様の所在地の法令が、開示・削除等についてより有利な権利を定めている場合は、可能な範囲でその権利にも配慮して対応します。
          </p>
        </section>

        <footer className="mt-12 pt-8 border-t border-[#444] text-[#AAAAAA] text-sm flex gap-4">
          <span>© 2025 AhhHum. All rights reserved.</span>
          <Link href="/terms" className="hover:text-primary">利用規約</Link>
          <Link href="/privacy" className="hover:text-primary">プライバシーポリシー</Link>
        </footer>
      </div>
    </div>
  )
}
