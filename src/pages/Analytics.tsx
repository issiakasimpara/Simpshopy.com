
import DashboardLayout from "@/components/DashboardLayout";
import AnalyticsHeader from "@/components/analytics/AnalyticsHeader";
import AnalyticsTabs from "@/components/analytics/AnalyticsTabs";
import QuickActions from "@/components/analytics/QuickActions";

const Analytics = () => {
  return (
    <DashboardLayout>
      <div className="space-y-8">
        <AnalyticsHeader />
        <AnalyticsTabs />
        <QuickActions />
      </div>
    </DashboardLayout>
  );
};

export default Analytics;
