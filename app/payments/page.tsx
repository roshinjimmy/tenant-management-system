import PaymentsTable from '@/components/payments/paymentsTable'

export default function PaymentsPage() {
  return (
    <div className="max-w-6xl mx-auto p-6">
      <h1 className="text-2xl font-semibold mb-6">Payments</h1>
      <PaymentsTable />
    </div>
  )
}
