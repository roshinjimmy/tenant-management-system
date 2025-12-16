import Link from "next/link";

export default function HomePage() {
  return (
    <div className="max-w-4xl mx-auto p-8">
      <h1 className="text-3xl font-semibold mb-4">
        Tenant Management System
      </h1>

      <p className="text-gray-600 mb-8">
        Manage tenants, track monthly payments, and handle maintenance
        requests from a single place.
      </p>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Link
          href="/tenants"
          className="p-6 bg-white rounded shadow hover:shadow-md transition"
        >
          <h2 className="text-lg font-medium mb-2">Tenants</h2>
          <p className="text-sm text-gray-600">
            Add, view, and manage tenants and room assignments.
          </p>
        </Link>

        <Link
          href="/payments"
          className="p-6 bg-white rounded shadow hover:shadow-md transition"
        >
          <h2 className="text-lg font-medium mb-2">Payments</h2>
          <p className="text-sm text-gray-600">
            Generate monthly rent and track payment status.
          </p>
        </Link>

        <Link
          href="/maintenance"
          className="p-6 bg-white rounded shadow hover:shadow-md transition"
        >
          <h2 className="text-lg font-medium mb-2">Maintenance</h2>
          <p className="text-sm text-gray-600">
            Log and resolve room maintenance issues.
          </p>
        </Link>
      </div>
    </div>
  );
}
