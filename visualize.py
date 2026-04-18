"""
Visualization Script
Generates all charts referenced in the paper:
  - Constraint comparison bar charts
  - Normalized score radar/spider chart
  - Weighted score summary
"""

import os
import numpy as np
import pandas as pd
import matplotlib
matplotlib.use("Agg")
import matplotlib.pyplot as plt
import matplotlib.patches as mpatches
from matplotlib.patches import FancyBboxPatch

BASE_DIR   = os.path.dirname(os.path.abspath(__file__))
RESULT_DIR = os.path.join(BASE_DIR, "results")
os.makedirs(RESULT_DIR, exist_ok=True)

# ── Load results (or use paper values as fallback) ─────────────────────────────
RAW_CSV = os.path.join(RESULT_DIR, "raw_results.csv")
if os.path.exists(RAW_CSV):
    df = pd.read_csv(RAW_CSV)
else:
    # Fallback: paper values
    df = pd.DataFrame([
        {"Model": "Design 1: Linear Regression",
         "MAPE (%)": 20.4675, "CV (%)": 39.2277,
         "Training Time (s)": 0.0632, "Model Size (KB)": 5.71, "Robustness (Degrad %)": 7.21},
        {"Model": "Design 2: Random Forest",
         "MAPE (%)": 5.68, "CV (%)": 17.09,
         "Training Time (s)": 2.74, "Model Size (KB)": 10504.25, "Robustness (Degrad %)": 45.10},
        {"Model": "Design 3: Gradient Boosting",
         "MAPE (%)": 5.53, "CV (%)": 13.78,
         "Training Time (s)": 0.58, "Model Size (KB)": 381.67, "Robustness (Degrad %)": 45.85},
    ])

SHORT = ["Linear\nRegression", "Random\nForest", "Gradient\nBoosting"]
COLORS = ["#f97316", "#3b82f6", "#22c55e"]
BG     = "#0f172a"
PANEL  = "#1e293b"
GRID   = "#334155"
TEXT   = "white"
SUB    = "#94a3b8"


def style_ax(ax):
    ax.set_facecolor(PANEL)
    ax.tick_params(colors=TEXT, labelsize=9)
    ax.spines[:].set_color(GRID)
    ax.yaxis.label.set_color(SUB)
    ax.title.set_color(TEXT)


def bar_chart(ax, values, title, ylabel, log_scale=False):
    bars = ax.bar(SHORT, values, color=COLORS, width=0.5, edgecolor="none")
    ax.set_title(title, fontsize=11, fontweight="bold", pad=10)
    ax.set_ylabel(ylabel, fontsize=9)
    style_ax(ax)
    ax.set_xticks(range(len(SHORT)))
    ax.set_xticklabels(SHORT, color=TEXT, fontsize=9)
    if log_scale and max(values) / (min(values) + 1e-9) > 100:
        ax.set_yscale("log")
        ax.set_ylabel(ylabel + " (log scale)", fontsize=9)
    for bar, val in zip(bars, values):
        label = f"{val:.2f}" if val < 1000 else f"{val:,.0f}"
        ax.text(bar.get_x() + bar.get_width()/2,
                bar.get_height() * (1.05 if not log_scale else 1.3),
                label, ha="center", va="bottom",
                color=TEXT, fontsize=9, fontweight="bold")


# ── Chart 1: Constraint comparison ────────────────────────────────────────────
def plot_constraints():
    fig, axes = plt.subplots(1, 5, figsize=(18, 5))
    fig.patch.set_facecolor(BG)
    fig.suptitle("Design Constraint Comparison (Table 3.1)",
                 color=TEXT, fontsize=14, fontweight="bold", y=1.02)

    metrics = [
        ("MAPE (%)",             "MAPE (%)",              "Functionality\n(Lower is better)",  False),
        ("CV (%)",               "CV (%)",                "Stability\n(Lower is better)",      False),
        ("Training Time (s)",    "Time (s)",              "Manufacturability\n(Lower is better)", False),
        ("Model Size (KB)",      "Size (KB)",             "Resource Efficiency\n(Lower is better)", True),
        ("Robustness (Degrad %)", "Degradation (%)",      "Robustness\n(Lower is better)",     False),
    ]

    for ax, (col, ylabel, title, log_s) in zip(axes, metrics):
        bar_chart(ax, df[col].tolist(), title, ylabel, log_s)

    plt.tight_layout()
    out = os.path.join(RESULT_DIR, "constraint_comparison.png")
    plt.savefig(out, dpi=150, bbox_inches="tight", facecolor=BG)
    print(f"[Saved] {out}")
    plt.close()


