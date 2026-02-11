"use client";
import StravaOAuthApp from "@/components/Strava";
import NikeOAuthApp from "@/components/Nike";

export default function HomePage() {
  return (
    <main className="min-h-screen bg-gray-100 py-12 px-4">
      <div className="max-w-4xl mx-auto space-y-8">
        <h1 className="text-4xl font-extrabold text-center text-gray-900 mb-12">
          Connect Your Fitness Accounts
        </h1>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="flex flex-col">
            <h2 className="text-xl font-bold mb-4 text-center text-orange-600">Strava</h2>
            <div className="flex-1 rounded-xl overflow-hidden shadow-lg border border-gray-200 bg-white">
              <StravaOAuthApp />
            </div>
          </div>
          
          <div className="flex flex-col">
            <h2 className="text-xl font-bold mb-4 text-center text-gray-900">Nike Run Club</h2>
            <div className="flex-1 rounded-xl overflow-hidden shadow-lg border border-gray-200 bg-white">
              <NikeOAuthApp />
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}