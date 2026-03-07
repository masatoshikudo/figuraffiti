import matplotlib.pyplot as plt
import matplotlib.patches as mpatches
import numpy as np
import japanize_matplotlib

# ===================================================
# Figuraffiti 3ヵ年 キャッシュフロー シミュレーション
# 自己資金: 300万円
# ===================================================

# --- 前提条件 ---
# 単位: 万円

# ---- Year 1 (Phase 1: プロトタイピング & 初期バズ) ----
# 収入
y1_equity       = 300   # 自己資金
y1_loan         = 500   # 日本政策金融公庫「新事業活動促進資金」
y1_subsidy_in   = 0     # 補助金入金(Year1は交付決定のみ、入金はYear2)
y1_sales        = 80    # 売上(フィギュア試作販売・SNS収益)

# 支出
y1_equipment    = 300   # 3Dプリンター等設備費(補助金対象)
y1_system       = 200   # Web/アプリ初期開発費(補助金対象)
y1_production   = 80    # フィギュア制作・設置費
y1_sns          = 100   # SNS広告・コンテンツ制作費(補助金対象)
y1_misc         = 80    # 諸経費(交通費・材料費・専門家費等)
y1_loan_repay   = 60    # 融資返済(年間)

y1_total_in  = y1_equity + y1_loan + y1_subsidy_in + y1_sales
y1_total_out = y1_equipment + y1_system + y1_production + y1_sns + y1_misc + y1_loan_repay
y1_net       = y1_total_in - y1_total_out
# 補助金: 中小企業新事業進出補助金 (設備+システム+広告の1/2)
y1_subsidy_approved = int((y1_equipment + y1_system + y1_sns) * 0.5)  # 300万円

# ---- Year 2 (Phase 2: コミュニティ形成 & マネタイズ) ----
# 収入
y2_subsidy_in   = y1_subsidy_approved  # Year1分の補助金入金 300万円
y2_sales        = 400   # フィギュア販売・EC・イベント売上
y2_grant_in     = 100   # 展示会出展助成プラス(上限150万×2/3=100万)
y2_loan         = 0     # 追加融資なし

# 支出
y2_production   = 200   # フィギュア量産・設置拡大費
y2_app          = 150   # アプリ改修・コミュニティ機能開発
y2_ec           = 80    # EC構築・運営費(持続化補助金対象)
y2_event        = 150   # 展示会出展費(助成金対象)
y2_personnel    = 200   # 人件費(パート・業務委託)
y2_misc         = 80    # 諸経費
y2_loan_repay   = 60    # 融資返済(年間)

y2_total_in  = y2_subsidy_in + y2_sales + y2_grant_in + y2_loan
y2_total_out = y2_production + y2_app + y2_ec + y2_event + y2_personnel + y2_misc + y2_loan_repay
y2_net       = y2_total_in - y2_total_out
# 補助金: 持続化補助金(EC構築等 上限200万×2/3)
y2_subsidy_approved = int(y2_ec * (2/3))  # 53万円

# ---- Year 3 (Phase 3: IPビジネス本格展開) ----
# 収入
y3_subsidy_in   = y2_subsidy_approved  # Year2分の補助金入金 53万円
y3_sales        = 900   # フィギュア販売・コラボ・ライセンス収入
y3_buy_tokyo    = 300   # Buy TOKYO補助金(上限1000万×2/3 → 今期分300万)
y3_loan         = 0

# 支出
y3_production   = 250   # フィギュア量産・新キャラ開発
y3_collab       = 200   # コラボ・ライセンス管理費
y3_marketing    = 300   # 大規模プロモーション・海外展開準備
y3_personnel    = 300   # 人件費(正社員採用)
y3_misc         = 100   # 諸経費
y3_loan_repay   = 60    # 融資返済(年間)

y3_total_in  = y3_subsidy_in + y3_sales + y3_buy_tokyo + y3_loan
y3_total_out = y3_production + y3_collab + y3_marketing + y3_personnel + y3_misc + y3_loan_repay
y3_net       = y3_total_in - y3_total_out

# ---- 累積キャッシュ残高 ----
# Year0 = 自己資金300万円スタート
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

ACCENT   = '#00FF88'   # グリーン
INCOME   = '#4FC3F7'   # ブルー
EXPENSE  = '#FF6B6B'   # レッド
SUBSIDY  = '#FFD54F'   # イエロー
LOAN     = '#CE93D8'   # パープル
NEUTRAL  = '#B0BEC5'   # グレー
CASH     = '#00FF88'   # キャッシュ残高

years = ['Year 1\n(Phase 1)', 'Year 2\n(Phase 2)', 'Year 3\n(Phase 3)']

# ---- グラフ1: 収入内訳（積み上げ棒グラフ） ----
ax1 = axes[0, 0]

sales_vals    = [y1_sales, y2_sales, y3_sales]
loan_vals     = [y1_loan, y2_loan, y3_loan]
subsidy_vals  = [y1_subsidy_in, y2_subsidy_in + y2_grant_in, y3_subsidy_in + y3_buy_tokyo]
equity_vals   = [y1_equity, 0, 0]

