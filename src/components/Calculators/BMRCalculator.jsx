import React, { useState } from "react";

export default function BMRCalculator() {
  const [weight, setWeight] = useState("");
  const [height, setHeight] = useState("");
  const [age, setAge] = useState("");
  const [gender, setGender] = useState("male");
  const [bmr, setBmr] = useState(null);

  const calculateBMR = () => {
    if (!weight || !height || !age) return;

    let result;
    if (gender === "male") {
      // Mifflin-St Jeor Equation for men
      result = 10 * weight + 6.25 * height - 5 * age + 5;
    } else {
      // Mifflin-St Jeor Equation for women
      result = 10 * weight + 6.25 * height - 5 * age - 161;
    }

    setBmr(result.toFixed(1));
  };

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">BMR Calculator</h2>

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

        <button
          onClick={calculateBMR}
          className="bg-blue-500 px-6 py-2 rounded-lg font-semibold hover:bg-blue-600"
        >
          Calculate
        </button>
      </div>

      {bmr && (
        <div className="mt-4 p-4 bg-gray-700 rounded-lg">
          <p className="text-lg font-bold">Your BMR: {bmr} kcal/day</p>
          <p className="text-sm opacity-80">
            This is the number of calories your body needs at rest.
          </p>
        </div>
      )}
    </div>
  );
}
