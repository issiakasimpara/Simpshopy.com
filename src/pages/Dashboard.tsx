
import DashboardLayout from "@/components/DashboardLayout";
import DashboardHeader from "@/components/dashboard/DashboardHeader";
import DashboardStats from "@/components/dashboard/DashboardStats";
import RecentOrders from "@/components/dashboard/RecentOrders";
import StoreStatus from "@/components/dashboard/StoreStatus";
import DashboardQuickActions from "@/components/dashboard/DashboardQuickActions";

const Dashboard = () => {
  return (
    <DashboardLayout>
      <div className="h-full p-4">
        {/* Header avec gradient moderne */}
        <DashboardHeader />

        {/* Stats Cards avec design amélioré */}
        <DashboardStats />

        {/* Main Content Grid avec design modernisé */}
        <div className="grid xl:grid-cols-3 gap-6">
          {/* Recent Orders */}
          <div className="xl:col-span-2">
            <RecentOrders />
          </div>

          {/* Right Sidebar */}
          <div className="space-y-6">
            {/* Store Status */}
            <StoreStatus />

            {/* Quick Actions */}
            <DashboardQuickActions />
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Dashboard;
