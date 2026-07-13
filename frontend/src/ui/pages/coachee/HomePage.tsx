export function CoacheeHomePage() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Home</h2>
        <p className="mt-1 text-gray-500">
          Your next class and available sessions will appear here.
        </p>
      </div>

      <div className="bg-white rounded-xl border p-6">
        <h3 className="font-semibold text-gray-900 mb-2">Next Class</h3>
        <p className="text-sm text-gray-500">You have no upcoming classes scheduled.</p>
      </div>

      <div className="bg-white rounded-xl border p-6">
        <h3 className="font-semibold text-gray-900 mb-2">Joinable Classes</h3>
        <p className="text-sm text-gray-500">No available classes to join at the moment.</p>
      </div>
    </div>
  );
}