# ── Chart 2: Normalized scores (radar) ────────────────────────────────────────
def normalize_minimize(raw, min_val, max_val):
    if max_val == min_val:
        return 10.0
    return 9 * ((max_val - raw) / (max_val - min_val)) + 1


def plot_radar():
    cols     = ["MAPE (%)", "CV (%)", "Training Time (s)", "Model Size (KB)", "Robustness (Degrad %)"]
    labels   = ["Functionality\n(MAPE)", "Stability\n(CV)", "Manufacturability\n(Time)",
                 "Resource Eff.\n(Size)", "Robustness\n(Degrad)"]
    n        = len(cols)
    angles   = [i * 2 * np.pi / n for i in range(n)] + [0]  # close the polygon

    norm_vals = {}
    for col in cols:
        min_v, max_v = df[col].min(), df[col].max()
        norm_vals[col] = [normalize_minimize(v, min_v, max_v) for v in df[col]]

    fig, ax = plt.subplots(figsize=(7, 7), subplot_kw=dict(polar=True))
    fig.patch.set_facecolor(BG)
    ax.set_facecolor(PANEL)
    ax.spines["polar"].set_color(GRID)
    ax.tick_params(colors=TEXT)
    ax.yaxis.set_tick_params(labelcolor=SUB)

    for i, (row, color, short) in enumerate(zip(df.itertuples(), COLORS, SHORT)):
        values = [norm_vals[col][i] for col in cols] + [norm_vals[cols[0]][i]]
        ax.plot(angles, values, color=color, linewidth=2, label=short.replace("\n", " "))
        ax.fill(angles, values, alpha=0.15, color=color)

    ax.set_xticks(angles[:-1])
    ax.set_xticklabels(labels, color=TEXT, fontsize=9)
    ax.set_ylim(0, 10)
    ax.set_yticks([2, 4, 6, 8, 10])
    ax.set_yticklabels(["2", "4", "6", "8", "10"], color=SUB, fontsize=8)
    ax.grid(color=GRID)

    ax.set_title("Normalized Constraint Scores (1–10 scale)",
                 color=TEXT, fontsize=12, fontweight="bold", pad=20)
    ax.legend(loc="upper right", bbox_to_anchor=(1.3, 1.15),
              labelcolor=TEXT, frameon=False, fontsize=10)

    out = os.path.join(RESULT_DIR, "radar_chart.png")
    plt.savefig(out, dpi=150, bbox_inches="tight", facecolor=BG)
    print(f"[Saved] {out}")
    plt.close()


# ── Chart 3: Weighted score summary ──────────────────────────────────────────
def plot_weighted_scores():
    norm_csv = os.path.join(RESULT_DIR, "tradeoff_scores.csv")
    if not os.path.exists(norm_csv):
        print("[Skip] tradeoff_scores.csv not found — run main.py first.")
        return

    ndf    = pd.read_csv(norm_csv)
    scores = ndf["Weighted Score"].tolist()
    best   = np.argmax(scores)

    fig, ax = plt.subplots(figsize=(8, 5))
    fig.patch.set_facecolor(BG)
    ax.set_facecolor(PANEL)

    bars = ax.barh(SHORT, scores, color=COLORS, height=0.45, edgecolor="none")
    bars[best].set_edgecolor("gold")
    bars[best].set_linewidth(2.5)

    for bar, val in zip(bars, scores):
        ax.text(val + 0.05, bar.get_y() + bar.get_height()/2,
                f"{val:.4f}", va="center", color=TEXT, fontsize=11, fontweight="bold")

    ax.set_title("MCDM Weighted Scores (Pareto Analysis)\n"
                 "★ = Selected Design", color=TEXT, fontsize=13, fontweight="bold")
    ax.text(scores[best] + 0.05, best - 0.35, "★ Winner", color="gold",
            fontsize=10, fontweight="bold")

    ax.set_xlabel("Weighted Score", color=SUB)
    style_ax(ax)
    ax.set_xlim(0, max(scores) * 1.25)
    ax.invert_yaxis()

    plt.tight_layout()
    out = os.path.join(RESULT_DIR, "weighted_scores.png")
    plt.savefig(out, dpi=150, bbox_inches="tight", facecolor=BG)
    print(f"[Saved] {out}")
    plt.close()


if __name__ == "__main__":
    print("\n" + "═"*60)
    print("  GENERATING CHARTS")
    print("═"*60)
    plot_constraints()
    plot_radar()
    plot_weighted_scores()
    print("\nDone. All charts saved in results/")
