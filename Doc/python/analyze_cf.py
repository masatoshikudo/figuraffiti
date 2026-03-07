import matplotlib
matplotlib.use('Agg')
import japanize_matplotlib
import matplotlib.pyplot as plt
import matplotlib.patches as mpatches
import numpy as np

# ===================================================
# ユーザー記入の実数データ（Excelから読み取り）
# ===================================================
# 収入
income = {
    "自己資金":    [300,   0,    0,    0],   # Y0(start), Y1, Y2, Y3
    "融資":        [  0, 500,    0,    0],
    "売上":        [  0, 120,  480, 1300],   # Y1:120 Y2:480 Y3:1300
    "補助金入金":  [  0,   0,  150,  251],
    "助成金入金":  [  0,   0,  100,  300],
}

# 支出（Y1, Y2, Y3）
expense = {
    "3Dプリンター":     [30.6,  15.3,    0],
    "事務所初期費用":   [  10,     0,   10],
    "事務所賃料":       [ 120,   120,  120],
    "サーバー・クラウド":[  9,     9,   24],
    "コンテンツツール": [  18,    18,   18],
    "融資返済":         [  60,    60,   60],
    "フィギュア制作費": [  48,   128,  320],
    "SNS広告費":        [  60,    60,  120],
    "SNS運用外注費":    [  90,   180,  180],
    "インフルエンサー": [  30,    20,   30],
    "展示会出展費":     [   0,   150,    0],
    "コラボ・ライセンス":[  0,     0,  200],
    "大規模プロモーション":[0,     0,  200],
    "人件費":           [   0,   120,  240],
    "諸経費":           [  60,    70,   80],
}

years = ["Year 1", "Year 2", "Year 3"]

total_in  = [sum(v[i+1] for v in income.values()) for i in range(3)]
total_out = [sum(v[i]   for v in expense.values()) for i in range(3)]
net       = [ti - to for ti, to in zip(total_in, total_out)]

# キャッシュ残高（自己資金300万スタート）
cash = [300]
for n in net:
    cash.append(cash[-1] + n)
cash_end = cash[1:]  # Year1末, Year2末, Year3末

print("=== 実数データ分析 ===")
for i, y in enumerate(years):
    print(f"{y}: 収入={total_in[i]:.1f}万 / 支出={total_out[i]:.1f}万 / 収支={net[i]:+.1f}万 / 残高={cash_end[i]:.1f}万")

# ===================================================
# 問題の特定：支出の構成分析
# ===================================================
# カテゴリ分類
fixed_costs = {
    "事務所賃料": [120, 120, 120],
    "サーバー・クラウド": [9, 9, 24],
    "コンテンツツール": [18, 18, 18],
    "融資返済": [60, 60, 60],
}
variable_costs = {
    "フィギュア制作費": [48, 128, 320],
    "SNS広告費": [60, 60, 120],
    "SNS運用外注費": [90, 180, 180],
    "インフルエンサー": [30, 20, 30],
    "展示会出展費": [0, 150, 0],
    "コラボ・ライセンス": [0, 0, 200],
    "大規模プロモーション": [0, 0, 200],
    "人件費": [0, 120, 240],
    "諸経費": [60, 70, 80],
}
init_costs = {
    "3Dプリンター": [30.6, 15.3, 0],
    "事務所初期費用": [10, 0, 10],
}

fixed_total  = [sum(v[i] for v in fixed_costs.values()) for i in range(3)]
var_total    = [sum(v[i] for v in variable_costs.values()) for i in range(3)]
init_total   = [sum(v[i] for v in init_costs.values()) for i in range(3)]

print("\n=== 支出構成 ===")
for i, y in enumerate(years):
    print(f"{y}: 固定費={fixed_total[i]:.1f}万 / 変動費={var_total[i]:.1f}万 / 初期費用={init_total[i]:.1f}万")

# ===================================================
# 改善シナリオ設計
# ===================================================
# 問題点:
# 1. SNS運用外注費がY2で180万（月15万×12ヶ月）→ 高すぎる
# 2. 事務所賃料が初年度から120万（月10万）→ 売上前から重い
# 3. Y2の売上480万に対し支出953万 → 収支比率が悪い
# 4. 展示会費150万がY2に集中
# 5. 人件費Y2で120万が重くのしかかる

