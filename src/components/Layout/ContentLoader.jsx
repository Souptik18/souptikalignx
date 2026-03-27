import React from "react";

function ContentLoader() {
  return (
    <>
      <div className="inline-block h-10 w-10 animate-spin rounded-full border-4 border-solid border-current border-e-transparent text-green-500">
        <span className="absolute -m-px h-px w-px overflow-hidden whitespace-nowrap border-0 p-0 clip-[rect(0,0,0,0)]">
          Loading...
        </span>
      </div>
    </>
  );
}

export default ContentLoader;
