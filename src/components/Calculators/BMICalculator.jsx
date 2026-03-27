import React, { useState } from "react";

export default function BMICalculator() {
  const [height, setHeight] = useState("");
  const [weight, setWeight] = useState("");
  const [bmi, setBmi] = useState(null);
  const [category, setCategory] = useState("");

  const calculateBMI = () => {
    if (!height || !weight) return;

    const heightInMeters = height / 100;
    const bmiValue = (weight / (heightInMeters * heightInMeters)).toFixed(1);
    setBmi(bmiValue);

    let cat = "";
    if (bmiValue < 18.5) cat = "Underweight";
    else if (bmiValue < 24.9) cat = "Normal weight";
    else if (bmiValue < 29.9) cat = "Overweight";
    else cat = "Obese";

    setCategory(cat);
  };

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">BMI Calculator</h2>

      <div className="space-y-4">
        <input
          type="number"
          placeholder="Height in cm"
          value={height}
          onChange={(e) => setHeight(e.target.value)}
          className="w-full p-3 rounded-lg text-black"
        />
        <input
          type="number"
          placeholder="Weight in kg"
          value={weight}
          onChange={(e) => setWeight(e.target.value)}
          className="w-full p-3 rounded-lg text-black"
        />
        <button
          onClick={calculateBMI}
          className="bg-green-500 px-6 py-2 rounded-lg font-semibold hover:bg-green-600"
        >
          Calculate
        </button>
      </div>

      {bmi && (
        <div className="mt-4 p-4 bg-gray-700 rounded-lg">
          <p className="text-lg font-bold">Your BMI: {bmi}</p>
          <p className="text-md">Category: {category}</p>
        </div>
      )}
    </div>
  );
}