# 改善案:
# A: SNS外注を月15万→月8万に圧縮（Y2: 96万→96万、Y3: 96万）
# B: 事務所をシェアオフィスに変更（月5万、年60万）
# C: 人件費をY3から（Y2は0）
# D: 展示会費を助成金前提で計上（助成金入金を前倒し）

# 改善シナリオ: 3パターン
# [現状] そのまま
# [改善A] SNS外注削減 + 事務所シェアオフィス化
# [改善B] 改善A + 人件費Y3から + 融資追加100万

def simulate(
    sns_ops_y1=90, sns_ops_y2=180, sns_ops_y3=180,
    office_y1=120, office_y2=120, office_y3=120,
    personnel_y2=120, personnel_y3=240,
    extra_loan_y1=0, extra_loan_y2=0,
    sub_in_y2=150, sub_in_y3=251,
    grant_y2=100, grant_y3=300,
    sales_y1=120, sales_y2=480, sales_y3=1300,
):
    out_y1 = (30.6 + 10 + office_y1 + 9 + 18 + 60 + 48 + 60 +
              sns_ops_y1 + 30 + 0 + 0 + 0 + 0 + 60)
    out_y2 = (15.3 + 0 + office_y2 + 9 + 18 + 60 + 128 + 60 +
              sns_ops_y2 + 20 + 150 + 0 + 0 + personnel_y2 + 70)
    out_y3 = (0 + 10 + office_y3 + 24 + 18 + 60 + 320 + 120 +
              sns_ops_y3 + 30 + 0 + 200 + 200 + personnel_y3 + 80)

    in_y1 = 300 + 500 + extra_loan_y1 + sales_y1 + 0 + 0
    in_y2 = extra_loan_y2 + sales_y2 + sub_in_y2 + grant_y2
    in_y3 = sales_y3 + sub_in_y3 + grant_y3

    net_y1 = in_y1 - out_y1
    net_y2 = in_y2 - out_y2
    net_y3 = in_y3 - out_y3

    c1 = 300 + net_y1
    c2 = c1 + net_y2
    c3 = c2 + net_y3

    return {
        "in":   [in_y1, in_y2, in_y3],
        "out":  [out_y1, out_y2, out_y3],
        "net":  [net_y1, net_y2, net_y3],
        "cash": [c1, c2, c3],
    }

# 現状
S0 = simulate()

# 改善A: SNS外注を月8万に削減 + 事務所シェアオフィス（月5万）
S_A = simulate(
    sns_ops_y1=0, sns_ops_y2=96, sns_ops_y3=96,
    office_y1=60, office_y2=60, office_y3=60,
)

# 改善B: 改善A + 人件費Y3から + 追加融資200万（Y2）
S_B = simulate(
    sns_ops_y1=0, sns_ops_y2=96, sns_ops_y3=96,
    office_y1=60, office_y2=60, office_y3=60,
    personnel_y2=0, personnel_y3=360,
    extra_loan_y2=200,
)

print("\n=== シナリオ比較 ===")
for label, s in [("現状", S0), ("改善A", S_A), ("改善B", S_B)]:
    print(f"[{label}] Y1残高:{s['cash'][0]:.0f}万 / Y2残高:{s['cash'][1]:.0f}万 / Y3残高:{s['cash'][2]:.0f}万")

# ===================================================
# 可視化
# ===================================================
fig, axes = plt.subplots(2, 2, figsize=(18, 12))
fig.patch.set_facecolor('#0f0f0f')
for ax in axes.flat:
    ax.set_facecolor('#1a1a1a')

C_RED    = '#FF6B6B'
C_GREEN  = '#00FF88'
C_BLUE   = '#4FC3F7'
C_YELLOW = '#FFD700'
C_PURPLE = '#CE93D8'
C_LIGHT  = '#B0BEC5'
C_ORANGE = '#FFA726'

x = np.arange(3)
bw = 0.28

# ---- グラフ1: 現状の収支分析（支出構成の積み上げ） ----
ax1 = axes[0, 0]
bar_fixed = [fixed_total[i] for i in range(3)]
bar_var   = [var_total[i]   for i in range(3)]
bar_init  = [init_total[i]  for i in range(3)]

b1 = ax1.bar(x, bar_init,  0.5, label='初期費用',  color='#7B68EE', alpha=0.9)
b2 = ax1.bar(x, bar_fixed, 0.5, bottom=bar_init, label='固定費', color=C_ORANGE, alpha=0.9)
b3 = ax1.bar(x, bar_var,   0.5, bottom=[a+b for a,b in zip(bar_init, bar_fixed)], label='変動費', color=C_RED, alpha=0.9)

