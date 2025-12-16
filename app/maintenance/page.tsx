import MaintenanceTable from "@/components/maintenance/maintenanceTable";

export default function MaintenancePage() {
  return (
    <div className="max-w-6xl mx-auto p-6">
      <h1 className="text-2xl font-semibold mb-6">Maintenance Requests</h1>
      <MaintenanceTable />
    </div>
  );
}
