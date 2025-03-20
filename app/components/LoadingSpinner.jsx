'use client';

/**
 * A simple loading spinner component with an optional message
 */
export default function LoadingSpinner({ message = "Loading..." }) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[400px]">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mb-4"></div>
      {message && <p className="text-gray-600">{message}</p>}
    </div>
  );
}
