import matplotlib.pyplot as plt
import matplotlib.patches as mpatches
import numpy as np
import japanize_matplotlib

# ===================================================
# Figuraffiti 3ヵ年 CF シミュレーション v3
# シナリオA vs シナリオB 比較版
#
# シナリオA: 現状維持（事務所あり・SNS外注6ヶ月）
# シナリオB: コスト最適化（シェアオフィス・SNS外注3ヶ月のみ）
# ===================================================

# 単位: 万円
cash_start = 300

# ============================================================
# シナリオA: 現状維持
# ============================================================
# Year 1
A_y1_equity      = 300
A_y1_loan        = 500
A_y1_sales       = 80
A_y1_printer     = 80    # 3Dプリンター追加2台
A_y1_office_init = 30    # 事務所初期費用
A_y1_office_rent = 180   # 事務所賃料 15万×12
A_y1_server      = 12
A_y1_production  = 80
A_y1_sns_ad      = 100
A_y1_sns_ops     = 180   # SNS外注 30万×6ヶ月
A_y1_tools       = 18
A_y1_influencer  = 30
A_y1_misc        = 60
A_y1_loan_repay  = 60
A_y1_in  = A_y1_equity + A_y1_loan + A_y1_sales
A_y1_out = (A_y1_printer + A_y1_office_init + A_y1_office_rent + A_y1_server +
            A_y1_production + A_y1_sns_ad + A_y1_sns_ops + A_y1_tools +
            A_y1_influencer + A_y1_misc + A_y1_loan_repay)
A_y1_net = A_y1_in - A_y1_out
A_y1_sub = int((A_y1_printer + A_y1_sns_ad + A_y1_sns_ops + A_y1_influencer) * 0.5)

# Year 2
A_y2_sub_in     = A_y1_sub
A_y2_sales      = 400
A_y2_grant      = 100
A_y2_office_rent= 180
A_y2_server     = 12
A_y2_production = 200
A_y2_app        = 60
A_y2_ec         = 50
A_y2_event      = 150
A_y2_sns_ad     = 120
A_y2_tools      = 18
A_y2_influencer = 20
A_y2_personnel  = 120
A_y2_misc       = 70
A_y2_loan_repay = 60
A_y2_in  = A_y2_sub_in + A_y2_sales + A_y2_grant
A_y2_out = (A_y2_office_rent + A_y2_server + A_y2_production + A_y2_app +
            A_y2_ec + A_y2_event + A_y2_sns_ad + A_y2_tools +
            A_y2_influencer + A_y2_personnel + A_y2_misc + A_y2_loan_repay)
A_y2_net = A_y2_in - A_y2_out
A_y2_sub = int(A_y2_ec * (2/3))

# Year 3
A_y3_sub_in     = A_y2_sub
A_y3_sales      = 900
A_y3_buy_tokyo  = 300
A_y3_office_rent= 180
A_y3_server     = 24
A_y3_production = 250
A_y3_collab     = 200
A_y3_marketing  = 200
A_y3_sns_ad     = 100
A_y3_tools      = 18
A_y3_influencer = 30
A_y3_personnel  = 300
A_y3_misc       = 80
A_y3_loan_repay = 60
A_y3_in  = A_y3_sub_in + A_y3_sales + A_y3_buy_tokyo
A_y3_out = (A_y3_office_rent + A_y3_server + A_y3_production + A_y3_collab +
            A_y3_marketing + A_y3_sns_ad + A_y3_tools + A_y3_influencer +
            A_y3_personnel + A_y3_misc + A_y3_loan_repay)
A_y3_net = A_y3_in - A_y3_out

A_cash = [cash_start,
          cash_start + A_y1_net,
          cash_start + A_y1_net + A_y2_net,
          cash_start + A_y1_net + A_y2_net + A_y3_net]
A_nets = [A_y1_net, A_y2_net, A_y3_net]
A_ins  = [A_y1_in, A_y2_in, A_y3_in]
A_outs = [A_y1_out, A_y2_out, A_y3_out]

