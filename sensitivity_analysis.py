"""
Sensitivity Analysis — 120 Weight Combinations
Reproduces Figure 3-10 from the paper.

Generates all permutations of importance rankings across 5 constraints
and checks whether Gradient Boosting consistently wins.
"""

import os
import itertools
import numpy as np
import pandas as pd
import matplotlib
matplotlib.use("Agg")
import matplotlib.pyplot as plt
import matplotlib.patches as mpatches

BASE_DIR   = os.path.dirname(os.path.abspath(__file__))
RESULT_DIR = os.path.join(BASE_DIR, "results")
os.makedirs(RESULT_DIR, exist_ok=True)

# ── Raw constraint values from paper / main.py output ─────────────────────────
# Update these with your actual run values if they differ slightly.
RAW = {
    "Design 1: Linear Regression": {
        "MAPE"     : 20.4675,
        "CV"       : 39.2277,
        "TrainTime": 0.0632,
        "ModelSize": 5.71,
        "Robust"   : 7.21,
    },
    "Design 2: Random Forest": {
        "MAPE"     : 5.68,
        "CV"       : 17.09,
        "TrainTime": 2.74,
        "ModelSize": 10504.25,
        "Robust"   : 45.10,
    },
    "Design 3: Gradient Boosting": {
        "MAPE"     : 5.53,
        "CV"       : 13.78,
        "TrainTime": 0.58,
        "ModelSize": 381.67,
        "Robust"   : 45.85,
    },
}

CONSTRAINTS = ["MAPE", "CV", "TrainTime", "ModelSize", "Robust"]
DESIGNS     = list(RAW.keys())
SHORT_NAMES = ["Linear\nRegression", "Random\nForest", "Gradient\nBoosting"]


def normalize_minimize(raw, min_val, max_val) -> float:
    if max_val == min_val:
        return 10.0
    return 9 * ((max_val - raw) / (max_val - min_val)) + 1


def compute_normalized():
    norm = {d: {} for d in DESIGNS}
    for c in CONSTRAINTS:
        vals    = [RAW[d][c] for d in DESIGNS]
        min_val = min(vals)
        max_val = max(vals)
        for d in DESIGNS:
            norm[d][c] = normalize_minimize(RAW[d][c], min_val, max_val)
    return norm


def weighted_score(norm, weights: dict) -> dict:
    scores = {}
    for d in DESIGNS:
        scores[d] = sum(norm[d][c] * w for c, w in weights.items())
    return scores


def run_sensitivity():
    print("\n" + "═"*60)
    print("  SENSITIVITY ANALYSIS — 120 weight combinations")
    print("═"*60)

    norm = compute_normalized()

    # All permutations of importance ranks 1-5 mapped to 5 constraints
    # 5! = 120 combinations
    base_importances = [10, 9, 8, 7, 6]   # raw importance values
    combos = list(itertools.permutations(base_importances))   # 120 perms

    win_counts  = {d: 0 for d in DESIGNS}
    all_scores  = {d: [] for d in DESIGNS}

    for perm in combos:
        total = sum(perm)
        weights = {c: perm[i] / total for i, c in enumerate(CONSTRAINTS)}
        scores  = weighted_score(norm, weights)

        winner = max(scores, key=scores.get)
        win_counts[winner] += 1

        for d in DESIGNS:
            all_scores[d].append(scores[d])

    # ── Print summary
    print(f"\n{'Design':<35} {'Wins':>6}  {'Win %':>7}  {'Avg Score':>10}")
    print("─" * 62)
    for d in DESIGNS:
        wins = win_counts[d]
        avg  = np.mean(all_scores[d])
        print(f"  {d:<33} {wins:>6}  {wins/120*100:>6.1f}%  {avg:>10.4f}")

    # ── Plot
    fig, (ax1, ax2) = plt.subplots(1, 2, figsize=(13, 5))
    fig.patch.set_facecolor("#0f172a")
    for ax in (ax1, ax2):
        ax.set_facecolor("#1e293b")

    colors = ["#f97316", "#3b82f6", "#22c55e"]   # orange, blue, green

    # Bar chart: win counts
    wins_list = [win_counts[d] for d in DESIGNS]
    bars = ax1.bar(SHORT_NAMES, wins_list, color=colors, width=0.5, edgecolor="none")
    ax1.set_title("Wins Across 120 Weight Combinations", color="white",
                  fontsize=13, fontweight="bold", pad=12)
    ax1.set_ylabel("Number of Wins", color="#94a3b8", fontsize=10)
    ax1.tick_params(colors="white")
    ax1.spines[:].set_color("#334155")
    for bar, val in zip(bars, wins_list):
        ax1.text(bar.get_x() + bar.get_width()/2, bar.get_height() + 1,
                 str(val), ha="center", va="bottom", color="white",
                 fontsize=12, fontweight="bold")
    ax1.set_ylim(0, max(wins_list) * 1.2)

    # Box plot: score distributions
    score_data = [all_scores[d] for d in DESIGNS]
    bp = ax2.boxplot(score_data, patch_artist=True, widths=0.45,
                     medianprops=dict(color="white", linewidth=2))
    for patch, color in zip(bp["boxes"], colors):
        patch.set_facecolor(color)
        patch.set_alpha(0.7)
    for element in ["whiskers", "caps", "fliers"]:
        for item in bp[element]:
            item.set_color("#94a3b8")

    ax2.set_xticklabels(SHORT_NAMES, color="white")
    ax2.set_title("Score Distribution Across All Combinations", color="white",
                  fontsize=13, fontweight="bold", pad=12)
    ax2.set_ylabel("Weighted Score", color="#94a3b8", fontsize=10)
    ax2.tick_params(colors="white")
    ax2.spines[:].set_color("#334155")

    patches = [mpatches.Patch(color=c, label=n.replace("\n", " "))
               for c, n in zip(colors, SHORT_NAMES)]
    fig.legend(handles=patches, loc="lower center", ncol=3,
               frameon=False, labelcolor="white", fontsize=9, bbox_to_anchor=(0.5, -0.04))

    plt.suptitle("Sensitivity Analysis — Philippine Housing Price Forecasting",
                 color="white", fontsize=14, fontweight="bold", y=1.02)
    plt.tight_layout()

    out_path = os.path.join(RESULT_DIR, "sensitivity_analysis.png")
    plt.savefig(out_path, dpi=150, bbox_inches="tight",
                facecolor=fig.get_facecolor())
    print(f"\n[Saved] Sensitivity chart → {out_path}")
    plt.close()

    # ── CSV
    rows = []
    for i, perm in enumerate(combos):
        total   = sum(perm)
        weights = {c: perm[i_] / total for i_, c in enumerate(CONSTRAINTS)}
        scores  = weighted_score(norm, weights)
        winner  = max(scores, key=scores.get)
        rows.append({**{f"w_{c}": f"{weights[c]:.3f}" for c in CONSTRAINTS},
                     **{d: round(scores[d], 4) for d in DESIGNS},
                     "Winner": winner})
    sa_df = pd.DataFrame(rows)
    sa_csv = os.path.join(RESULT_DIR, "sensitivity_analysis.csv")
    sa_df.to_csv(sa_csv, index=False)
    print(f"[Saved] Sensitivity data → {sa_csv}")

    return win_counts


if __name__ == "__main__":
    run_sensitivity()