x = np.arange(len(years))
width = 0.5

b1 = ax1.bar(x, equity_vals, width, label='自己資金', color='#78909C')
b2 = ax1.bar(x, loan_vals, width, bottom=equity_vals, label='融資', color=LOAN)
b3 = ax1.bar(x, subsidy_vals, width,
             bottom=[equity_vals[i]+loan_vals[i] for i in range(3)],
             label='補助金・助成金', color=SUBSIDY)
b4 = ax1.bar(x, sales_vals, width,
             bottom=[equity_vals[i]+loan_vals[i]+subsidy_vals[i] for i in range(3)],
             label='売上', color=INCOME)

totals_in = [y1_total_in, y2_total_in, y3_total_in]
for i, v in enumerate(totals_in):
    ax1.text(i, v + 15, f'¥{v}万', ha='center', va='bottom',
             color='white', fontsize=11, fontweight='bold')

ax1.set_title('収入内訳（万円）', color='white', fontsize=13, pad=10)
ax1.set_xticks(x)
ax1.set_xticklabels(years, color=NEUTRAL)
ax1.tick_params(colors=NEUTRAL)
ax1.spines['bottom'].set_color('#444')
ax1.spines['left'].set_color('#444')
ax1.spines['top'].set_visible(False)
ax1.spines['right'].set_visible(False)
ax1.yaxis.label.set_color(NEUTRAL)
ax1.set_ylabel('万円', color=NEUTRAL)
ax1.legend(loc='upper left', facecolor='#2a2a2a', labelcolor='white', fontsize=9)
ax1.set_ylim(0, max(totals_in) * 1.2)
ax1.yaxis.set_tick_params(labelcolor=NEUTRAL)

# ---- グラフ2: 支出内訳（積み上げ棒グラフ） ----
ax2 = axes[0, 1]

equip_vals     = [y1_equipment, 0, 0]
system_vals    = [y1_system, y2_app, 0]
prod_vals      = [y1_production, y2_production, y3_production]
mkt_vals       = [y1_sns, y2_event + y2_ec, y3_marketing + y3_collab]
person_vals    = [0, y2_personnel, y3_personnel]
misc_vals      = [y1_misc + y1_loan_repay, y2_misc + y2_loan_repay, y3_misc + y3_loan_repay]

b1 = ax2.bar(x, equip_vals, width, label='設備費', color='#EF9A9A')
b2 = ax2.bar(x, system_vals, width, bottom=equip_vals, label='システム開発費', color='#FFCC80')
b3 = ax2.bar(x, prod_vals, width,
             bottom=[equip_vals[i]+system_vals[i] for i in range(3)],
             label='制作・設置費', color='#A5D6A7')
b4 = ax2.bar(x, mkt_vals, width,
             bottom=[equip_vals[i]+system_vals[i]+prod_vals[i] for i in range(3)],
             label='マーケ・販促費', color=INCOME)
b5 = ax2.bar(x, person_vals, width,
             bottom=[equip_vals[i]+system_vals[i]+prod_vals[i]+mkt_vals[i] for i in range(3)],
             label='人件費', color=LOAN)
b6 = ax2.bar(x, misc_vals, width,
             bottom=[equip_vals[i]+system_vals[i]+prod_vals[i]+mkt_vals[i]+person_vals[i] for i in range(3)],
             label='諸経費・返済', color='#546E7A')

totals_out = [y1_total_out, y2_total_out, y3_total_out]
for i, v in enumerate(totals_out):
    ax2.text(i, v + 15, f'¥{v}万', ha='center', va='bottom',
             color='white', fontsize=11, fontweight='bold')

ax2.set_title('支出内訳（万円）', color='white', fontsize=13, pad=10)
ax2.set_xticks(x)
ax2.set_xticklabels(years, color=NEUTRAL)
ax2.tick_params(colors=NEUTRAL)
ax2.spines['bottom'].set_color('#444')
ax2.spines['left'].set_color('#444')
ax2.spines['top'].set_visible(False)
ax2.spines['right'].set_visible(False)
ax2.set_ylabel('万円', color=NEUTRAL)
ax2.legend(loc='upper left', facecolor='#2a2a2a', labelcolor='white', fontsize=9)
ax2.set_ylim(0, max(totals_out) * 1.2)
ax2.yaxis.set_tick_params(labelcolor=NEUTRAL)

# ---- グラフ3: 単年収支（収入 vs 支出） ----
ax3 = axes[1, 0]

bar_width = 0.35
x_in  = x - bar_width/2
x_out = x + bar_width/2

bars_in  = ax3.bar(x_in,  totals_in,  bar_width, label='総収入', color=INCOME, alpha=0.9)
bars_out = ax3.bar(x_out, totals_out, bar_width, label='総支出', color=EXPENSE, alpha=0.9)

nets = [y1_net, y2_net, y3_net]
for i, (n, ti, to) in enumerate(zip(nets, totals_in, totals_out)):
    color = ACCENT if n >= 0 else '#FF6B6B'
    sign  = '+' if n >= 0 else ''
    ax3.text(i, max(ti, to) + 20, f'{sign}{n}万', ha='center', va='bottom',
             color=color, fontsize=12, fontweight='bold')

