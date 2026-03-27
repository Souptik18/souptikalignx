import React, { useState } from "react";
import BMICalculator from "./BMICalculator";
import BMRCalculator from "./BMRCalculator";
import BodyFatCalculator from "./BodyFatCalculator";
import MacroCalculator from "./MacroCalculator";

function FitnessCalculatorsLandingPage() {
  const [activeCalc, setActiveCalc] = useState(null);

  const calculators = [
    {
      name: "BMI Calculator",
      color: "from-green-400 to-green-600",
      component: <BMICalculator />,
    },
    {
      name: "BMR Calculator",
      color: "from-blue-400 to-blue-600",
      component: <BMRCalculator />,
    },
    {
      name: "Body Fat % Calculator",
      color: "from-pink-400 to-pink-600",
      component: <BodyFatCalculator />,
    },
    {
      name: "Macro Calculator",
      color: "from-yellow-400 to-yellow-600",
      component: <MacroCalculator />,
    },
  ];

  return (
    <div className="min-h-screen w-full bg-gray-900 text-white pt-16">
      {/* Top Bar */}
      <div className="flex items-center px-4 py-4 bg-black/40 sticky top-0 z-40">
        {activeCalc !== null && (
          <button
            onClick={() => setActiveCalc(null)}
            className="text-white bg-gray-700 px-4 py-2 rounded-lg hover:bg-gray-600 transition"
          >
            ← Back
          </button>
        )}
        <h1 className="mx-auto text-2xl font-bold">
          {activeCalc !== null
            ? calculators[activeCalc].name
            : "Fitness Calculators"}
        </h1>
      </div>

      {/* Background Image */}
      {activeCalc === null && (
        <div
          className="w-full h-[40vh] bg-cover bg-center flex items-center justify-center"
          style={{
            backgroundImage:
              "url(https://images.unsplash.com/photo-1623874106686-5be2b325c8f1?q=80&w=1974&auto=format&fit=crop)",
          }}
        >
          <h2 className="text-5xl font-bold bg-black/50 px-6 py-4 rounded-xl">
            Select a Calculator
          </h2>
        </div>
      )}

      {/* Main Content */}
      <div className="max-w-6xl mx-auto py-8 px-4">
        {activeCalc === null ? (
          // Calculator selection grid
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {calculators.map((calc, index) => (
              <div
                key={index}
                onClick={() => setActiveCalc(index)}
                className={`bg-gradient-to-br ${calc.color} rounded-2xl p-6 flex flex-col items-center justify-center hover:scale-105 transition-transform shadow-lg cursor-pointer`}
              >
                <h2 className="text-2xl font-bold mb-2 text-center">
                  {calc.name}
                </h2>
                <p className="text-sm opacity-80 text-center">
                  Click to open the {calc.name}.
                </p>
              </div>
            ))}
          </div>
        ) : (
          // Active calculator
          <div className="bg-gray-800 rounded-xl shadow-lg p-6">
            {calculators[activeCalc].component}
          </div>
        )}
      </div>
    </div>
  );
}

export default FitnessCalculatorsLandingPage;
