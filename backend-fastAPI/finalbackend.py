
import os
import pickle
import traceback
import numpy as np
import pandas as pd
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from fastapi.middleware.cors import CORSMiddleware
from sklearn.metrics.pairwise import cosine_similarity
from fastapi import Request

# ============================================================
# CACHE CONFIGURATION
# ============================================================

CACHE_DIR = "recommendation_cache"
EXERCISE_CACHE_FILE = os.path.join(CACHE_DIR, "exercise_data_processed.pkl")
GYM_CACHE_FILE = os.path.join(CACHE_DIR, "gym_data_processed.pkl")


# ============================================================
# LOAD CACHE
# ============================================================

def load_cache():
    """Load preprocessed cache files."""
    if not os.path.exists(EXERCISE_CACHE_FILE) or not os.path.exists(GYM_CACHE_FILE):
        raise FileNotFoundError("❌ Cache files not found. Run cache_generator.py first.")

    with open(EXERCISE_CACHE_FILE, "rb") as f:
        exercise_cache = pickle.load(f)
    with open(GYM_CACHE_FILE, "rb") as f:
        gym_cache = pickle.load(f)

    return exercise_cache, gym_cache


# ============================================================
# SYSTEM STATE
# ============================================================

class SystemState:
    def __init__(self):
        self.exercise_data = None
        self.similarity_matrix = None
        self.features_clean = None
        self.exercise_encoders = None
        self.gym_features = None
        self.gym_recommendations = None
        self.gym_label_encoders = None
        self.gym_scaler = None
        self.gym_num_cols = None
        self.gym_cat_cols = None
        self.is_loaded = False


state = SystemState()


# ============================================================
# BUSINESS LOGIC
# ============================================================

def calculate_bmi_and_goals(sex, age, height_cm, weight_kg, hypertension, diabetes):
    """Compute BMI and determine fitness goal/type."""
    height_m = height_cm / 100
    bmi = round(weight_kg / (height_m ** 2), 2)

    if bmi < 18.5:
        bmi_level = "Underweight"
    elif bmi < 25:
        bmi_level = "Normal"
    elif bmi < 30:
        bmi_level = "Overweight"
    else:
        bmi_level = "Obese"

    age_range = "Teen" if age < 18 else "Adult" if age <= 60 else "Older"

    if bmi_level in ["Underweight", "Normal"]:
        fitness_goal = "Weight Gain"
        fitness_type = "Muscular Fitness"
    else:
        fitness_goal = "Weight Loss"
        fitness_type = "Cardio Fitness"

    return {
        "Sex": sex,
        "Age": age,
        "Height": height_cm,
        "Weight": weight_kg,
        "BMI": bmi,
        "BMI_Level": bmi_level,
        "Age_Range": age_range,
        "Hypertension": hypertension,
        "Diabetes": diabetes,
        "Fitness_Goal": fitness_goal,
        "Fitness_Type": fitness_type,
    }


def get_general_recommendation(profile_dict):
    """Find most similar health profile and return recommendation."""
    user_processed = {}
    for col in state.gym_cat_cols:
        try:
            val = profile_dict.get(col.replace("_", " "), profile_dict.get(col, ""))
            user_processed[col] = state.gym_label_encoders[col].transform([val])[0]
        except Exception:
            user_processed[col] = 0

    user_df = pd.DataFrame(
        [
            {
                "Sex": user_processed.get("Sex", 0),
                "Age": profile_dict["Age"],
                "ageRange": user_processed.get("ageRange", 0),
                "Height": profile_dict["Height"],
                "Weight": profile_dict["Weight"],
                "Hypertension": user_processed.get("Hypertension", 0),
                "Diabetes": user_processed.get("Diabetes", 0),
                "BMI": profile_dict["BMI"],
                "Level": user_processed.get("Level", 0),
                "Fitness Goal": user_processed.get("Fitness Goal", 0),
                "Fitness Type": user_processed.get("Fitness Type", 0),
            }
        ]
    )

    user_df[state.gym_num_cols] = state.gym_scaler.transform(user_df[state.gym_num_cols])
    sim = cosine_similarity(user_df, state.gym_features)
    idx = sim[0].argsort()[-1]
    return state.gym_recommendations.iloc[idx]


# ============================================================
# FASTAPI APP SETUP
# ============================================================

