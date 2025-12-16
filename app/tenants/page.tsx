import TenantsTable from '@/components/tenants/tenantsTable'

export default function TenantsPage() {
  return (
    <div className="max-w-6xl mx-auto p-6 bg-white text-gray-900">
      <h1 className="text-2xl font-semibold mb-6">Tenants</h1>
      <TenantsTable />
    </div>
  )
}