# ============================================================
# シナリオB: コスト最適化
# ============================================================
# Year 1
B_y1_equity      = 300
B_y1_loan        = 500
B_y1_sales       = 80
B_y1_printer     = 80    # 同じ
B_y1_office_init = 5     # シェアオフィス入会金のみ
B_y1_office_rent = 60    # シェアオフィス 5万/月×12
B_y1_server      = 12
B_y1_production  = 80
B_y1_sns_ad      = 100
B_y1_sns_ops     = 90    # SNS外注 30万×3ヶ月のみ（立ち上げ期集中）
B_y1_tools       = 18
B_y1_influencer  = 30
B_y1_misc        = 60
B_y1_loan_repay  = 60
B_y1_in  = B_y1_equity + B_y1_loan + B_y1_sales
B_y1_out = (B_y1_printer + B_y1_office_init + B_y1_office_rent + B_y1_server +
            B_y1_production + B_y1_sns_ad + B_y1_sns_ops + B_y1_tools +
            B_y1_influencer + B_y1_misc + B_y1_loan_repay)
B_y1_net = B_y1_in - B_y1_out
B_y1_sub = int((B_y1_printer + B_y1_sns_ad + B_y1_sns_ops + B_y1_influencer) * 0.5)

# Year 2
B_y2_sub_in     = B_y1_sub
B_y2_sales      = 400
B_y2_grant      = 100
B_y2_office_rent= 60     # シェアオフィス継続
B_y2_server     = 12
B_y2_production = 200
B_y2_app        = 60
B_y2_ec         = 50
B_y2_event      = 150
B_y2_sns_ad     = 120
B_y2_tools      = 18
B_y2_influencer = 20
B_y2_personnel  = 120
B_y2_misc       = 70
B_y2_loan_repay = 60
B_y2_in  = B_y2_sub_in + B_y2_sales + B_y2_grant
B_y2_out = (B_y2_office_rent + B_y2_server + B_y2_production + B_y2_app +
            B_y2_ec + B_y2_event + B_y2_sns_ad + B_y2_tools +
            B_y2_influencer + B_y2_personnel + B_y2_misc + B_y2_loan_repay)
B_y2_net = B_y2_in - B_y2_out
B_y2_sub = int(B_y2_ec * (2/3))

# Year 3 (Year3は事務所移転を想定。売上が立ったタイミングで固定オフィスへ)
B_y3_sub_in     = B_y2_sub
B_y3_sales      = 900
B_y3_buy_tokyo  = 300
B_y3_office_rent= 120    # 固定オフィス移転 10万/月×12（Year3から）
B_y3_server     = 24
B_y3_production = 250
B_y3_collab     = 200
B_y3_marketing  = 200
B_y3_sns_ad     = 100
B_y3_tools      = 18
B_y3_influencer = 30
B_y3_personnel  = 300
B_y3_misc       = 80
B_y3_loan_repay = 60
B_y3_in  = B_y3_sub_in + B_y3_sales + B_y3_buy_tokyo
B_y3_out = (B_y3_office_rent + B_y3_server + B_y3_production + B_y3_collab +
            B_y3_marketing + B_y3_sns_ad + B_y3_tools + B_y3_influencer +
            B_y3_personnel + B_y3_misc + B_y3_loan_repay)
B_y3_net = B_y3_in - B_y3_out

B_cash = [cash_start,
          cash_start + B_y1_net,
          cash_start + B_y1_net + B_y2_net,
          cash_start + B_y1_net + B_y2_net + B_y3_net]
B_nets = [B_y1_net, B_y2_net, B_y3_net]
B_ins  = [B_y1_in, B_y2_in, B_y3_in]
B_outs = [B_y1_out, B_y2_out, B_y3_out]

# ============================================================
# 可視化
# ============================================================
fig, axes = plt.subplots(2, 2, figsize=(18, 12))
fig.patch.set_facecolor('#0f0f0f')
for ax in axes.flat:
    ax.set_facecolor('#1a1a1a')

ACCENT  = '#00FF88'
RED     = '#FF6B6B'
BLUE    = '#4FC3F7'
YELLOW  = '#FFD54F'
PURPLE  = '#CE93D8'
NEUTRAL = '#B0BEC5'
A_COLOR = '#FF6B6B'   # シナリオA: レッド
B_COLOR = '#00FF88'   # シナリオB: グリーン

years  = ['Year 1', 'Year 2', 'Year 3']
x      = np.arange(len(years))
x_cash = [0, 1, 2, 3]
x_labels_cash = ['Start', 'Year 1末', 'Year 2末', 'Year 3末']

