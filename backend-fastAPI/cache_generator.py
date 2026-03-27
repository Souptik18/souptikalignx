# -*- coding: utf-8 -*-
"""
CACHE GENERATOR – AlignX Fitness Recommendation System
Creates cache files with embeddings and clustering.
"""

import os
import pickle
import pandas as pd
import numpy as np
import torch
from sentence_transformers import SentenceTransformer
from sklearn.preprocessing import LabelEncoder, StandardScaler
from sklearn.cluster import KMeans
from sklearn.impute import SimpleImputer
from sklearn.metrics.pairwise import cosine_similarity

# ============================================================
# CONFIG
# ============================================================

CACHE_DIR = "recommendation_cache"
EXERCISE_CACHE_FILE = os.path.join(CACHE_DIR, "exercise_data_processed.pkl")
GYM_CACHE_FILE = os.path.join(CACHE_DIR, "gym_data_processed.pkl")

os.makedirs(CACHE_DIR, exist_ok=True)


# ============================================================
# UTILS
# ============================================================

def categorize_age(age: float):
    if age < 18:
        return "Teen"
    elif age <= 60:
        return "Adult"
    else:
        return "Older"


# ============================================================
# MAIN CACHE FUNCTION
# ============================================================

def generate_cache():
    print("=" * 70)
    print("GENERATING CACHE FOR AI FITNESS SYSTEM")
    print("=" * 70)

    # ------------------------------------------------------------
    # 1. Load datasets
    # ------------------------------------------------------------
    gym_data = pd.read_csv("gym recommendation (2).csv")
    exercise_data = pd.read_csv("megaGymDataset.csv")

    # Handle missing
    exercise_data.fillna({"Equipment": "Bodyweight",
                          "BodyPart": "General",
                          "Desc": "No description available"}, inplace=True)

    print(f"✓ Gym profiles: {len(gym_data)} | Exercises: {len(exercise_data)}")

    # ------------------------------------------------------------
    # 2. Process gym dataset
    # ------------------------------------------------------------
    gym_data["ageRange"] = gym_data["Age"].apply(categorize_age)

    gym_label_encoders = {}
    gym_cat_cols = ["Sex", "Hypertension", "Diabetes", "Level",
                    "Fitness Goal", "Fitness Type", "ageRange"]

    for col in gym_cat_cols:
        le = LabelEncoder()
        gym_data[col] = le.fit_transform(gym_data[col])
        gym_label_encoders[col] = le

    gym_scaler = StandardScaler()
    gym_num_cols = ["Age", "Height", "Weight", "BMI"]
    gym_data[gym_num_cols] = gym_scaler.fit_transform(gym_data[gym_num_cols])

    gym_data.drop(columns=["Diet", "Exercises", "Equipment"], errors="ignore", inplace=True)

    gym_features = gym_data[["Sex", "Age", "ageRange", "Height", "Weight",
                             "Hypertension", "Diabetes", "BMI", "Level",
                             "Fitness Goal", "Fitness Type"]]
    gym_recommendations = gym_data["Recommendation"]

    # Save gym cache
    gym_cache = {
        "features": gym_features,
        "recommendations": gym_recommendations,
        "encoders": gym_label_encoders,
        "scaler": gym_scaler,
        "num_cols": gym_num_cols,
        "cat_cols": gym_cat_cols
    }

    with open(GYM_CACHE_FILE, "wb") as f:
        pickle.dump(gym_cache, f)
    print(f"💾 Saved gym cache → {GYM_CACHE_FILE}")

    # ------------------------------------------------------------
    # 3. Process exercise dataset
    # ------------------------------------------------------------
    exercise_data["text_input"] = (
        exercise_data["Title"] + ". " +
        exercise_data["Type"] + " exercise. " +
        exercise_data["Level"] + " level. " +
        "Targets " + exercise_data["BodyPart"] + ". " +
        "Equipment: " + exercise_data["Equipment"] + ". " +
        exercise_data["Desc"]
    )

    # Encode categoricals
    exercise_encoders = {}
    for col in ["Type", "Level", "BodyPart", "Equipment"]:
        le = LabelEncoder()
        exercise_data[col + "_enc"] = le.fit_transform(exercise_data[col])
        exercise_encoders[col] = le

    # ------------------------------------------------------------
    # 4. Generate embeddings
    # ------------------------------------------------------------
    print("\n🔹 Generating SentenceTransformer embeddings...")
    device = "cuda" if torch.cuda.is_available() else "cpu"
    print(f"Using device: {device}")

    model = SentenceTransformer("all-MiniLM-L6-v2", device=device)
    texts = exercise_data["text_input"].tolist()

    batch_size = 128
    embeddings = []
    for i in range(0, len(texts), batch_size):
        batch = texts[i:i + batch_size]
        emb = model.encode(batch, show_progress_bar=False)
        embeddings.append(emb)
    embeddings = np.vstack(embeddings)

    for i in range(embeddings.shape[1]):
        exercise_data[f"emb_{i}"] = embeddings[:, i]

    print(f"✓ Embeddings generated → {embeddings.shape[1]} dims")

    # ------------------------------------------------------------
    # 5. KMeans Clustering
    # ------------------------------------------------------------
    print("🔹 Clustering exercises...")
    meta_cols = ["Type_enc", "Level_enc", "BodyPart_enc", "Equipment_enc"]
    all_features = meta_cols + [f"emb_{i}" for i in range(embeddings.shape[1])]

    X = exercise_data[all_features].values
    X = SimpleImputer(strategy="mean").fit_transform(X)

    kmeans = KMeans(n_clusters=25, random_state=42, n_init="auto")
    exercise_data["cluster_id"] = kmeans.fit_predict(X)
    print("✓ Clustering complete.")

    # ------------------------------------------------------------
    # 6. Similarity Matrix
    # ------------------------------------------------------------
    print("🔹 Computing cosine similarity matrix...")
    similarity_matrix = cosine_similarity(X)
    print("✓ Similarity matrix ready.")

    # ------------------------------------------------------------
    # 7. Save Exercise Cache
    # ------------------------------------------------------------
    exercise_cache = {
        "data": exercise_data,
        "similarity_matrix": similarity_matrix,
        "features_clean": X,
        "encoders": exercise_encoders
    }

    with open(EXERCISE_CACHE_FILE, "wb") as f:
        pickle.dump(exercise_cache, f)
    print(f"💾 Saved exercise cache → {EXERCISE_CACHE_FILE}")

    # ------------------------------------------------------------
    # 8. Summary
    # ------------------------------------------------------------
    print("=" * 70)
    print("✅ CACHE GENERATION COMPLETE")
    print(f"Exercises: {len(exercise_data)} | Gym profiles: {len(gym_data)}")
    print(f"Cache directory: {CACHE_DIR}")
    print("=" * 70)


# ============================================================
# RUN SCRIPT
# ============================================================

if __name__ == "__main__":
    generate_cache()
