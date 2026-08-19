import { useCoacheeDashboard } from "@/infrastructure/hooks/useCoacheeDashboard";
import { usePullToRefresh } from "@/infrastructure/hooks/usePullToRefresh";
import { JoinableClassList } from "@/ui/components/coachee/JoinableClassList";
import { MyWaitingLists } from "@/ui/components/coachee/MyWaitingLists";
import { NextClassCard } from "@/ui/components/coachee/NextClassCard";
import { ErrorStateWithRetry, LoadingState } from "@/ui/components/coachee/ViewState";
import { WaitingListBadge } from "@/ui/components/coachee/WaitingListBadge";
import { WaitingListOpportunities } from "@/ui/components/coachee/WaitingListOpportunities";

export function CoacheeHomePage() {
  const dashboardQuery = useCoacheeDashboard();
  const refetch = () => dashboardQuery.refetch();
  usePullToRefresh({ refetch });

  const dashboard = dashboardQuery.data;

  if (dashboardQuery.isError) {
    return (
      <div className="space-y-6">
        <HomeHeader onRefresh={refetch} />
        <ErrorStateWithRetry message="Could not load your dashboard." onRetry={refetch} />
      </div>
    );
  }

  if (dashboardQuery.isLoading || !dashboard) {
    return (
      <div className="space-y-6">
        <HomeHeader onRefresh={refetch} />
        <LoadingState label="Loading your dashboard..." />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <HomeHeader onRefresh={refetch} />

      <NextClassCard nextClass={dashboard.nextClass} />

      <div>
        <h3 className="mb-2 font-semibold text-gray-900">Joinable Classes</h3>
        <JoinableClassList
          classes={dashboard.joinableClasses}
          isLoading={dashboardQuery.isFetching && dashboard.joinableClasses.length === 0}
          isError={dashboardQuery.isError}
          onRetry={refetch}
        />
      </div>

      <div>
        <h3 className="mb-2 font-semibold text-gray-900">Waiting List Opportunities</h3>
        <WaitingListOpportunities
          classes={dashboard.waitlistEligibleClasses}
          isLoading={dashboardQuery.isFetching && dashboard.waitlistEligibleClasses.length === 0}
          isError={dashboardQuery.isError}
          onRetry={refetch}
        />
      </div>

      <WaitingListBadge count={dashboard.activeWaitingListCount} />

      {dashboard.activeWaitingListCount > 0 && <MyWaitingLists />}
    </div>
  );
}

function HomeHeader({ onRefresh }: { onRefresh: () => void }) {
  return (
    <div className="flex items-start justify-between gap-4">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Home</h2>
        <p className="mt-1 text-gray-500">
          Your next class and available sessions will appear here.
        </p>
      </div>
      <button
        type="button"
        onClick={onRefresh}
        className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
      >
        Refresh
      </button>
    </div>
  );
}
