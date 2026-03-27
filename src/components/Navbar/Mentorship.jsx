import React, { useEffect, useState } from "react";
import Skeleton from "@mui/material/Skeleton";

function Mentorship() {
  const [showContent, setShowContent] = useState(false);
  const [showPrice, setShowPrice] = useState(false);

  useEffect(() => {
    const contentTimer = setTimeout(() => setShowContent(true), 1000);
    const priceTimer = setTimeout(() => setShowPrice(true), 1800);
    return () => {
      clearTimeout(contentTimer);
      clearTimeout(priceTimer);
    };
  }, []);

  const plans = [
    {
      price: "₹3500/mth",
      label: "Warrior Plan",
      features: [
        "Diet Consultation",
        "1 Month Diet Plan",
        "Free Consultation",
        "Changing Room",
        "Wifi & Locker",
      ],
    },
    {
      price: "₹5500/mth",
      label: "Premium Plan",
      highlight: true,
      features: [
        "All features of basic plan",
        "Premium Diet + Recipes",
        "Group Fitness Training",
        "Progress Reports",
        "2x Weekly Zumba Sessions",
      ],
    },
    {
      price: "₹8500/mth",
      label: "Personal Plan",
      features: [
        "Everything in Premium",
        "Certified Personal Fitness Trainer",
        "Custom Workout Plan",
        "2x Weekly Yoga Sessions",
      ],
    },
  ];

  return (
    <div
      className="min-h-screen bg-fixed bg-cover bg-center"
      style={{
        backgroundImage: `url(https://images.unsplash.com/photo-1709315957145-a4bad1feef28?q=80&w=1976&auto=format&fit=crop&ixlib=rb-4.0.3)`,
      }}
    >
      <div className="max-w-7xl mx-auto px-4 py-20 text-center text-white">
        <h2 className="text-4xl md:text-5xl font-bold mb-4">
          At price of a cheesy dinner!
        </h2>
        <p className="text-lg max-w-2xl mx-auto mb-16">
          Revitalize your fitness routine and sculpt your dream physique. <br />
          Join us today and never regret it later.
        </p>

        <div className="flex justify-center gap-6 flex-wrap">
          {plans.map((plan, idx) => {
            const isPremium = plan.highlight;

            return (
              <div
                key={idx}
                className={`relative bg-white text-black rounded-2xl shadow-lg transition-all duration-300 border flex flex-col justify-between ${
                  isPremium
                    ? "border-yellow-500 shadow-2xl scale-105"
                    : "border-gray-200"
                }`}
                style={{
                  width: "340px",
                  height: "520px",
                  padding: "24px",
                  boxSizing: "border-box",
                }}
              >
                {/* Badge */}
                {isPremium && (
                  <>
                    <div className="absolute top-0 right-0 bg-yellow-400 text-black px-3 py-1 text-xs font-bold rounded-bl-md">
                      Most Chosen 💥
                    </div>
                    <p className="text-sm text-red-600 font-semibold text-center mb-2 mt-1">
                      Only 3 left this month!
                    </p>
                  </>
                )}

                {/* Price */}
                <div className="mb-2 text-center">
                  {showPrice ? (
                    <p className="text-3xl font-bold">{plan.price}</p>
                  ) : (
                    <Skeleton
                      variant="text"
                      animation="wave"
                      width={140}
                      height={40}
                      sx={{ mx: "auto" }}
                    />
                  )}
                </div>

                {/* Plan Title */}
                <div className="text-center">
                  {showContent ? (
                    <p className="text-xl font-semibold">{plan.label}</p>
                  ) : (
                    <Skeleton
                      variant="text"
                      animation="wave"
                      width="60%"
                      height={28}
                      sx={{ mx: "auto", mt: 1 }}
                    />
                  )}
                </div>

                {/* Features */}
                <div className="flex-1 mt-4">
                  {showContent ? (
                    <ul className="space-y-2 text-sm text-gray-700 text-left">
                      {plan.features.map((feature, i) => (
                        <li key={i}>✓ {feature}</li>
                      ))}
                      {isPremium && (
                        <li className="text-green-600 font-medium">
                          + ₹12,000 value guidance free
                        </li>
                      )}
                    </ul>
                  ) : (
                    <div className="space-y-2">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <Skeleton
                          key={i}
                          variant="text"
                          width="100%"
                          height={20}
                        />
                      ))}
                    </div>
                  )}
                </div>

                {/* FOMO Text */}
                {isPremium && showContent && (
                  <p className="text-xs text-gray-500 text-center mt-3">
                    Skip this? You’ll pay 3x more in 6 months.
                  </p>
                )}

                {/* Buttons */}
                <div className="mt-6 space-y-2">
                  {showContent ? (
                    <>
                      <button
                        className={`w-full py-2 text-sm font-semibold rounded-md text-white ${
                          isPremium
                            ? "bg-yellow-500 hover:bg-yellow-600"
                            : "bg-black hover:bg-gray-800"
                        }`}
                      >
                        {isPremium ? "Upgrade Now →" : "Get Started"}
                      </button>
                      <button className="w-full border border-black text-black py-2 rounded-md text-sm font-semibold">
                        Contact Us
                      </button>
                    </>
                  ) : (
                    <>
                      <Skeleton
                        variant="rectangular"
                        animation="wave"
                        height={40}
                        width="100%"
                      />
                      <Skeleton
                        variant="rectangular"
                        animation="wave"
                        height={40}
                        width="100%"
                      />
                    </>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

export default Mentorship;
