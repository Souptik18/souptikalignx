import React, { useState } from "react";

export default function BodyFatCalculator() {
  const [gender, setGender] = useState("male");
  const [waist, setWaist] = useState("");
  const [neck, setNeck] = useState("");
  const [hip, setHip] = useState(""); // only for women
  const [height, setHeight] = useState("");
  const [bodyFat, setBodyFat] = useState(null);

  const calculateBodyFat = () => {
    if (!waist || !neck || !height || (gender === "female" && !hip)) return;

    let bf;
    if (gender === "male") {
      bf =
        495 /
          (1.0324 -
            0.19077 * Math.log10(waist - neck) +
            0.15456 * Math.log10(height)) -
        450;
    } else {
      bf =
        495 /
          (1.29579 -
            0.35004 * Math.log10(waist + hip - neck) +
            0.221 * Math.log10(height)) -
        450;
    }

    setBodyFat(bf.toFixed(1));
  };

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">Body Fat % Calculator</h2>

      <div className="space-y-4">
        <select
          value={gender}
          onChange={(e) => setGender(e.target.value)}
          className="w-full p-3 rounded-lg text-black"
        >
          <option value="male">Male</option>
          <option value="female">Female</option>
        </select>

        <input
          type="number"
          placeholder="Waist circumference (cm)"
          value={waist}
          onChange={(e) => setWaist(e.target.value)}
          className="w-full p-3 rounded-lg text-black"
        />
        <input
          type="number"
          placeholder="Neck circumference (cm)"
          value={neck}
          onChange={(e) => setNeck(e.target.value)}
          className="w-full p-3 rounded-lg text-black"
        />
        {gender === "female" && (
          <input
            type="number"
            placeholder="Hip circumference (cm)"
            value={hip}
            onChange={(e) => setHip(e.target.value)}
            className="w-full p-3 rounded-lg text-black"
          />
        )}
        <input
          type="number"
          placeholder="Height (cm)"
          value={height}
          onChange={(e) => setHeight(e.target.value)}
          className="w-full p-3 rounded-lg text-black"
        />

        <button
          onClick={calculateBodyFat}
          className="bg-pink-500 px-6 py-2 rounded-lg font-semibold hover:bg-pink-600"
        >
          Calculate
        </button>
      </div>

      {bodyFat && (
        <div className="mt-4 p-4 bg-gray-700 rounded-lg">
          <p className="text-lg font-bold">Your Body Fat %: {bodyFat}%</p>
          <p className="text-sm opacity-80">
            Based on the U.S. Navy Body Fat formula.
          </p>
        </div>
      )}
    </div>
  );
}
