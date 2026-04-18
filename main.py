"""
Philippine Housing Price Forecasting
Machine Learning Analysis Script
Reproduces results from: Design of a Machine Learning-based Housing Market Price
Forecasting Tool for Philippine Residential Properties (Team 3, TIP QC, April 2026)

Design Alternatives:
  - Design 1: Linear Regression
  - Design 2: Random Forest
  - Design 3: Gradient Boosting
"""

import os
import time
import warnings
import numpy as np
import pandas as pd
import pickle

from sklearn.linear_model import LinearRegression
from sklearn.ensemble import RandomForestRegressor, GradientBoostingRegressor
from sklearn.preprocessing import StandardScaler
from sklearn.impute import SimpleImputer
from sklearn.model_selection import cross_val_score, KFold
from sklearn.metrics import mean_absolute_percentage_error
from sklearn.pipeline import Pipeline

warnings.filterwarnings("ignore")

# ─── Paths ────────────────────────────────────────────────────────────────────
BASE_DIR   = os.path.dirname(os.path.abspath(__file__))
DATA_PATH  = os.path.join(BASE_DIR, "data", "PH_Housing.csv")
MODEL_DIR  = os.path.join(BASE_DIR, "models")
RESULT_DIR = os.path.join(BASE_DIR, "results")
os.makedirs(MODEL_DIR, exist_ok=True)
os.makedirs(RESULT_DIR, exist_ok=True)

RANDOM_SEED = 42
N_FOLDS     = 5
NOISE_STD   = 0.1   # std of noise added for robustness test


# ══════════════════════════════════════════════════════════════════════════════
# 1. DATA LOADING & PREPROCESSING
# ══════════════════════════════════════════════════════════════════════════════
def load_and_preprocess(path: str) -> pd.DataFrame:
    print("\n" + "═"*60)
    print("  STEP 1 — DATA LOADING & PREPROCESSING")
    print("═"*60)

    df = pd.read_csv(path)
    print(f"\nRaw dataset shape : {df.shape}")
    print("\nMissing values per column:")
    print(df.isnull().sum().to_string())

    # ── Fill missing numerical values with median
    num_cols = ["Price", "Bedrooms", "Bathrooms", "Floor Area", "Land Area"]
    for col in num_cols:
        if col in df.columns:
            df[col].fillna(df[col].median(), inplace=True)

    # ── Fill missing Location with mode
    if "Location" in df.columns:
        df["Location"].fillna(df["Location"].mode()[0], inplace=True)

    # ── Drop rows where Latitude or Longitude is null
    df.dropna(subset=["Latitude", "Longitude"], inplace=True)

    # ── Parse City / Province / Region from Location string
    def split_location(loc: str):
        parts = [p.strip() for p in str(loc).split(",")]
        city     = parts[0] if len(parts) > 0 else "Unknown"
        province = parts[1] if len(parts) > 1 else "Unknown"
        region   = parts[2] if len(parts) > 2 else "Unknown"
        return city, province, region

    df[["City", "Province", "Region"]] = df["Location"].apply(
        lambda x: pd.Series(split_location(x))
    )

    # ── Log-transform Price (target)
    df = df[df["Price"] > 0].copy()
    df["log_Price"] = np.log(df["Price"])

    print(f"\nCleaned dataset shape: {df.shape}")
    print("\nSample processed rows:")
    print(df[["City", "Province", "Floor Area", "Bedrooms", "Bathrooms", "Price"]].head())

    return df


# ══════════════════════════════════════════════════════════════════════════════
# 2. FEATURE ENGINEERING
# ══════════════════════════════════════════════════════════════════════════════
def build_features(df: pd.DataFrame):
    """One-hot encode top-50 cities/provinces; group others as 'Other'."""
    feature_cols = ["Bedrooms", "Bathrooms", "Floor Area", "Land Area",
                    "Latitude", "Longitude"]

    # Keep only top-N most frequent values to avoid 900+ sparse columns
    TOP_N = 50
    for col in ["City", "Province", "Region"]:
        top = df[col].value_counts().nlargest(TOP_N).index
        df[col + "_enc"] = df[col].where(df[col].isin(top), other="Other")

    enc_cols = ["City_enc", "Province_enc", "Region_enc"]
    X_num = df[feature_cols].copy()
    X_cat = pd.get_dummies(df[enc_cols], drop_first=True)
    X     = pd.concat([X_num, X_cat], axis=1)
    y     = df["log_Price"].values

    print(f"\nFeature matrix shape: {X.shape}  (numeric={len(feature_cols)}, "
          f"one-hot={X_cat.shape[1]})")
    return X, y


