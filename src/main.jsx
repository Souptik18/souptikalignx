import React from "react";
import ReactDOM from "react-dom/client";
import "./index.css";
import {
  createBrowserRouter,
  RouterProvider,
  Navigate,
} from "react-router-dom";

import PublicLayout from "./components/Public/PublicLayout.jsx";
import HeroPage from "./components/Public/HeroPage.jsx";
import AboutPage from "./components/Public/AboutPage.jsx";
import MembershipsPage from "./components/Public/MembershipsPage.jsx";
import EquipmentsPage from "./components/Public/EquipmentsPage.jsx";
import InvestPage from "./components/Public/InvestPage.jsx";
import Offerings from "./components/Public/Offerings.jsx";

import Login from "./components/SigningInPages/Login.jsx";
import Register from "./components/SigningInPages/Register.jsx";
import ForgotPassword from "./components/SigningInPages/ForgotPassword.jsx";
import VerifyEmail from "./components/SigningInPages/VerifyEmail.jsx";

import RequireAuth from "./RequireAuth.jsx";
import Layout from "./components/Layout/Layout.jsx";
import Homepage from "./components/Navbar/Homepage.jsx";

import MyJourney from "./components/Navbar/Facts/MyJourney.jsx";
import MyProgress from "./components/Navbar/Facts/MyProgress.jsx";
import Recommendations from "./components/Navbar/Facts/Recommendations.jsx";
import FactNutrition from "./components/Navbar/Facts/FactNutrition.jsx";
import FactsHero from "./components/Navbar/Facts/FactsHero.jsx";

import Nutrition from "./components/Navbar/Nutrition.jsx";
import Workouts from "./components/Workouts/Workouts.jsx";
import Community from "./components/Community/Community.jsx";
import Mentorship from "./components/Navbar/Mentorship.jsx";
import Profile from "./components/Navbar/Profile.jsx";
import Trainings from "./components/Workouts/Trainings.jsx";
import FitnessCalculatorsLandingPage from "./components/Calculators/FitnessCalculatorsLandingPage.jsx";
import FitnessData from "./components/Navbar/FitnessData/FitnessData.jsx";
import ErrorPage from "./components/ErrorPage/ErrorPage.jsx";
import Onboarding from "./components/Navbar/OnBoardingForm.jsx";
import ProtectedOnboardingRoute from "./components/ProtectedOnboardingRoute.jsx";
import Settings from "./components/Settings/Settings.jsx";

const router = createBrowserRouter([
  {
    path: "/",
    element: <PublicLayout />,
    children: [
      { index: true, element: <HeroPage /> },
      { path: "about", element: <AboutPage /> },
      { path: "memberships", element: <MembershipsPage /> },
      { path: "equipments", element: <EquipmentsPage /> },
      { path: "invest", element: <InvestPage /> },
      { path: "offerings", element: <Offerings /> },
      { path: "login", element: <Login /> },
      { path: "register", element: <Register /> },
      { path: "forgot-password", element: <ForgotPassword /> },
      { path: "verify-email", element: <VerifyEmail /> },
      { path: "*", element: <Navigate to="/" replace /> },
    ],
  },
  {
    path: "/onboarding",
    element: (
      <ProtectedOnboardingRoute>
        <Onboarding />
      </ProtectedOnboardingRoute>
    ),
  },

  {
    path: "/home",
    element: (
      <RequireAuth>
        <Layout />
      </RequireAuth>
    ),
    errorElement: <ErrorPage />,
    children: [
      { index: true, element: <Homepage /> },
      {
        path: "facts",
        element: <FactsHero />,
        children: [
          { path: "my-journey", element: <MyJourney /> },
          { path: "members-transformation", element: <MyProgress /> },
          { path: "nutrition", element: <FactNutrition /> },
          { path: "recommendations", element: <Recommendations /> },
        ],
      },
      { path: "nutrition", element: <Nutrition /> },
      { path: "workouts", element: <Workouts /> },
      { path: "trainings", element: <Trainings /> },
      { path: "fitnessData", element: <FitnessData /> },
      { path: "community", element: <Community /> },
      { path: "mentorship", element: <Mentorship /> },
      {
        path: "fitnessCalculators",
        element: <FitnessCalculatorsLandingPage />,
      },
      { path: "profile", element: <Profile /> },
      { path: "settings", element: <Settings /> },
      { path: "*", element: <ErrorPage /> },
    ],
  },
  { path: "*", element: <Navigate to="/" replace /> },
]);

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <RouterProvider router={router} />
  </React.StrictMode>
);
