import matplotlib
matplotlib.use('Agg')
import japanize_matplotlib
import matplotlib.pyplot as plt
import matplotlib.patches as mpatches
import numpy as np

# ===================================================
# 更新版Excelの実数（正確な読み取り値）
# ===================================================
years = ["Year 1", "Year 2", "Year 3"]

# 総収入・総支出（Excelの計算値）
total_in  = [620.0, 750.0, 1497.0]
total_out = [288.6, 505.3, 1477.0]

# 収支・残高
net = [ti - to for ti, to in zip(total_in, total_out)]
cash_start = 300
cash = [cash_start]
for n in net:
    cash.append(cash[-1] + n)
cash_end = cash[1:]

# 支出の内訳
expense_detail = {
    "3Dプリンター":       [30.6, 15.3,   0],
    "事務所初期費用":     [  0,    0,   10],
    "事務所賃料":         [  0,    0,  120],
    "サーバー・クラウド": [  9,    9,   24],
    "コンテンツツール":   [ 18,   18,   18],
    "融資返済":           [ 60,   84,   84],
    "フィギュア制作費":   [ 48,   96,  288],
    "SNS広告費":          [ 60,   60,  120],
    "SNS運用外注費":      [  0,    0,  180],
    "インフルエンサー":   [  0,    0,   30],
    "展示会出展費":       [  0,  150,    0],
    "コラボ・ライセンス": [  0,    0,  200],
    "大規模プロモーション":[  0,    0,  200],
    "人件費":             [  0,    0,  120],
    "諸経費":             [ 60,   70,   80],
}

# カテゴリ分類
fixed   = ["事務所賃料", "サーバー・クラウド", "コンテンツツール", "融資返済"]
invest  = ["3Dプリンター", "事務所初期費用"]
prod    = ["フィギュア制作費"]
mktg    = ["SNS広告費", "SNS運用外注費", "インフルエンサー", "展示会出展費",
           "コラボ・ライセンス", "大規模プロモーション"]
people  = ["人件費"]
misc    = ["諸経費"]

def cat_total(keys, yr):
    return sum(expense_detail[k][yr] for k in keys)

fixed_t  = [cat_total(fixed,  i) for i in range(3)]
invest_t = [cat_total(invest, i) for i in range(3)]
prod_t   = [cat_total(prod,   i) for i in range(3)]
mktg_t   = [cat_total(mktg,   i) for i in range(3)]
people_t = [cat_total(people, i) for i in range(3)]
misc_t   = [cat_total(misc,   i) for i in range(3)]

# ===================================================
# 改善シナリオ（Year 3の問題に焦点）
# ===================================================
# Year 3の問題: 支出1477万 vs 収入1497万 → 収支+20万のみ（残高896万）
# Year 3の主な重い費目:
#   コラボ・ライセンス管理費: 200万
#   大規模プロモーション費: 200万
#   SNS運用外注費: 180万
#   フィギュア制作費: 288万
#   人件費: 120万
# → Year3の「攻め」の投資が重い。収益化が追いつくかが鍵。

# 現状シナリオ（Excelの実数）
S_current = {
    "in":   total_in,
    "out":  total_out,
    "net":  net,
    "cash": cash_end,
}

# 改善シナリオA: Year3のプロモーション費を段階的に（コラボ+大規模プロモを100万ずつに）
def sim_A():
    out3 = total_out[2] - (200 - 100) - (200 - 100)  # 各100万削減
    n3 = total_in[2] - out3
    c3 = cash_end[1] + n3
    return {
        "in":   total_in,
        "out":  [total_out[0], total_out[1], out3],
        "net":  [net[0], net[1], n3],
        "cash": [cash_end[0], cash_end[1], c3],
    }

# 改善シナリオB: Year3のSNS外注を内製化（180万→0）+ プロモ削減（各100万）
def sim_B():
    out3 = total_out[2] - (200 - 100) - (200 - 100) - 180  # さらにSNS外注削減
    n3 = total_in[2] - out3
    c3 = cash_end[1] + n3
    return {
        "in":   total_in,
        "out":  [total_out[0], total_out[1], out3],
        "net":  [net[0], net[1], n3],
        "cash": [cash_end[0], cash_end[1], c3],
    }