app = FastAPI(
    title="Alignedbytex AI Gym Backend",
    description="AI-powered fitness onboarding + recommendation API",
    version="1.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ============================================================
# MODELS
# ============================================================

class OnboardingInput(BaseModel):
    sex: str
    age: float
    height_cm: float
    weight_kg: float
    hypertension: str
    diabetes: str


class WorkoutPreferencesInput(BaseModel):
    sex: str
    age: float
    height_cm: float
    weight_kg: float
    hypertension: str
    diabetes: str
    difficulty_level: str = "Beginner"
    workout_type: str = "Cardio"
    body_part: str = "Chest"
    equipment: str = "Bodyweight"


# ============================================================
# EVENTS
# ============================================================

@app.on_event("startup")
def startup_event():
    """Load cache when server starts."""
    print("=" * 70)
    print("🚀 Loading Cached Data...")
    try:
        exercise_cache, gym_cache = load_cache()
        state.exercise_data = exercise_cache["data"]
        state.similarity_matrix = exercise_cache["similarity_matrix"]
        state.features_clean = exercise_cache["features_clean"]
        state.exercise_encoders = exercise_cache["encoders"]
        state.gym_features = gym_cache["features"]
        state.gym_recommendations = gym_cache["recommendations"]
        state.gym_label_encoders = gym_cache["encoders"]
        state.gym_scaler = gym_cache["scaler"]
        state.gym_num_cols = gym_cache["num_cols"]
        state.gym_cat_cols = gym_cache["cat_cols"]
        state.is_loaded = True
        print("✅ Cache loaded successfully!")
        print("=" * 70)
    except Exception as e:
        print(f"❌ Failed to load cache: {e}")
        traceback.print_exc()


# ============================================================
# ROUTES
# ============================================================

@app.get("/")
def root():
    return {"status": "online", "cache_loaded": state.is_loaded}


from fastapi import Request

@app.post("/api/onboarding")
async def onboarding(request: Request):
    """Receives onboarding data, returns profile summary."""
    if not state.is_loaded:
        raise HTTPException(status_code=503, detail="System not ready")

    try:
        body = await request.json()
        # Accept both lower and upper case keys
        sex = body.get("sex") or body.get("Sex")
        age = float(body.get("age") or body.get("Age"))
        height_cm = float(body.get("height_cm") or body.get("Height"))
        weight_kg = float(body.get("weight_kg") or body.get("Weight"))
        hypertension = body.get("hypertension") or body.get("Hypertension")
        diabetes = body.get("diabetes") or body.get("Diabetes")

        profile = calculate_bmi_and_goals(
            sex, age, height_cm, weight_kg, hypertension, diabetes
        )

        recommendation = get_general_recommendation({
            "Sex": sex,
            "Age": age,
            "Height": height_cm,
            "Weight": weight_kg,
            "BMI": profile["BMI"],
            "Hypertension": hypertension,
            "Diabetes": diabetes,
            "ageRange": profile["Age_Range"],
            "Fitness Goal": profile["Fitness_Goal"],
            "Fitness Type": profile["Fitness_Type"],
        })

        # Smart allowed options logic
        bmi_level = profile["BMI_Level"]
        age_range = profile["Age_Range"]
        fitness_type = profile["Fitness_Type"]
        has_hyper = profile["Hypertension"] == "Yes"
        has_diab = profile["Diabetes"] == "Yes"

        if age_range == "Older" or has_hyper or has_diab:
            allowed_workout_types = ["Cardio", "Stretching"]
        elif fitness_type == "Muscular Fitness":
            allowed_workout_types = ["Strength", "Bodybuilding"]
        else:
            allowed_workout_types = ["Cardio", "Strength"]

        if age_range == "Teen":
            allowed_difficulties = ["Beginner"]
        elif age_range == "Older":
            allowed_difficulties = ["Beginner", "Intermediate"]
        else:
            allowed_difficulties = ["Beginner", "Intermediate", "Expert"]

        allowed_body_parts = sorted(
            list(set(state.exercise_data["BodyPart"].dropna().unique()))
        )

        return {
            "profile_summary": profile,
            "allowed_options": {
                "workout_types": allowed_workout_types,
                "difficulties": allowed_difficulties,
                "body_parts": allowed_body_parts,
            },
            "general_recommendation": str(recommendation),
        }

    except Exception as e:
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=f"Error: {e}")


@app.post("/api/workouts/recommendations")
def get_workout_recommendations(data: WorkoutPreferencesInput):
    """
    Fetch smart workout recommendations matching the user's selections.
    """
    if not state.is_loaded:
        raise HTTPException(status_code=503, detail="System not ready")

    try:
        df = state.exercise_data.copy()

        # ✅ Use actual dataset columns (Type, Level, BodyPart, Equipment)
        filtered = df[
            (df["Type"].str.lower() == data.workout_type.lower())
            & (df["Level"].str.lower() == data.difficulty_level.lower())
            & (df["BodyPart"].str.lower() == data.body_part.lower())
            & (df["Equipment"].str.lower() == data.equipment.lower())
        ]


        if filtered.empty:
            # Fallback: relax filters progressively
            filtered = df[
                (df["Type"].str.lower() == data.workout_type.lower())
                & (df["BodyPart"].str.lower() == data.body_part.lower())
            ]

        if filtered.empty:
            raise HTTPException(status_code=404, detail="No matching exercises found.")

        # AI-style ranking by similarity
        idx = filtered.index
        sim_scores = cosine_similarity(state.features_clean[idx], state.features_clean[idx])
        top_idx = np.argsort(-sim_scores.mean(axis=1))[:10]

        top_workouts = filtered.iloc[top_idx]
        result = []
        for _, row in top_workouts.iterrows():
            result.append({
                "title": row["Title"],
                "type": row["Type"],
                "difficulty": row["Level"],
                "body_part": row["BodyPart"],
                "equipment": row["Equipment"],
                "description": row["Desc"][:150],
            })

        return {"recommended_workouts": result}

    except Exception as e:
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=str(e))


# ============================================================
# RUN LOCALLY
# ============================================================
if __name__ == "__main__":
    import uvicorn

    print("🚀 Starting Alignedbytex Backend on http://localhost:8000")
    uvicorn.run(app, host="0.0.0.0", port=8000)
