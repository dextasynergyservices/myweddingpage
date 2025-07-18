export default function ComingSoon({ title }: { title: string }) {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center text-center p-8">
      <h1 className="text-3xl font-bold">{title}</h1>
      <p className="text-gray-500 mt-4">Coming soon...</p>
    </main>
  );
}
