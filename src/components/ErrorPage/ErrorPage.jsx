import React from "react";

function ErrorPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-200">
      <div className="flex flex-col px-2 lg:flex-row lg:items-center">
        <div className="flex flex-2 flex-col ">
          <div>
            <p className="text-sm font-semibold text-black">404 error</p>
            <h1 className="mt-3 text-2xl font-semibold text-gray-800 md:text-3xl">
              We can't find that page
            </h1>
            <p className="mt-4 text-gray-500">
              Sorry, the page you are looking for doesn't exist or has been
              moved.
            </p>
            <div className="mt-6 flex items-center gap-x-3">
              <button
                type="button"
                className="inline-flex items-center rounded-md border border-black px-3 py-2 text-sm font-semibold text-black shadow-sm focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-black"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="mr-2"
                >
                  <line x1="19" y1="12" x2="5" y2="12"></line>
                  <polyline points="12 19 5 12 12 5"></polyline>
                </svg>
                <button onClick={() => window.history.back()}> Go back</button>
              </button>
            </div>
          </div>
        </div>
        <div className="hidden lg:block">
          <img
            src="https://images.unsplash.com/photo-1584824486509-112e4181ff6b?ixlib=rb-4.0.3&amp;ixid=MnwxMjA3fDB8MHxzZWFyY2h8MXx8NDA0fGVufDB8fDB8fA%3D%3D&amp;auto=format&amp;fit=crop&amp;w=800&amp;q=60"
            alt="404"
            className="h-full w-full rounded-md object-cover"
          />
        </div>
      </div>
    </div>
  );
}

export default ErrorPage;
