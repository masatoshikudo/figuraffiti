import matplotlib.pyplot as plt
import matplotlib.patches as mpatches
import numpy as np
import japanize_matplotlib

# ===================================================
# Figuraffiti 3ヵ年 キャッシュフロー シミュレーション v2
# 実態反映版
#
# 変更点（旧→新）:
#   3Dプリンター: 300万(新規) → 80万(追加2台)  ※1台購入済み
#   アプリ開発:   200万(外注) → 0万            ※自前実装済み
#   事務所賃料:   計上なし    → 15万/月×12=180万 ※新規追加
#   サーバー等:   計上なし    → 1万/月×12=12万   ※新規追加
#   SNS運用:      計上なし    → 外注30万/月×6=180万(前半のみ外注)
#   コンテンツツール: 計上なし → 1.5万/月×12=18万
#   インフルエンサー: 計上なし → 10万×3回=30万
# ===================================================

# 単位: 万円

# ---- Year 1 (Phase 1: プロトタイピング & 初期バズ) ----
# 収入
y1_equity       = 300   # 自己資金
y1_loan         = 500   # 日本政策金融公庫「新事業活動促進資金」
y1_subsidy_in   = 0     # 補助金入金(Year1は交付決定のみ)
y1_sales        = 80    # 売上(フィギュア試作販売・SNS収益)

# 支出
y1_printer      = 80    # 3Dプリンター追加2台(1台40万×2) ※補助金対象
y1_office_init  = 30    # 事務所初期費用(敷礼金等) ※補助金対象外
y1_office_rent  = 180   # 事務所賃料 15万/月×12 ※補助金対象外
y1_server       = 12    # サーバー・クラウド・API 1万/月×12
y1_production   = 80    # フィギュア制作・材料費・設置費
y1_sns_ad       = 100   # SNS広告費 ※補助金対象
y1_sns_ops      = 180   # SNS運用外注費 30万/月×6ヶ月(前半) ※補助金対象
y1_tools        = 18    # コンテンツ制作ツール 1.5万/月×12
y1_influencer   = 30    # インフルエンサー依頼費 10万×3回 ※補助金対象
y1_misc         = 60    # 諸経費(交通費・材料費・専門家費等)
y1_loan_repay   = 60    # 融資返済(年間)

y1_total_in  = y1_equity + y1_loan + y1_subsidy_in + y1_sales
y1_total_out = (y1_printer + y1_office_init + y1_office_rent + y1_server +
                y1_production + y1_sns_ad + y1_sns_ops + y1_tools +
                y1_influencer + y1_misc + y1_loan_repay)
y1_net       = y1_total_in - y1_total_out

# 補助金対象経費: プリンター+SNS広告+SNS運用外注+インフルエンサー
y1_subsidy_eligible  = y1_printer + y1_sns_ad + y1_sns_ops + y1_influencer
y1_subsidy_approved  = int(y1_subsidy_eligible * 0.5)  # 補助率1/2

# ---- Year 2 (Phase 2: コミュニティ形成 & マネタイズ) ----
# 収入
y2_subsidy_in   = y1_subsidy_approved  # Year1補助金入金
y2_sales        = 400   # フィギュア販売・EC・イベント売上
y2_grant_in     = 100   # 展示会出展助成プラス
y2_loan         = 0

# 支出
y2_office_rent  = 180   # 事務所賃料 15万/月×12
y2_server       = 12    # サーバー・クラウド・API
y2_production   = 200   # フィギュア量産・設置拡大費
y2_app_improve  = 60    # アプリ改修費(自前+外部API連携等)
y2_ec           = 50    # EC構築・運営費 ※持続化補助金対象
y2_event        = 150   # 展示会出展費(助成金対象)
y2_sns_ad       = 120   # SNS広告費
y2_sns_ops      = 0     # SNS運用は内製化(Year2から)
y2_tools        = 18    # コンテンツ制作ツール
y2_influencer   = 20    # インフルエンサー 10万×2回
y2_personnel    = 120   # 人件費(パート・業務委託)
y2_misc         = 70    # 諸経費
y2_loan_repay   = 60    # 融資返済

y2_total_in  = y2_subsidy_in + y2_sales + y2_grant_in + y2_loan
y2_total_out = (y2_office_rent + y2_server + y2_production + y2_app_improve +
                y2_ec + y2_event + y2_sns_ad + y2_sns_ops + y2_tools +
                y2_influencer + y2_personnel + y2_misc + y2_loan_repay)
