import React from "react";
import pic from "../../../Images/pic.jpg";
import gympic2 from "../../../Images/gympic2.png";

const FactNutrition = () => {
  const sections = [
    {
      title: "The Importance of Diet for Beginners",
      text: `For newcomers to fitness and bodybuilding, relying solely on supplements
      might not be the best approach. Focus on maintaining a healthy diet with
      essential macronutrients every day.`,
    },
    {
      title: "Embrace Culinary Creativity",
      text: `Nutrition can feel mundane if you eat the same things daily.
      Use it as an opportunity to innovate in the kitchen—experiment with
      new recipes and ingredients.`,
    },
    {
      title: "Prioritize Macronutrients",
      text: `In bodybuilding, pay attention to carbohydrates, proteins, and fats.
      Eating carbs 30–60 minutes before workouts helps replenish glycogen stores
      for better performance.`,
    },
    {
      title: "Replenish Electrolytes",
      text: `During workouts, you lose electrolytes through sweat, causing imbalances.
      Replenish sodium and potassium through electrolyte drinks or foods.`,
    },
    {
      title: "Mindful Eating",
      text: `Prioritize nutrition over short-term cravings. Make gradual diet
      improvements that benefit your long-term health.`,
    },
    {
      title: "Hydration is Key",
      text: `Stay hydrated throughout the day. Eat a post-workout meal within
      30–60 minutes to maximize nutrient absorption.`,
    },
    {
      title: "The Role of Nutrition in Mental Health",
      text: `A balanced diet supports cognitive function, mood regulation, and mental clarity.`,
    },
    {
      title: "The Importance of Rest and Recovery",
      text: `Adequate rest lets muscles repair and rebuild. Include rest days and quality sleep.`,
    },
    {
      title: "Seeking Professional Guidance",
      text: `A registered dietitian can tailor a meal plan and keep you accountable.`,
    },
    {
      title: "Conclusion",
      text: `Nutrition affects both physical and mental health. A balanced diet, hydration,
      mindful eating, and rest will optimize performance and well-being.`,
    },
  ];

  const tags = ["GYM", "NUTRITION", "EATING RIGHT", "GUT HEALTH"];

  return (
    <div
      className="bg-slate-900 w-full h-full pt-24 pb-24"
      style={{
        backgroundImage:
          "url(https://images.unsplash.com/photo-1512621776951-a57141f2eefd?q=80&w=2070&auto=format&fit=crop)",
        backgroundAttachment: "fixed",
        backgroundPosition: "center",
        backgroundSize: "cover",
      }}
    >
      <div className="flex justify-center px-4">
        <div className="max-w-4xl p-5 rounded-2xl bg-slate-600 hover:bg-slate-800 hover:scale-105 transition-transform duration-500 hover:border-2 hover:border-white">
          {/* Author Section */}
          <div className="flex items-center gap-x-3 mb-6">
            <img className="w-12 h-12 rounded-full" src={pic} alt="Author" />
            <div>
              <p className="font-semibold text-white">Mr. Souptik</p>
              <ul className="flex gap-4 text-xs text-gray-400">
                <li>Jan 18</li>
                <li>8 min read</li>
              </ul>
            </div>
            <button
              type="button"
              className="ml-auto py-1.5 px-2.5 rounded-lg border border-gray-200 bg-white text-gray-800 shadow-sm hover:bg-gray-50 dark:bg-slate-900 dark:border-gray-700 dark:text-white dark:hover:bg-gray-800"
            >
              Tweet
            </button>
          </div>

          {/* Article Content */}
          <div className="space-y-8 text-gray-200">
            {sections.map((sec, index) => (
              <section key={index}>
                <h2 className="text-2xl font-bold">{sec.title}</h2>
                <p>{sec.text}</p>
              </section>
            ))}

            {/* Quote */}
            <blockquote className="text-center p-4 sm:px-7">
              <p className="mt-8 mb-8 text-xl font-medium text-gray-200">
                Strive for progress, not perfection
              </p>
              <p className="text-gray-400 text-xl">
                ~ Me posing my back after a year with proper nutrition noticed
                growth
              </p>
            </blockquote>

            {/* Image */}
            <figure className="flex justify-center">
              <img
                className="w-7/12 rounded-xl mb-24"
                src={gympic2}
                alt="Gym Progress"
              />
            </figure>

            {/* Tags */}
            <div className="flex flex-wrap gap-2">
              {tags.map((tag) => (
                <span
                  key={tag}
                  className="py-1 px-3 rounded-full text-sm bg-gray-800 hover:bg-gray-700"
                >
                  {tag}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FactNutrition;