# ══════════════════════════════════════════════════════════════════════════════
# 3. METRIC HELPERS
# ══════════════════════════════════════════════════════════════════════════════
def compute_mape(model, X, y) -> float:
    """MAPE in % between exp(prediction) and exp(actual)."""
    y_pred_log = model.predict(X)
    y_true_actual = np.exp(y)
    y_pred_actual = np.exp(y_pred_log)
    mape = mean_absolute_percentage_error(y_true_actual, y_pred_actual) * 100
    return round(mape, 4)


def compute_cv(model, X, y, n_folds=N_FOLDS) -> float:
    """Coefficient of Variation (%) of R² scores across k-fold CV."""
    kf     = KFold(n_splits=n_folds, shuffle=True, random_state=RANDOM_SEED)
    scores = cross_val_score(model, X, y, cv=kf, scoring="r2")
    cv_pct = (scores.std() / abs(scores.mean())) * 100
    return round(cv_pct, 4)


def compute_training_time(model, X, y) -> float:
    """Wall-clock training time in seconds (average of 3 runs)."""
    times = []
    for _ in range(3):
        start = time.perf_counter()
        model.fit(X, y)
        times.append(time.perf_counter() - start)
    return round(np.mean(times), 4)


def compute_model_size(model, name: str) -> float:
    """Serialize model to disk with pickle; return size in KB."""
    path = os.path.join(MODEL_DIR, f"{name}.pkl")
    with open(path, "wb") as f:
        pickle.dump(model, f)
    size_kb = os.path.getsize(path) / 1024
    return round(size_kb, 2)


def compute_robustness(model, X, y) -> float:
    """
    Accuracy degradation (%) when Gaussian noise (std=NOISE_STD × feature_std)
    is added to input features.
    """
    model.fit(X, y)
    baseline_r2 = cross_val_score(
        model, X, y,
        cv=KFold(n_splits=N_FOLDS, shuffle=True, random_state=RANDOM_SEED),
        scoring="r2"
    ).mean()

    np.random.seed(RANDOM_SEED)
    X_arr = np.array(X.values if hasattr(X, "values") else X, dtype=float)
    col_std = X_arr.std(axis=0)
    col_std[col_std == 0] = 1e-9   # avoid zero std for binary columns
    noise   = np.random.normal(0, NOISE_STD * col_std, X_arr.shape)
    X_noisy = pd.DataFrame(X_arr + noise, columns=X.columns)

    noisy_r2 = cross_val_score(
        model, X_noisy, y,
        cv=KFold(n_splits=N_FOLDS, shuffle=True, random_state=RANDOM_SEED),
        scoring="r2"
    ).mean()

    degradation = ((baseline_r2 - noisy_r2) / abs(baseline_r2)) * 100
    return round(max(degradation, 0), 4)


# ══════════════════════════════════════════════════════════════════════════════
# 4. EVALUATE ALL THREE MODELS
# ══════════════════════════════════════════════════════════════════════════════
def evaluate_model(name: str, model, X, y) -> dict:
    print(f"\n{'─'*60}")
    print(f"  Evaluating: {name}")
    print(f"{'─'*60}")

    # Train once for MAPE and model size
    model.fit(X, y)

    mape    = compute_mape(model, X, y)
    print(f"  MAPE              : {mape}%")

    cv      = compute_cv(model, X, y)
    print(f"  Coeff. of Var.    : {cv}%")

    t_time  = compute_training_time(model, X, y)
    print(f"  Training Time     : {t_time} s")

    model_kb = compute_model_size(model, name.replace(" ", "_"))
    print(f"  Model Size        : {model_kb} KB")

    robust  = compute_robustness(model, X, y)
    print(f"  Robustness (deg.) : {robust}%")

    return {
        "Model"                : name,
        "MAPE (%)"             : mape,
        "CV (%)"               : cv,
        "Training Time (s)"    : t_time,
        "Model Size (KB)"      : model_kb,
        "Robustness (Degrad %)": robust,
    }


# ══════════════════════════════════════════════════════════════════════════════
# 5. PARETO MCDM TRADE-OFF ANALYSIS
# ══════════════════════════════════════════════════════════════════════════════
def normalize_minimize(raw, min_val, max_val) -> float:
    if max_val == min_val:
        return 10.0
    return round(9 * ((max_val - raw) / (max_val - min_val)) + 1, 4)


