import React, { useState } from "react";

export default function MacroCalculator() {
  const [weight, setWeight] = useState("");
  const [height, setHeight] = useState("");
  const [age, setAge] = useState("");
  const [gender, setGender] = useState("male");
  const [activity, setActivity] = useState(1.2);
  const [goal, setGoal] = useState("maintain");
  const [macros, setMacros] = useState(null);

  const calculateMacros = () => {
    if (!weight || !height || !age) return;

    // Step 1: BMR Calculation
    let bmr;
    if (gender === "male") {
      bmr = 10 * weight + 6.25 * height - 5 * age + 5;
    } else {
      bmr = 10 * weight + 6.25 * height - 5 * age - 161;
    }

    // Step 2: Adjust for activity
    let maintenanceCalories = bmr * activity;

    // Step 3: Adjust for goal
    if (goal === "lose") maintenanceCalories -= 500;
    if (goal === "gain") maintenanceCalories += 500;

    // Step 4: Macro distribution (example: 40% carbs, 30% protein, 30% fat)
    const proteinCalories = maintenanceCalories * 0.3;
    const carbCalories = maintenanceCalories * 0.4;
    const fatCalories = maintenanceCalories * 0.3;

    const proteinGrams = proteinCalories / 4;
    const carbGrams = carbCalories / 4;
    const fatGrams = fatCalories / 9;

    setMacros({
      calories: maintenanceCalories.toFixed(0),
      protein: proteinGrams.toFixed(0),
      carbs: carbGrams.toFixed(0),
      fat: fatGrams.toFixed(0),
    });
  };

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">Macro Calculator</h2>

      <div className="space-y-4">
        <input
          type="number"
          placeholder="Weight in kg"
          value={weight}
          onChange={(e) => setWeight(e.target.value)}
          className="w-full p-3 rounded-lg text-black"
        />
        <input
          type="number"
          placeholder="Height in cm"
          value={height}
          onChange={(e) => setHeight(e.target.value)}
          className="w-full p-3 rounded-lg text-black"
        />
        <input
          type="number"
          placeholder="Age in years"
          value={age}
          onChange={(e) => setAge(e.target.value)}
          className="w-full p-3 rounded-lg text-black"
        />

        <select
          value={gender}
          onChange={(e) => setGender(e.target.value)}
          className="w-full p-3 rounded-lg text-black"
        >
          <option value="male">Male</option>
          <option value="female">Female</option>
        </select>

        <select
          value={activity}
          onChange={(e) => setActivity(Number(e.target.value))}
          className="w-full p-3 rounded-lg text-black"
        >
          <option value={1.2}>Sedentary (little or no exercise)</option>
          <option value={1.375}>Lightly active (1-3 days/week)</option>
          <option value={1.55}>Moderately active (3-5 days/week)</option>
          <option value={1.725}>Very active (6-7 days/week)</option>
          <option value={1.9}>Extra active (physical job & training)</option>
        </select>

        <select
          value={goal}
          onChange={(e) => setGoal(e.target.value)}
          className="w-full p-3 rounded-lg text-black"
        >
          <option value="maintain">Maintain weight</option>
          <option value="lose">Lose weight</option>
          <option value="gain">Gain weight</option>
        </select>

        <button
          onClick={calculateMacros}
          className="bg-yellow-500 px-6 py-2 rounded-lg font-semibold hover:bg-yellow-600"
        >
          Calculate
        </button>
      </div>

      {macros && (
        <div className="mt-4 p-4 bg-gray-700 rounded-lg space-y-2">
          <p className="text-lg font-bold">
            Daily Calories: {macros.calories} kcal
          </p>
          <p>Protein: {macros.protein} g</p>
          <p>Carbs: {macros.carbs} g</p>
          <p>Fat: {macros.fat} g</p>
        </div>
      )}
    </div>
  );
}
