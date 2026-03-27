// src/components/Public/PublicLayout.jsx
import React from "react";
import HeroNavbar from "./HeroNavbar";
import { Outlet } from "react-router-dom";

function PublicLayout() {
  return (
    <>
      <HeroNavbar />
      {/* No need for mt-16; sticky navbar takes space */}
      <main>
        <Outlet />
      </main>
    </>
  );
}

export default PublicLayout;