# 売上ライン
ax1.plot(x, total_in, color=C_GREEN, linewidth=2.5, marker='o', markersize=8,
         markerfacecolor='white', markeredgecolor=C_GREEN, markeredgewidth=2,
         zorder=5, label='総収入')
for i, (ti, to) in enumerate(zip(total_in, total_out)):
    diff = ti - to
    color = C_GREEN if diff >= 0 else C_RED
    ax1.text(i, to + 20, f'{diff:+.0f}万', ha='center', va='bottom',
             color=color, fontsize=11, fontweight='bold')

ax1.set_title('現状：支出構成と収入の比較', color='white', fontsize=12, pad=10)
ax1.set_xticks(x); ax1.set_xticklabels(years, color=C_LIGHT)
ax1.tick_params(colors=C_LIGHT)
for sp in ['top','right']: ax1.spines[sp].set_visible(False)
for sp in ['bottom','left']: ax1.spines[sp].set_color('#444')
ax1.set_ylabel('万円', color=C_LIGHT); ax1.yaxis.set_tick_params(labelcolor=C_LIGHT)
ax1.legend(facecolor='#2a2a2a', labelcolor='white', fontsize=9, loc='upper left')
ax1.set_ylim(0, max(max(total_in), max(total_out)) * 1.3)

# ---- グラフ2: 問題費目の内訳（Y2が最も深刻） ----
ax2 = axes[0, 1]
problem_items = {
    'SNS運用\n外注費': [90, 180, 180],
    '事務所\n賃料': [120, 120, 120],
    '人件費': [0, 120, 240],
    '展示会\n出展費': [0, 150, 0],
    'コラボ・\nプロモーション': [0, 0, 400],
}
colors_p = [C_RED, C_ORANGE, C_PURPLE, C_BLUE, '#FF8A65']
bottoms = [0, 0, 0]
for (label, vals), color in zip(problem_items.items(), colors_p):
    ax2.bar(x, vals, 0.5, bottom=bottoms, label=label, color=color, alpha=0.9)
    bottoms = [b + v for b, v in zip(bottoms, vals)]

# 売上ラインを重ねる
ax2.plot(x, [120, 480, 1300], color=C_GREEN, linewidth=2.5, marker='s',
         markersize=8, markerfacecolor='white', markeredgecolor=C_GREEN,
         markeredgewidth=2, zorder=5, label='売上（参考）', linestyle='--')

ax2.set_title('問題費目の積み上げ（売上との比較）', color='white', fontsize=12, pad=10)
ax2.set_xticks(x); ax2.set_xticklabels(years, color=C_LIGHT)
ax2.tick_params(colors=C_LIGHT)
for sp in ['top','right']: ax2.spines[sp].set_visible(False)
for sp in ['bottom','left']: ax2.spines[sp].set_color('#444')
ax2.set_ylabel('万円', color=C_LIGHT); ax2.yaxis.set_tick_params(labelcolor=C_LIGHT)
ax2.legend(facecolor='#2a2a2a', labelcolor='white', fontsize=8, loc='upper left')

# ---- グラフ3: 3シナリオの単年収支比較 ----
ax3 = axes[1, 0]
scenarios = [("現状", S0, C_RED), ("改善A\n(外注削減+シェアオフィス)", S_A, C_YELLOW),
             ("改善B\n(改善A+人件費後倒し+追加融資)", S_B, C_GREEN)]
bw3 = 0.25
for j, (label, s, color) in enumerate(scenarios):
    offset = (j - 1) * bw3
    bars = ax3.bar(x + offset, s['net'], bw3, label=label, color=color, alpha=0.85)
    for i, v in enumerate(s['net']):
        ax3.text(i + offset, v + (15 if v >= 0 else -35),
                 f'{v:+.0f}', ha='center', va='bottom' if v >= 0 else 'top',
                 color=color, fontsize=8, fontweight='bold')