y2_net       = y2_total_in - y2_total_out

# 持続化補助金(EC構築等 上限200万×2/3)
y2_subsidy_approved = int(y2_ec * (2/3))  # 33万円

# ---- Year 3 (Phase 3: IPビジネス本格展開) ----
# 収入
y3_subsidy_in   = y2_subsidy_approved  # Year2補助金入金
y3_sales        = 900   # フィギュア販売・コラボ・ライセンス収入
y3_buy_tokyo    = 300   # Buy TOKYO補助金
y3_loan         = 0

# 支出
y3_office_rent  = 180   # 事務所賃料
y3_server       = 24    # サーバー費(拡張)
y3_production   = 250   # フィギュア量産・新キャラ開発
y3_collab       = 200   # コラボ・ライセンス管理費
y3_marketing    = 200   # 大規模プロモーション・海外展開準備
y3_sns_ad       = 100   # SNS広告費
y3_tools        = 18    # コンテンツ制作ツール
y3_influencer   = 30    # インフルエンサー 10万×3回
y3_personnel    = 300   # 人件費(正社員採用)
y3_misc         = 80    # 諸経費
y3_loan_repay   = 60    # 融資返済

y3_total_in  = y3_subsidy_in + y3_sales + y3_buy_tokyo + y3_loan
y3_total_out = (y3_office_rent + y3_server + y3_production + y3_collab +
                y3_marketing + y3_sns_ad + y3_tools + y3_influencer +
                y3_personnel + y3_misc + y3_loan_repay)
y3_net       = y3_total_in - y3_total_out

# ---- 累積キャッシュ残高 ----
cash_start = 300
cash_y1 = cash_start + y1_net
cash_y2 = cash_y1 + y2_net
cash_y3 = cash_y2 + y3_net

# ===================================================
# 可視化
# ===================================================
fig, axes = plt.subplots(2, 2, figsize=(16, 12))
fig.patch.set_facecolor('#0f0f0f')
for ax in axes.flat:
    ax.set_facecolor('#1a1a1a')

ACCENT  = '#00FF88'
INCOME  = '#4FC3F7'
EXPENSE = '#FF6B6B'
SUBSIDY = '#FFD54F'
LOAN    = '#CE93D8'
NEUTRAL = '#B0BEC5'

years = ['Year 1\n(Phase 1)', 'Year 2\n(Phase 2)', 'Year 3\n(Phase 3)']
x = np.arange(len(years))
width = 0.5

# ---- グラフ1: 収入内訳 ----
ax1 = axes[0, 0]
equity_vals  = [y1_equity, 0, 0]
loan_vals    = [y1_loan, 0, 0]
subsidy_vals = [0, y2_subsidy_in + y2_grant_in, y3_subsidy_in + y3_buy_tokyo]
sales_vals   = [y1_sales, y2_sales, y3_sales]

ax1.bar(x, equity_vals, width, label='自己資金', color='#78909C')
ax1.bar(x, loan_vals, width, bottom=equity_vals, label='融資', color=LOAN)
ax1.bar(x, subsidy_vals, width,
        bottom=[equity_vals[i]+loan_vals[i] for i in range(3)],
        label='補助金・助成金', color=SUBSIDY)
ax1.bar(x, sales_vals, width,
        bottom=[equity_vals[i]+loan_vals[i]+subsidy_vals[i] for i in range(3)],
        label='売上', color=INCOME)

totals_in = [y1_total_in, y2_total_in, y3_total_in]
for i, v in enumerate(totals_in):
    ax1.text(i, v + 15, f'¥{v}万', ha='center', va='bottom',
             color='white', fontsize=11, fontweight='bold')

ax1.set_title('収入内訳（万円）', color='white', fontsize=13, pad=10)
ax1.set_xticks(x); ax1.set_xticklabels(years, color=NEUTRAL)
ax1.tick_params(colors=NEUTRAL)
for sp in ['top','right']: ax1.spines[sp].set_visible(False)
for sp in ['bottom','left']: ax1.spines[sp].set_color('#444')
ax1.set_ylabel('万円', color=NEUTRAL); ax1.yaxis.set_tick_params(labelcolor=NEUTRAL)
ax1.legend(loc='upper left', facecolor='#2a2a2a', labelcolor='white', fontsize=9)
ax1.set_ylim(0, max(totals_in) * 1.2)

# ---- グラフ2: 支出内訳 ----
ax2 = axes[0, 1]