# 改善シナリオC: Year3の売上を増加（+200万）+ シナリオBのコスト削減
def sim_C():
    out3 = total_out[2] - (200 - 100) - (200 - 100) - 180
    in3  = total_in[2] + 200  # 売上+200万（ライセンス・コラボ収益化）
    n3 = in3 - out3
    c3 = cash_end[1] + n3
    return {
        "in":   [total_in[0], total_in[1], in3],
        "out":  [total_out[0], total_out[1], out3],
        "net":  [net[0], net[1], n3],
        "cash": [cash_end[0], cash_end[1], c3],
    }

S_A = sim_A()
S_B = sim_B()
S_C = sim_C()

print("=== シナリオ比較 ===")
for label, s in [("現状", S_current), ("改善A(プロモ削減)", S_A),
                  ("改善B(プロモ+SNS外注削減)", S_B), ("改善C(B+売上増)", S_C)]:
    print(f"[{label}]")
    for i, y in enumerate(years):
        print(f"  {y}: 収入={s['in'][i]:.0f}万 / 支出={s['out'][i]:.0f}万 / 収支={s['net'][i]:+.0f}万 / 残高={s['cash'][i]:.0f}万")

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
C_ORANGE = '#FFA726'
C_LIGHT  = '#B0BEC5'
C_TEAL   = '#26C6DA'

x = np.arange(3)

# ---- グラフ1: 現状の収支サマリー ----
ax1 = axes[0, 0]
bw = 0.35
b_in  = ax1.bar(x - bw/2, total_in,  bw, label='総収入', color=C_BLUE,  alpha=0.85)
b_out = ax1.bar(x + bw/2, total_out, bw, label='総支出', color=C_RED,   alpha=0.85)

for i, (n, ti, to) in enumerate(zip(net, total_in, total_out)):
    color = C_GREEN if n >= 0 else C_RED
    sign  = '+' if n >= 0 else ''
    ax1.text(i, max(ti, to) + 20, f'{sign}{n:.0f}万', ha='center', va='bottom',
             color=color, fontsize=12, fontweight='bold')

ax1.set_title('現状：収入 vs 支出（更新版）', color='white', fontsize=12, pad=10)
ax1.set_xticks(x); ax1.set_xticklabels(years, color=C_LIGHT)
ax1.tick_params(colors=C_LIGHT)
for sp in ['top','right']: ax1.spines[sp].set_visible(False)
for sp in ['bottom','left']: ax1.spines[sp].set_color('#444')
ax1.set_ylabel('万円', color=C_LIGHT); ax1.yaxis.set_tick_params(labelcolor=C_LIGHT)
ax1.legend(facecolor='#2a2a2a', labelcolor='white', fontsize=10)
ax1.set_ylim(0, max(max(total_in), max(total_out)) * 1.25)

# ---- グラフ2: Year 3 支出構成の詳細（問題の可視化） ----
ax2 = axes[0, 1]
y3_items = {
    "フィギュア\n制作費": 288,
    "コラボ・\nライセンス": 200,
    "大規模\nプロモーション": 200,
    "SNS運用\n外注費": 180,
    "事務所賃料": 120,
    "人件費": 120,
    "融資返済": 84,
    "SNS広告費": 120,
    "その他": 165,
}
colors_y3 = [C_ORANGE, C_PURPLE, '#FF8A65', C_RED, C_YELLOW, C_TEAL, C_BLUE, C_GREEN, C_LIGHT]
labels_y3 = list(y3_items.keys())
values_y3 = list(y3_items.values())

wedges, texts, autotexts = ax2.pie(
    values_y3, labels=labels_y3, colors=colors_y3,
    autopct=lambda p: f'{p:.0f}%\n({int(p*sum(values_y3)/100)}万)',
    startangle=90, pctdistance=0.75,
    textprops={'color': 'white', 'fontsize': 8},
    wedgeprops={'linewidth': 1.5, 'edgecolor': '#0f0f0f'}
)
for at in autotexts:
    at.set_fontsize(7.5)
    at.set_color('white')

