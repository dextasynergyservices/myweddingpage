export default function Loading() {
  return (
    <main className="max-w-3xl mx-auto p-6 animate-pulse">
      <div className="h-10 bg-gray-300 rounded mb-6"></div>
      <div className="h-6 bg-gray-200 rounded mb-2 w-1/2"></div>
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mt-4">
        <div className="h-40 bg-gray-200 rounded"></div>
        <div className="h-40 bg-gray-200 rounded"></div>
        <div className="h-40 bg-gray-200 rounded hidden md:block"></div>
      </div>
    </main>
  );
}