# 支出カテゴリ集計
office_vals  = [y1_office_rent + y1_office_init, y2_office_rent, y3_office_rent]
server_vals  = [y1_server, y2_server, y3_server]
prod_vals    = [y1_production, y2_production + y2_app_improve + y2_ec, y3_production]
mkt_vals     = [y1_sns_ad + y1_sns_ops + y1_influencer + y1_tools,
                y2_sns_ad + y2_influencer + y2_tools + y2_event,
                y3_marketing + y3_sns_ad + y3_influencer + y3_tools + y3_collab]
person_vals  = [0, y2_personnel, y3_personnel]
misc_vals    = [y1_misc + y1_loan_repay, y2_misc + y2_loan_repay, y3_misc + y3_loan_repay]

ax2.bar(x, office_vals, width, label='事務所賃料', color='#EF9A9A')
ax2.bar(x, server_vals, width, bottom=office_vals, label='サーバー・ツール', color='#FFCC80')
ax2.bar(x, prod_vals, width,
        bottom=[office_vals[i]+server_vals[i] for i in range(3)],
        label='制作・設置費', color='#A5D6A7')
ax2.bar(x, mkt_vals, width,
        bottom=[office_vals[i]+server_vals[i]+prod_vals[i] for i in range(3)],
        label='マーケ・SNS・販促費', color=INCOME)
ax2.bar(x, person_vals, width,
        bottom=[office_vals[i]+server_vals[i]+prod_vals[i]+mkt_vals[i] for i in range(3)],
        label='人件費', color=LOAN)
ax2.bar(x, misc_vals, width,
        bottom=[office_vals[i]+server_vals[i]+prod_vals[i]+mkt_vals[i]+person_vals[i] for i in range(3)],
        label='諸経費・返済', color='#546E7A')

totals_out = [y1_total_out, y2_total_out, y3_total_out]
for i, v in enumerate(totals_out):
    ax2.text(i, v + 15, f'¥{v}万', ha='center', va='bottom',
             color='white', fontsize=11, fontweight='bold')

ax2.set_title('支出内訳（万円）', color='white', fontsize=13, pad=10)
ax2.set_xticks(x); ax2.set_xticklabels(years, color=NEUTRAL)
ax2.tick_params(colors=NEUTRAL)
for sp in ['top','right']: ax2.spines[sp].set_visible(False)
for sp in ['bottom','left']: ax2.spines[sp].set_color('#444')
ax2.set_ylabel('万円', color=NEUTRAL); ax2.yaxis.set_tick_params(labelcolor=NEUTRAL)
ax2.legend(loc='upper left', facecolor='#2a2a2a', labelcolor='white', fontsize=9)
ax2.set_ylim(0, max(totals_out) * 1.2)

# ---- グラフ3: 単年収支 ----
ax3 = axes[1, 0]
bw = 0.35
bars_in  = ax3.bar(x - bw/2, totals_in,  bw, label='総収入', color=INCOME, alpha=0.9)
bars_out = ax3.bar(x + bw/2, totals_out, bw, label='総支出', color=EXPENSE, alpha=0.9)

nets = [y1_net, y2_net, y3_net]
for i, (n, ti, to) in enumerate(zip(nets, totals_in, totals_out)):
    color = ACCENT if n >= 0 else EXPENSE
    sign  = '+' if n >= 0 else ''
    ax3.text(i, max(ti, to) + 20, f'{sign}{n}万', ha='center', va='bottom',
             color=color, fontsize=12, fontweight='bold')

ax3.set_title('単年収支（万円）', color='white', fontsize=13, pad=10)
ax3.set_xticks(x); ax3.set_xticklabels(years, color=NEUTRAL)
ax3.tick_params(colors=NEUTRAL)
for sp in ['top','right']: ax3.spines[sp].set_visible(False)
for sp in ['bottom','left']: ax3.spines[sp].set_color('#444')
ax3.set_ylabel('万円', color=NEUTRAL); ax3.yaxis.set_tick_params(labelcolor=NEUTRAL)
ax3.legend(facecolor='#2a2a2a', labelcolor='white', fontsize=10)
ax3.set_ylim(0, max(max(totals_in), max(totals_out)) * 1.25)

# ---- グラフ4: 累積キャッシュ残高 ----
ax4 = axes[1, 1]
cash_points = [cash_start, cash_y1, cash_y2, cash_y3]
x_cash = [0, 1, 2, 3]
x_labels = ['Start\n(自己資金)', 'Year 1末', 'Year 2末', 'Year 3末']