ax3.axhline(y=0, color='white', linewidth=1.5, linestyle='--', alpha=0.5)
ax3.set_title('3シナリオ 単年収支比較', color='white', fontsize=12, pad=10)
ax3.set_xticks(x); ax3.set_xticklabels(years, color=C_LIGHT)
ax3.tick_params(colors=C_LIGHT)
for sp in ['top','right']: ax3.spines[sp].set_visible(False)
for sp in ['bottom','left']: ax3.spines[sp].set_color('#444')
ax3.set_ylabel('万円', color=C_LIGHT); ax3.yaxis.set_tick_params(labelcolor=C_LIGHT)
ax3.legend(facecolor='#2a2a2a', labelcolor='white', fontsize=8)

# ---- グラフ4: 累積キャッシュ残高比較 ----
ax4 = axes[1, 1]
x_cash = [0, 1, 2, 3]
x_labels_cash = ['Start', 'Year 1末', 'Year 2末', 'Year 3末']

for label, s, color, marker in [
    ("現状", S0, C_RED, 'o'),
    ("改善A", S_A, C_YELLOW, 's'),
    ("改善B", S_B, C_GREEN, '^'),
]:
    cash_line = [300] + s['cash']
    ax4.plot(x_cash, cash_line, color=color, linewidth=2.5, marker=marker,
             markersize=9, markerfacecolor='white', markeredgecolor=color,
             markeredgewidth=2, zorder=5, label=label)
    ax4.fill_between(x_cash, cash_line, alpha=0.06, color=color)
    for xi, yi in zip(x_cash, cash_line):
        ax4.annotate(f'{yi:.0f}万', (xi, yi),
                     textcoords='offset points', xytext=(0, 10),
                     ha='center', color=color, fontsize=9, fontweight='bold')

ax4.axhline(y=0,   color='white',  linewidth=1.5, linestyle='--', alpha=0.6, label='キャッシュゼロライン')
ax4.axhline(y=100, color=C_YELLOW, linewidth=1,   linestyle=':',  alpha=0.4, label='安全水域（100万）')

ax4.set_title('累積キャッシュ残高比較', color='white', fontsize=12, pad=10)
ax4.set_xticks(x_cash); ax4.set_xticklabels(x_labels_cash, color=C_LIGHT)
ax4.tick_params(colors=C_LIGHT)
for sp in ['top','right']: ax4.spines[sp].set_visible(False)
for sp in ['bottom','left']: ax4.spines[sp].set_color('#444')
ax4.set_ylabel('万円', color=C_LIGHT); ax4.yaxis.set_tick_params(labelcolor=C_LIGHT)
ax4.legend(facecolor='#2a2a2a', labelcolor='white', fontsize=9)
all_cash = [300] + S0['cash'] + S_A['cash'] + S_B['cash']
ax4.set_ylim(min(all_cash) - 100, max(all_cash) * 1.2)

fig.suptitle('Figuraffiti CF分析：キャッシュマイナスの原因と改善シナリオ',
             color='white', fontsize=15, fontweight='bold', y=0.99)

plt.tight_layout(rect=[0, 0, 1, 0.97])
plt.savefig('/home/ubuntu/figuraffiti_cf/cf_analysis.png', dpi=150,
            bbox_inches='tight', facecolor='#0f0f0f')
plt.close()
print("✅ 分析チャート生成完了")

# ===================================================
# 詳細サマリー出力
# ===================================================
print("\n=== 詳細分析サマリー ===")
print(f"\n【現状の問題点】")
print(f"Year 2 収入: {S0['in'][1]:.0f}万 / 支出: {S0['out'][1]:.0f}万 / 収支: {S0['net'][1]:+.0f}万")
print(f"Year 2 最大問題費目:")
print(f"  SNS運用外注費: 180万（月15万×12ヶ月）")
print(f"  事務所賃料: 120万（月10万×12ヶ月）")
print(f"  人件費: 120万（業務委託）")
print(f"  展示会出展費: 150万（助成金入金は翌年）")
print(f"  → 4費目合計: {180+120+120+150}万 ← 売上480万の{(180+120+120+150)/480*100:.0f}%を占める")

print(f"\n【改善シナリオ比較】")
for label, s in [("現状", S0), ("改善A", S_A), ("改善B", S_B)]:
    print(f"[{label}]")
    for i, y in enumerate(years):
        print(f"  {y}: 収入={s['in'][i]:.0f}万 / 支出={s['out'][i]:.0f}万 / 収支={s['net'][i]:+.0f}万 / 残高={s['cash'][i]:.0f}万")
    print(f"  最低残高: {min(s['cash']):.0f}万")
    print()
