let cache = null;

function json(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      "content-type": "application/json; charset=utf-8",
      "access-control-allow-origin": "*",
      "access-control-allow-methods": "GET,POST,OPTIONS",
      "access-control-allow-headers": "content-type"
    }
  });
}

async function loadData(env) {
  if (cache) return cache;
  const [recommendations, exercises] = await Promise.all([
    env.ASSETS.fetch(new Request("https://assets.local/recommendations.json")).then((r) => r.json()),
    env.ASSETS.fetch(new Request("https://assets.local/exercises.json")).then((r) => r.json())
  ]);
  const bodyParts = [...new Set(exercises.map((exercise) => exercise.bodyPart).filter(Boolean))].sort();
  cache = { recommendations, exercises, bodyParts };
  return cache;
}

function normalize(value) {
  return String(value ?? "").trim().toLowerCase();
}

function bmiProfile(input) {
  const heightM = input.heightCm / 100;
  const bmi = Number((input.weightKg / (heightM * heightM)).toFixed(2));
  const bmiLevel = bmi < 18.5 ? "Underweight" : bmi < 25 ? "Normal" : bmi < 30 ? "Overweight" : "Obese";
  const ageRange = input.age < 18 ? "Teen" : input.age <= 60 ? "Adult" : "Older";
  const fitnessGoal = bmiLevel === "Underweight" || bmiLevel === "Normal" ? "Weight Gain" : "Weight Loss";
  const fitnessType = fitnessGoal === "Weight Gain" ? "Muscular Fitness" : "Cardio Fitness";

  return {
    Sex: input.sex,
    Age: input.age,
    Height: input.heightCm,
    Weight: input.weightKg,
    BMI: bmi,
    BMI_Level: bmiLevel,
    Age_Range: ageRange,
    Hypertension: input.hypertension,
    Diabetes: input.diabetes,
    Fitness_Goal: fitnessGoal,
    Fitness_Type: fitnessType
  };
}

function allowedOptions(profile, bodyParts) {
  const medicalLimited = profile.Age_Range === "Older" || profile.Hypertension === "Yes" || profile.Diabetes === "Yes";
  const workoutTypes = medicalLimited
    ? ["Cardio", "Stretching"]
    : profile.Fitness_Type === "Muscular Fitness"
      ? ["Strength", "Bodybuilding"]
      : ["Cardio", "Strength"];
  const difficulties = profile.Age_Range === "Teen"
    ? ["Beginner"]
    : profile.Age_Range === "Older"
      ? ["Beginner", "Intermediate"]
      : ["Beginner", "Intermediate", "Expert"];

  return { workout_types: workoutTypes, difficulties, body_parts: bodyParts };
}

function recommendationKey(profile) {
  return [
    profile.Sex,
    profile.BMI_Level,
    profile.Hypertension,
    profile.Diabetes,
    profile.Fitness_Goal,
    profile.Fitness_Type
  ].map(normalize).join("|");
}

function workoutRecommendations(exercises, preferences) {
  const exact = exercises.filter((exercise) =>
    normalize(exercise.type) === normalize(preferences.workout_type) &&
    normalize(exercise.difficulty) === normalize(preferences.difficulty_level) &&
    normalize(exercise.bodyPart) === normalize(preferences.body_part) &&
    normalize(exercise.equipment) === normalize(preferences.equipment)
  );
  const relaxed = exact.length ? exact : exercises.filter((exercise) =>
    normalize(exercise.type) === normalize(preferences.workout_type) &&
    normalize(exercise.bodyPart) === normalize(preferences.body_part)
  );

  return relaxed.slice(0, 10).map((exercise) => ({
    title: exercise.title,
    type: exercise.type,
    difficulty: exercise.difficulty,
    body_part: exercise.bodyPart,
    equipment: exercise.equipment,
    description: exercise.description.slice(0, 150)
  }));
}

export default {
  async fetch(request, env) {
    if (request.method === "OPTIONS") return json({});

    const url = new URL(request.url);
    if (url.pathname === "/") return json({ status: "online", runtime: "cloudflare-worker" });

    const data = await loadData(env);

    if (url.pathname === "/api/onboarding" && request.method === "POST") {
      const body = await request.json();
      const input = {
        sex: body.sex ?? body.Sex,
        age: Number(body.age ?? body.Age),
        heightCm: Number(body.height_cm ?? body.Height),
        weightKg: Number(body.weight_kg ?? body.Weight),
        hypertension: body.hypertension ?? body.Hypertension ?? "No",
        diabetes: body.diabetes ?? body.Diabetes ?? "No"
      };

      if (!input.sex || !input.age || !input.heightCm || !input.weightKg) {
        return json({ detail: "Missing required fields" }, 400);
      }

      const profile = bmiProfile(input);
      const generalRecommendation =
        data.recommendations.recommendationMap[recommendationKey(profile)] ||
        data.recommendations.fallbackRecommendation;

      return json({
        profile_summary: profile,
        allowed_options: allowedOptions(profile, data.bodyParts),
        general_recommendation: generalRecommendation
      });
    }

    if (url.pathname === "/api/workouts/recommendations" && request.method === "POST") {
      const recommendations = workoutRecommendations(data.exercises, await request.json());
      if (!recommendations.length) return json({ detail: "No matching exercises found." }, 404);
      return json({ recommended_workouts: recommendations });
    }

    return json({ detail: "Not found" }, 404);
  }
};
