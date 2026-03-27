import React, { useContext } from "react";
import { homeContext } from "../Layout/Layout";
import { FaThumbsDown } from "react-icons/fa";
import { NavLink } from "react-router-dom";

const videoplayback =
  "https://res.cloudinary.com/de7nhss6l/video/upload/v1750258221/videoplayback_vetf6v.mp4";

function Homepage() {
  const { Loader, userName } = useContext(homeContext);

  return (
    <>
      {userName ? (
        <div className="flex flex-col">
          {/* Full-screen background video */}
          <video
            src={videoplayback}
            autoPlay
            loop
            muted
            className="w-screen h-screen object-cover"
          />

          {/* Overlay / call-to-action */}
          <div className="w-full h-screen flex items-center justify-center absolute top-0 left-0">
            <div className="max-w-[85rem] mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-10 text-center">
              <h1 className="font-bold text-5xl md:text-5xl lg:text-8xl text-transparent bg-clip-text bg-gradient-to-tl from-blue-200 to-orange-400">
                Let's Build Together
              </h1>
              <p className="mt-5 text-xl text-gray-200">
                Transform your body, transform your life! Sign up for our gym
                mentorship program today.
              </p>
              <div className="mt-8">
                <NavLink to="/home/mentorship">
                  <button className="relative group p-2 ps-3 inline-flex items-center gap-x-2 text-lg rounded-lg border border-zinc-400 bg-white text-gray-800 hover:bg-gray-50">
                    Get Started Now
                    <span className="flex justify-center items-center bg-gray-200 rounded-md size-7">
                      <span className="flex-shrink-0 group-hover:-rotate-180 transition">
                        <FaThumbsDown />
                      </span>
                    </span>
                  </button>
                </NavLink>
              </div>
            </div>
          </div>
        </div>
      ) : (
        // Show loader if userName not yet set (though Layout redirects if not authenticated)
        <div className="w-full h-screen flex justify-center items-center bg-slate-200">
          <Loader />
        </div>
      )}
    </>
  );
}

export default Homepage;
