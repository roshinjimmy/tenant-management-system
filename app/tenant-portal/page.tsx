import PaymentProofForm from "@/components/tenantPortal/paymentProofForm";
import MaintenanceRequestForm from "@/components/tenantPortal/maintenanceRequestForm";

export default function TenantPortalPage() {
  return (
    <div className="max-w-4xl mx-auto p-6">
      {/* Header */}
      <h1 className="text-2xl font-semibold mb-2">
        Tenant Portal
      </h1>
      <p className="text-gray-600 mb-8">
        Submit payment proof or raise a maintenance request.
      </p>

      {/* Payment Proof Section */}
      <section className="mb-10">
        <h2 className="text-lg font-medium mb-3">
          Upload Payment Proof
        </h2>
        <div className="bg-white p-4 rounded shadow">
          <PaymentProofForm />
        </div>
      </section>

      {/* Maintenance Request Section */}
      <section>
        <h2 className="text-lg font-medium mb-3">
          Raise a Maintenance Request
        </h2>
        <div className="bg-white p-4 rounded shadow">
          <MaintenanceRequestForm />
        </div>
      </section>
    </div>
  );
}