ax3.set_title('単年収支（万円）', color='white', fontsize=13, pad=10)
ax3.set_xticks(x)
ax3.set_xticklabels(years, color=NEUTRAL)
ax3.tick_params(colors=NEUTRAL)
ax3.spines['bottom'].set_color('#444')
ax3.spines['left'].set_color('#444')
ax3.spines['top'].set_visible(False)
ax3.spines['right'].set_visible(False)
ax3.set_ylabel('万円', color=NEUTRAL)
ax3.legend(facecolor='#2a2a2a', labelcolor='white', fontsize=10)
ax3.set_ylim(0, max(max(totals_in), max(totals_out)) * 1.25)
ax3.yaxis.set_tick_params(labelcolor=NEUTRAL)

# ---- グラフ4: 累積キャッシュ残高推移 ----
ax4 = axes[1, 1]

cash_points = [cash_start, cash_y1, cash_y2, cash_y3]
x_cash = [0, 1, 2, 3]
x_labels = ['Start\n(自己資金)', 'Year 1末', 'Year 2末', 'Year 3末']

ax4.plot(x_cash, cash_points, color=ACCENT, linewidth=3, marker='o',
         markersize=10, markerfacecolor='white', markeredgecolor=ACCENT, markeredgewidth=2, zorder=5)
ax4.fill_between(x_cash, cash_points, alpha=0.15, color=ACCENT)

# 危険水域ライン
ax4.axhline(y=0, color=EXPENSE, linewidth=1.5, linestyle='--', alpha=0.7, label='キャッシュゼロライン')
ax4.axhline(y=100, color=SUBSIDY, linewidth=1, linestyle=':', alpha=0.5, label='安全水域（100万円）')

for xi, yi in zip(x_cash, cash_points):
    color = ACCENT if yi >= 100 else (SUBSIDY if yi >= 0 else EXPENSE)
    ax4.annotate(f'¥{yi}万', (xi, yi),
                 textcoords='offset points', xytext=(0, 15),
                 ha='center', color=color, fontsize=12, fontweight='bold')

ax4.set_title('累積キャッシュ残高推移（万円）', color='white', fontsize=13, pad=10)
ax4.set_xticks(x_cash)
ax4.set_xticklabels(x_labels, color=NEUTRAL)
ax4.tick_params(colors=NEUTRAL)
ax4.spines['bottom'].set_color('#444')
ax4.spines['left'].set_color('#444')
ax4.spines['top'].set_visible(False)
ax4.spines['right'].set_visible(False)
ax4.set_ylabel('万円', color=NEUTRAL)
ax4.legend(facecolor='#2a2a2a', labelcolor='white', fontsize=9)
ax4.yaxis.set_tick_params(labelcolor=NEUTRAL)
min_cash = min(cash_points)
ax4.set_ylim(min_cash - 100, max(cash_points) * 1.2)

# ---- タイトル ----
fig.suptitle('Figuraffiti 3ヵ年 キャッシュフロー計画（自己資金300万円スタート）',
             color='white', fontsize=16, fontweight='bold', y=0.98)

plt.tight_layout(rect=[0, 0, 1, 0.96])
plt.savefig('/home/ubuntu/figuraffiti_cf/cf_chart.png', dpi=150, bbox_inches='tight',
            facecolor='#0f0f0f')
plt.close()

# ---- サマリー出力 ----
print("=== Figuraffiti 3ヵ年 CF サマリー ===")
print(f"自己資金スタート: {cash_start}万円")
print()
print(f"[Year 1] 総収入: {y1_total_in}万 / 総支出: {y1_total_out}万 / 単年収支: {y1_net:+}万 / 残高: {cash_y1}万")
print(f"  ├ 融資(日本公庫): {y1_loan}万")
print(f"  └ 補助金交付決定額(翌年入金): {y1_subsidy_approved}万")
print()
print(f"[Year 2] 総収入: {y2_total_in}万 / 総支出: {y2_total_out}万 / 単年収支: {y2_net:+}万 / 残高: {cash_y2}万")
print(f"  ├ 補助金入金(Year1分): {y2_subsidy_in}万")
print(f"  ├ 展示会出展助成プラス: {y2_grant_in}万")
print(f"  └ 持続化補助金交付決定額(翌年入金): {y2_subsidy_approved}万")
print()
print(f"[Year 3] 総収入: {y3_total_in}万 / 総支出: {y3_total_out}万 / 単年収支: {y3_net:+}万 / 残高: {cash_y3}万")
print(f"  └ Buy TOKYO補助金: {y3_buy_tokyo}万")
print()
print(f"3年間累積補助金・助成金総額: {y1_subsidy_approved + y2_grant_in + y2_subsidy_approved + y3_buy_tokyo + y3_subsidy_in}万円")
print(f"3年間累積融資総額: {y1_loan}万円")
print(f"3年末キャッシュ残高: {cash_y3}万円")
