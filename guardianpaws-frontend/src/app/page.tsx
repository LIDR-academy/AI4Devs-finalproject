import Header from '@/components/Header';
import SearchCategories from '@/components/SearchCategories';
import RecentListings from '@/components/RecentListings';

export default function Home() {
  return (
    <main className="min-h-screen bg-black">
      {/* Header with background image and search */}
      <Header />

      {/* Main content */}
      <div className="container mx-auto">
        {/* Search Categories */}
        <SearchCategories />

        {/* Recent Listings */}
        {/* <RecentListings /> */}
      </div>
    </main>
  );
}