# ---- グラフ1: シナリオA 単年収支 ----
ax1 = axes[0, 0]
bw = 0.35
ax1.bar(x - bw/2, A_ins,  bw, label='総収入', color=BLUE,  alpha=0.85)
ax1.bar(x + bw/2, A_outs, bw, label='総支出', color=A_COLOR, alpha=0.85)
for i, (n, ti, to) in enumerate(zip(A_nets, A_ins, A_outs)):
    color = ACCENT if n >= 0 else RED
    sign  = '+' if n >= 0 else ''
    ax1.text(i, max(ti, to) + 20, f'{sign}{n}万', ha='center', va='bottom',
             color=color, fontsize=12, fontweight='bold')

ax1.set_title('シナリオA：単年収支（現状維持）', color=A_COLOR, fontsize=13, pad=10)
ax1.set_xticks(x); ax1.set_xticklabels(years, color=NEUTRAL)
ax1.tick_params(colors=NEUTRAL)
for sp in ['top','right']: ax1.spines[sp].set_visible(False)
for sp in ['bottom','left']: ax1.spines[sp].set_color('#444')
ax1.set_ylabel('万円', color=NEUTRAL); ax1.yaxis.set_tick_params(labelcolor=NEUTRAL)
ax1.legend(facecolor='#2a2a2a', labelcolor='white', fontsize=10)
ax1.set_ylim(0, max(max(A_ins), max(A_outs)) * 1.25)

# ---- グラフ2: シナリオB 単年収支 ----
ax2 = axes[0, 1]
ax2.bar(x - bw/2, B_ins,  bw, label='総収入', color=BLUE,    alpha=0.85)
ax2.bar(x + bw/2, B_outs, bw, label='総支出', color=B_COLOR, alpha=0.85)
for i, (n, ti, to) in enumerate(zip(B_nets, B_ins, B_outs)):
    color = ACCENT if n >= 0 else RED
    sign  = '+' if n >= 0 else ''
    ax2.text(i, max(ti, to) + 20, f'{sign}{n}万', ha='center', va='bottom',
             color=color, fontsize=12, fontweight='bold')

ax2.set_title('シナリオB：単年収支（コスト最適化）', color=B_COLOR, fontsize=13, pad=10)
ax2.set_xticks(x); ax2.set_xticklabels(years, color=NEUTRAL)
ax2.tick_params(colors=NEUTRAL)
for sp in ['top','right']: ax2.spines[sp].set_visible(False)
for sp in ['bottom','left']: ax2.spines[sp].set_color('#444')
ax2.set_ylabel('万円', color=NEUTRAL); ax2.yaxis.set_tick_params(labelcolor=NEUTRAL)
ax2.legend(facecolor='#2a2a2a', labelcolor='white', fontsize=10)
ax2.set_ylim(0, max(max(B_ins), max(B_outs)) * 1.25)

# ---- グラフ3: コスト差異比較（Year 1） ----
ax3 = axes[1, 0]
categories = ['事務所費用\n(賃料+初期)', 'SNS運用\n外注費', '合計支出']
A_vals = [A_y1_office_rent + A_y1_office_init, A_y1_sns_ops, A_y1_out]
B_vals = [B_y1_office_rent + B_y1_office_init, B_y1_sns_ops, B_y1_out]
diff   = [a - b for a, b in zip(A_vals, B_vals)]

x3 = np.arange(len(categories))
bw3 = 0.28
bars_a = ax3.bar(x3 - bw3, A_vals, bw3, label='シナリオA（現状維持）', color=A_COLOR, alpha=0.85)
bars_b = ax3.bar(x3,       B_vals, bw3, label='シナリオB（最適化）',   color=B_COLOR, alpha=0.85)

for i, (a, b, d) in enumerate(zip(A_vals, B_vals, diff)):
    ax3.text(i - bw3, a + 5, f'{a}万', ha='center', va='bottom', color='white', fontsize=10)
    ax3.text(i,       b + 5, f'{b}万', ha='center', va='bottom', color='white', fontsize=10)
    ax3.text(i + bw3, max(a, b) + 5, f'差:{d}万', ha='center', va='bottom',
             color=YELLOW, fontsize=10, fontweight='bold')

ax3.set_title('Year 1 コスト比較（主要費目）', color='white', fontsize=13, pad=10)
ax3.set_xticks(x3); ax3.set_xticklabels(categories, color=NEUTRAL)
ax3.tick_params(colors=NEUTRAL)
for sp in ['top','right']: ax3.spines[sp].set_visible(False)
for sp in ['bottom','left']: ax3.spines[sp].set_color('#444')
ax3.set_ylabel('万円', color=NEUTRAL); ax3.yaxis.set_tick_params(labelcolor=NEUTRAL)
ax3.legend(facecolor='#2a2a2a', labelcolor='white', fontsize=10)
ax3.set_ylim(0, max(A_vals) * 1.3)

