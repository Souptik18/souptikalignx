import React from "react";
import pic from "../../../Images/pic.jpg";
import gympic2 from "../../../Images/gympic2.png";

const Recommendations = () => {
  const tips = [
    {
      title: "I. Hydration Essentials: Maximizing the Benefits of Supplements",
      text: "When incorporating supplements like creatine, hydration is crucial. Drink plenty of water to support optimal absorption and effectiveness.",
    },
    {
      title: "II. Fueling Your Workouts: Preparing Your Body for Performance",
      text: "Pair pre-workout supplements with carbs and protein. Peanut butter is a quick and effective energy booster.",
    },
    {
      title: "III. Exercise Preparation: Prioritizing Warm-Up and Stretching",
      text: "Warm up and perform dynamic stretches before workouts to prevent injuries and reduce night cramps.",
    },
    {
      title:
        "IV. Lifestyle Considerations: Navigating Smoking and Alcohol Consumption",
      text: "Avoid smoking and limit alcohol to optimize progress and overall health.",
    },
    {
      title:
        "V. The Importance of Quality Sleep: Enhancing Recovery and Performance",
      text: "Prioritize 7–9 hours of consistent, undisturbed sleep to support recovery and performance.",
    },
  ];

  const tags = ["GYM", "ADVICE", "HEALTH", "CONSULTATION"];

  return (
    <div
      className="bg-slate-900 w-full pt-24 pb-24"
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

          {/* Content */}
          <div className="space-y-8 text-gray-200">
            <section>
              <h2 className="text-2xl font-bold">
                The Significance of In-Depth Consultation
              </h2>
              <p>
                Exploring the benefits of personalized mentorship programs —
                it’s recommended to have an in-depth consultation with a
                professional for expert guidance and optimal results.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold">
                Five Free Tips for Optimal Health
              </h2>
              <ul className="list-disc list-inside space-y-5">
                {tips.map((tip, index) => (
                  <li key={index}>
                    <span className="font-bold text-gray-300">{tip.title}</span>
                    <br />
                    {tip.text}
                  </li>
                ))}
              </ul>
            </section>

            {/* Conclusion */}
            <section>
              <p>
                In conclusion, following these five simple recommendations can
                greatly enhance your health journey. Prioritize hydration,
                proper nutrition, warm-up routines, healthy habits, and quality
                sleep for long-term wellness success.
              </p>
            </section>

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

export default Recommendations;
