// src/components/Public/MembershipsPage.jsx
import React from "react";

function MembershipsPage() {
  return (
    <div className="max-w-4xl mx-auto p-8">
      <h1 className="text-3xl font-bold mb-6">Memberships</h1>
      <div className="space-y-8">
        <div className="border rounded-lg p-6 shadow-md">
          <h2 className="text-2xl font-semibold mb-2">Basic Plan</h2>
          <p className="text-gray-700">
            Access to gym facilities during off-peak hours, basic group classes,
            and online resources.
          </p>
          <p className="mt-2 font-bold">$19.99 / month</p>
        </div>
        <div className="border rounded-lg p-6 shadow-md">
          <h2 className="text-2xl font-semibold mb-2">Standard Plan</h2>
          <p className="text-gray-700">
            Full access to gym facilities, standard group classes, and monthly
            personal training sessions.
          </p>
          <p className="mt-2 font-bold">$49.99 / month</p>
        </div>
        <div className="border rounded-lg p-6 shadow-md">
          <h2 className="text-2xl font-semibold mb-2">Premium Plan</h2>
          <p className="text-gray-700">
            All-inclusive access: 24/7 gym access, premium classes, weekly
            personal training, nutrition consultation, and wellness workshops.
          </p>
          <p className="mt-2 font-bold">$89.99 / month</p>
        </div>
      </div>
    </div>
  );
}

export default MembershipsPage;