# ---- グラフ4: 累積キャッシュ残高比較 ----
ax4 = axes[1, 1]
ax4.plot(x_cash, A_cash, color=A_COLOR, linewidth=3, marker='o',
         markersize=10, markerfacecolor='white', markeredgecolor=A_COLOR,
         markeredgewidth=2, zorder=5, label='シナリオA（現状維持）')
ax4.plot(x_cash, B_cash, color=B_COLOR, linewidth=3, marker='s',
         markersize=10, markerfacecolor='white', markeredgecolor=B_COLOR,
         markeredgewidth=2, zorder=5, label='シナリオB（コスト最適化）')
ax4.fill_between(x_cash, A_cash, alpha=0.08, color=A_COLOR)
ax4.fill_between(x_cash, B_cash, alpha=0.08, color=B_COLOR)
ax4.axhline(y=0,   color='white', linewidth=1.5, linestyle='--', alpha=0.5, label='キャッシュゼロライン')
ax4.axhline(y=100, color=YELLOW,  linewidth=1,   linestyle=':',  alpha=0.5, label='安全水域（100万円）')

for xi, (ya, yb) in zip(x_cash, zip(A_cash, B_cash)):
    ax4.annotate(f'{ya}万', (xi, ya), textcoords='offset points', xytext=(-30, 8),
                 ha='center', color=A_COLOR, fontsize=10, fontweight='bold')
    ax4.annotate(f'{yb}万', (xi, yb), textcoords='offset points', xytext=(30, 8),
                 ha='center', color=B_COLOR, fontsize=10, fontweight='bold')

ax4.set_title('累積キャッシュ残高比較（万円）', color='white', fontsize=13, pad=10)
ax4.set_xticks(x_cash); ax4.set_xticklabels(x_labels_cash, color=NEUTRAL)
ax4.tick_params(colors=NEUTRAL)
for sp in ['top','right']: ax4.spines[sp].set_visible(False)
for sp in ['bottom','left']: ax4.spines[sp].set_color('#444')
ax4.set_ylabel('万円', color=NEUTRAL); ax4.yaxis.set_tick_params(labelcolor=NEUTRAL)
ax4.legend(facecolor='#2a2a2a', labelcolor='white', fontsize=9)
all_cash = A_cash + B_cash
ax4.set_ylim(min(all_cash) - 80, max(all_cash) * 1.2)

fig.suptitle('Figuraffiti 3ヵ年 CF シナリオ比較（自己資金300万円）',
             color='white', fontsize=16, fontweight='bold', y=0.98)

plt.tight_layout(rect=[0, 0, 1, 0.96])
plt.savefig('/home/ubuntu/figuraffiti_cf/cf_chart_v3.png', dpi=150,
            bbox_inches='tight', facecolor='#0f0f0f')
plt.close()

# ---- サマリー出力 ----
print("=== シナリオ比較サマリー ===\n")
print(f"{'':30} {'シナリオA':>12} {'シナリオB':>12} {'差(A-B)':>10}")
print("-" * 68)
for yr, (an, bn, ai, ao, bi, bo) in enumerate(zip(A_nets, B_nets, A_ins, A_outs, B_ins, B_outs), 1):
    print(f"Year {yr} 総収入              {ai:>10}万  {bi:>10}万  {ai-bi:>+8}万")
    print(f"Year {yr} 総支出              {ao:>10}万  {bo:>10}万  {ao-bo:>+8}万")
    print(f"Year {yr} 単年収支            {an:>+10}万  {bn:>+10}万  {an-bn:>+8}万")
    print(f"Year {yr} 末キャッシュ残高    {A_cash[yr]:>10}万  {B_cash[yr]:>10}万  {A_cash[yr]-B_cash[yr]:>+8}万")
    print()
print(f"3年末キャッシュ残高: A={A_cash[-1]}万 / B={B_cash[-1]}万")
print(f"最低キャッシュ残高: A={min(A_cash)}万 / B={min(B_cash)}万")
print(f"\nシナリオBの優位性: 3年間で{B_cash[-1]-A_cash[-1]}万円のキャッシュ改善")
