import React from "react";
import pic from "../../../Images/pic.jpg";
import picgym from "../../../Images/picgym.jpg";

function MyJourney() {
  return (
    <div
      className="min-h-screen bg-fixed bg-center bg-cover bg-no-repeat sm:px-6 lg:px-8"
      style={{
        backgroundImage:
          "url(https://images.unsplash.com/photo-1560563609-3b4b1f5c2122?q=80&w=1974&auto=format&fit=crop)",
      }}
    >
      {/* HERO SECTION */}
      <div className="grid lg:grid-cols-7 lg:gap-x-8 xl:gap-x-12 lg:items-center text-center lg:text-left py-16">
        <div className="lg:col-span-3 space-y-4">
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white drop-shadow-lg">
            Taking the <span className="text-green-400 ">first</span> step is
            hard..
          </h1>
          <p className="text-lg text-gray-200">
            Agreed! perhaps, I'm here to help.
          </p>
        </div>
        <div className="lg:col-span-4 flex justify-center lg:justify-end">
          <img
            className="pt-10 rounded-xl w-10/12 max-w-md transition-transform hover:scale-105 duration-500 shadow-lg"
            src="https://images.unsplash.com/photo-1608496601160-f86d19a44f9f?w=500&auto=format&fit=crop&q=60"
            alt="Journey Start"
          />
        </div>
      </div>

      {/* CONTENT CARD */}
      <div className="flex justify-center">
        <div className="bg-black/60 backdrop-blur-md p-6 rounded-2xl max-w-4xl text-gray-200 space-y-8 border border-gray-700">
          {/* Author Info */}
          <div className="flex items-center gap-4">
            <img src={pic} alt="Author" className="w-12 h-12 rounded-full" />
            <div>
              <p className="font-semibold text-white">Mr. Souptik</p>
              <p className="text-xs text-gray-400">Jan 18 • 8 min read</p>
            </div>
          </div>

          {/* Sections */}
          <section>
            <h2 className="text-2xl font-bold text-orange-400 mb-2">
              Journey to Fitness: The Importance of Gym and Knowledge
            </h2>
            <p>
              Embarking on a journey to achieve fitness is not merely about
              sweating it out in the gym; it's a commitment to a lifestyle
              change. Souptik recognizes that transforming his physique is not
              an overnight endeavor—it requires dedication, perseverance, and
              patience.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-orange-400 mb-2">
              Starting the Journey: From Lazy Days to Fitness Freak
            </h2>
            <p>
              Reflecting on the past five years, Souptik went from a couch
              potato to a dedicated bodybuilder. Fries and laziness were
              replaced with discipline, workouts, and mindful nutrition. His
              story is proof that consistency wins.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-orange-400 mb-2">
              Importance of Direction: Guiding the Way to Success
            </h2>
            <p>
              In fitness, the right guidance is like having a map in a race.
              Without it, you risk going in circles. Souptik follows trainers
              and credible sources to stay on track.
            </p>
          </section>

          {/* Quote */}
          <blockquote className="text-center italic border-l-4 border-orange-400 pl-4 text-lg">
            “Strength doesn't come from what you can do. It comes from
            overcoming the things you once thought you couldn't.”
            <footer className="text-sm text-gray-400 mt-2">
              ~ Me posing my back after 6 Months
            </footer>
          </blockquote>

          <div className="flex justify-center">
            <img
              src={picgym}
              alt="Gym Progress"
              className="w-8/12 rounded-lg shadow-lg"
            />
          </div>

          <section>
            <h2 className="text-2xl font-bold text-orange-400 mb-2">
              The Role of Knowledge: Building Muscle and Mind
            </h2>
            <p>
              Knowledge is the cornerstone of success. Understanding
              bodybuilding, nutrition, and recovery ensures each workout is
              purposeful and effective.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-orange-400 mb-2">
              Embracing Patience: The Key to Long-Term Success
            </h2>
            <p>
              Building a healthy body is a marathon, not a sprint. Souptik
              celebrates small wins and stays committed to the long game.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-orange-400 mb-2">
              Conclusion: A Journey of Transformation
            </h2>
            <p>
              Souptik's journey is proof that dedication, knowledge, and
              patience can transform not just a body but a lifestyle. Lace up,
              hit the gym, and start your own journey.
            </p>
          </section>

          {/* Tags */}
          <div className="flex flex-wrap gap-2 pt-4">
            {["GYM", "MENTALITY", "PERSISTENCE", "MOTIVATED"].map((tag) => (
              <span
                key={tag}
                className="px-3 py-1 rounded-full text-sm bg-gray-800 hover:bg-gray-700 cursor-pointer"
              >
                {tag}
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default MyJourney;