ax2.set_title(f'Year 3 支出構成（計1,477万円）\n収入1,497万円との差: +20万円のみ',
              color='white', fontsize=11, pad=10)

# ---- グラフ3: 3シナリオ 単年収支比較 ----
ax3 = axes[1, 0]
scenarios = [
    ("現状", S_current, C_RED),
    ("改善A\nプロモ費削減", S_A, C_YELLOW),
    ("改善B\nプロモ+SNS外注削減", S_B, C_ORANGE),
    ("改善C\nB+売上増加", S_C, C_GREEN),
]
bw3 = 0.2
for j, (label, s, color) in enumerate(scenarios):
    offset = (j - 1.5) * bw3
    ax3.bar(x + offset, s['net'], bw3, label=label, color=color, alpha=0.85)
    for i, v in enumerate(s['net']):
        ax3.text(i + offset, v + (10 if v >= 0 else -30),
                 f'{v:+.0f}', ha='center', va='bottom' if v >= 0 else 'top',
                 color=color, fontsize=7.5, fontweight='bold')

ax3.axhline(y=0, color='white', linewidth=1.5, linestyle='--', alpha=0.5)
ax3.set_title('4シナリオ 単年収支比較', color='white', fontsize=12, pad=10)
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
    ("現状", S_current, C_RED, 'o'),
    ("改善A", S_A, C_YELLOW, 's'),
    ("改善B", S_B, C_ORANGE, 'D'),
    ("改善C", S_C, C_GREEN, '^'),
]:
    cash_line = [cash_start] + s['cash']
    ax4.plot(x_cash, cash_line, color=color, linewidth=2.5, marker=marker,
             markersize=9, markerfacecolor='white', markeredgecolor=color,
             markeredgewidth=2, zorder=5, label=label)
    ax4.fill_between(x_cash, cash_line, alpha=0.05, color=color)
    for xi, yi in zip(x_cash, cash_line):
        offset_y = 20 if label in ["現状", "改善A"] else -40
        ax4.annotate(f'{yi:.0f}万', (xi, yi),
                     textcoords='offset points', xytext=(0, offset_y),
                     ha='center', color=color, fontsize=9, fontweight='bold')

ax4.axhline(y=0,   color='white',  linewidth=1.5, linestyle='--', alpha=0.6, label='ゼロライン')
ax4.axhline(y=300, color=C_YELLOW, linewidth=1,   linestyle=':',  alpha=0.4, label='安全水域（300万）')

ax4.set_title('累積キャッシュ残高比較', color='white', fontsize=12, pad=10)
ax4.set_xticks(x_cash); ax4.set_xticklabels(x_labels_cash, color=C_LIGHT)
ax4.tick_params(colors=C_LIGHT)
for sp in ['top','right']: ax4.spines[sp].set_visible(False)
for sp in ['bottom','left']: ax4.spines[sp].set_color('#444')
ax4.set_ylabel('万円', color=C_LIGHT); ax4.yaxis.set_tick_params(labelcolor=C_LIGHT)
ax4.legend(facecolor='#2a2a2a', labelcolor='white', fontsize=9)
all_cash = [cash_start] + S_current['cash'] + S_A['cash'] + S_B['cash'] + S_C['cash']
ax4.set_ylim(min(all_cash) - 100, max(all_cash) * 1.2)

fig.suptitle('Figuraffiti CF分析（更新版）：Year 3 収支改善シナリオ',
             color='white', fontsize=15, fontweight='bold', y=0.99)

plt.tight_layout(rect=[0, 0, 1, 0.97])
plt.savefig('/home/ubuntu/figuraffiti_cf/cf_analysis_v2.png', dpi=150,
            bbox_inches='tight', facecolor='#0f0f0f')
plt.close()
print("✅ 分析チャート生成完了")