ax4.plot(x_cash, cash_points, color=ACCENT, linewidth=3, marker='o',
         markersize=10, markerfacecolor='white', markeredgecolor=ACCENT,
         markeredgewidth=2, zorder=5)
ax4.fill_between(x_cash, cash_points, alpha=0.15, color=ACCENT)
ax4.axhline(y=0,   color=EXPENSE, linewidth=1.5, linestyle='--', alpha=0.7, label='キャッシュゼロライン')
ax4.axhline(y=100, color=SUBSIDY, linewidth=1,   linestyle=':',  alpha=0.5, label='安全水域（100万円）')

for xi, yi in zip(x_cash, cash_points):
    color = ACCENT if yi >= 100 else (SUBSIDY if yi >= 0 else EXPENSE)
    ax4.annotate(f'¥{yi}万', (xi, yi),
                 textcoords='offset points', xytext=(0, 15),
                 ha='center', color=color, fontsize=12, fontweight='bold')

ax4.set_title('累積キャッシュ残高推移（万円）', color='white', fontsize=13, pad=10)
ax4.set_xticks(x_cash); ax4.set_xticklabels(x_labels, color=NEUTRAL)
ax4.tick_params(colors=NEUTRAL)
for sp in ['top','right']: ax4.spines[sp].set_visible(False)
for sp in ['bottom','left']: ax4.spines[sp].set_color('#444')
ax4.set_ylabel('万円', color=NEUTRAL); ax4.yaxis.set_tick_params(labelcolor=NEUTRAL)
ax4.legend(facecolor='#2a2a2a', labelcolor='white', fontsize=9)
min_cash = min(cash_points)
ax4.set_ylim(min_cash - 80, max(cash_points) * 1.2)

fig.suptitle('Figuraffiti 3ヵ年 キャッシュフロー計画 v2（実態反映版・自己資金300万円）',
             color='white', fontsize=15, fontweight='bold', y=0.98)

plt.tight_layout(rect=[0, 0, 1, 0.96])
plt.savefig('/home/ubuntu/figuraffiti_cf/cf_chart_v2.png', dpi=150,
            bbox_inches='tight', facecolor='#0f0f0f')
plt.close()

# ---- サマリー出力 ----
print("=== Figuraffiti 3ヵ年 CF サマリー v2（実態反映版）===")
print(f"\n自己資金スタート: {cash_start}万円")
print(f"\n【Year 1 変更点】")
print(f"  3Dプリンター追加(2台): {y1_printer}万 (旧300万→新{y1_printer}万)")
print(f"  アプリ開発費: 0万 (旧200万→自前実装)")
print(f"  事務所賃料+初期費用: {y1_office_rent+y1_office_init}万 (新規追加)")
print(f"  SNS運用外注(6ヶ月): {y1_sns_ops}万 (新規追加)")
print(f"  コンテンツツール: {y1_tools}万 (新規追加)")
print(f"  インフルエンサー: {y1_influencer}万 (新規追加)")
print(f"  サーバー・クラウド: {y1_server}万 (新規追加)")
print()
print(f"[Year 1] 総収入: {y1_total_in}万 / 総支出: {y1_total_out}万 / 単年収支: {y1_net:+}万 / 残高: {cash_y1}万")
print(f"  └ 補助金対象経費: {y1_subsidy_eligible}万 → 交付決定額(翌年入金): {y1_subsidy_approved}万")
print()
print(f"[Year 2] 総収入: {y2_total_in}万 / 総支出: {y2_total_out}万 / 単年収支: {y2_net:+}万 / 残高: {cash_y2}万")
print(f"  ├ 補助金入金(Year1分): {y2_subsidy_in}万")
print(f"  └ 展示会出展助成プラス: {y2_grant_in}万")
print()
print(f"[Year 3] 総収入: {y3_total_in}万 / 総支出: {y3_total_out}万 / 単年収支: {y3_net:+}万 / 残高: {cash_y3}万")
print(f"  └ Buy TOKYO補助金: {y3_buy_tokyo}万")
print()
print(f"3年間累積補助金・助成金総額: {y1_subsidy_approved + y2_grant_in + y2_subsidy_approved + y3_buy_tokyo + y3_subsidy_in}万円")
print(f"3年間累積融資総額: {y1_loan}万円")
print(f"3年末キャッシュ残高: {cash_y3}万円")
print()
print(f"⚠ 最低キャッシュ残高: {min(cash_points)}万円 (Year {['Start','1','2','3'][cash_points.index(min(cash_points))]}末)")