def tradeoff_analysis(results_df: pd.DataFrame) -> pd.DataFrame:
    print("\n" + "═"*60)
    print("  STEP 3 — PARETO MCDM TRADE-OFF ANALYSIS")
    print("═"*60)

    # Weights (minimization preference for all)
    weights = {
        "MAPE (%)"             : 0.25,
        "CV (%)"               : 0.225,
        "Training Time (s)"    : 0.20,
        "Model Size (KB)"      : 0.175,
        "Robustness (Degrad %)": 0.15,
    }

    norm_df = results_df[["Model"]].copy()

    for col, w in weights.items():
        col_min = results_df[col].min()
        col_max = results_df[col].max()
        norm_col = col.replace(" (%)", "").replace(" (s)", "").replace(" (KB)", "").replace(" (Degrad %)", "") + " (norm)"
        norm_df[norm_col] = results_df[col].apply(
            lambda v: normalize_minimize(v, col_min, col_max)
        )

    norm_cols = [c for c in norm_df.columns if "(norm)" in c]
    w_vals    = list(weights.values())
    norm_df["Weighted Score"] = sum(
        norm_df[c] * w for c, w in zip(norm_cols, w_vals)
    ).round(4)

    print("\nNormalized scores:")
    print(norm_df.to_string(index=False))
    print(f"\n🏆 Best design: {norm_df.loc[norm_df['Weighted Score'].idxmax(), 'Model']}")

    return norm_df


# ══════════════════════════════════════════════════════════════════════════════
# 6. MAIN
# ══════════════════════════════════════════════════════════════════════════════
def main():
    print("\n" + "█"*60)
    print("  PH HOUSING PRICE FORECASTING — ML EVALUATION")
    print("█"*60)

    # ── Load & preprocess
    df = load_and_preprocess(DATA_PATH)

    # ── Build features
    print("\n" + "═"*60)
    print("  STEP 2 — FEATURE ENGINEERING & MODEL EVALUATION")
    print("═"*60)
    X, y = build_features(df)

    # ── Define three design alternatives
    models = {
        "Design 1: Linear Regression": Pipeline([
            ("imputer", SimpleImputer(strategy="median")),
            ("scaler",  StandardScaler()),
            ("model",   LinearRegression())
        ]),
        "Design 2: Random Forest": Pipeline([
            ("imputer", SimpleImputer(strategy="median")),
            ("scaler",  StandardScaler()),
            ("model",   RandomForestRegressor(
                n_estimators=100, random_state=RANDOM_SEED, n_jobs=-1
            ))
        ]),
        "Design 3: Gradient Boosting": Pipeline([
            ("imputer", SimpleImputer(strategy="median")),
            ("scaler",  StandardScaler()),
            ("model",   GradientBoostingRegressor(
                n_estimators=100, learning_rate=0.1,
                max_depth=3, random_state=RANDOM_SEED
            ))
        ]),
    }

    # ── Evaluate each
    records = []
    for name, model in models.items():
        result = evaluate_model(name, model, X, y)
        records.append(result)

    results_df = pd.DataFrame(records)

    # ── Summary table
    print("\n" + "═"*60)
    print("  CONSTRAINT SUMMARY TABLE (Table 3.1)")
    print("═"*60)
    print(results_df.to_string(index=False))

    # ── Save raw results
    raw_csv = os.path.join(RESULT_DIR, "raw_results.csv")
    results_df.to_csv(raw_csv, index=False)
    print(f"\n[Saved] Raw results → {raw_csv}")

    # ── MCDM trade-off
    norm_df  = tradeoff_analysis(results_df)
    norm_csv = os.path.join(RESULT_DIR, "tradeoff_scores.csv")
    norm_df.to_csv(norm_csv, index=False)
    print(f"[Saved] Trade-off scores → {norm_csv}")

    # ── Sensitivity analysis hint
    print("\n" + "═"*60)
    print("  SENSITIVITY ANALYSIS")
    print("═"*60)
    print("  Run  sensitivity_analysis.py  for full 120-combination sweep.")

    print("\n" + "█"*60)
    print("  DONE — check the  results/  and  models/  folders.")
    print("█"*60 + "\n")


if __name__ == "__main__":
    main()
