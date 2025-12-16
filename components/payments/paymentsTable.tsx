"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";

type Payment = {
  id: number;
  month: string;
  amount: number;
  status: "pending" | "paid" | "late";
  tenant: {
    name: string;
    room_id: number | null;
  };
  proof?: {
    file_url: string;
  } | null;
};

export default function PaymentsTable() {
  const [month, setMonth] = useState("");
  const [payments, setPayments] = useState<Payment[]>([]);
  const [hasPayments, setHasPayments] = useState(false);

  const AMOUNT = 10000;
  const currentYear = new Date().getFullYear();

  const [proofs, setProofs] = useState<{ room_id: number; file_url: string }[]>(
    []
  );

  // Generate months for current year
  const months = Array.from({ length: 12 }, (_, i) => {
    const monthNumber = i + 1;
    return {
      value: `${currentYear}-${String(monthNumber).padStart(2, "0")}-01`,
      label: new Date(currentYear, i).toLocaleString("default", {
        month: "long",
      }),
    };
  });
  async function fetchProofs(selectedMonth: string) {
    const { data } = await supabase
      .from("payment_proofs")
      .select("room_id, file_url")
      .eq("month", selectedMonth);

    setProofs(data || []);
  }

  useEffect(() => {
    if (month) {
      fetchPayments(month);
      fetchProofs(month);
    } else {
      setPayments([]);
      setHasPayments(false);
    }
  }, [month]);

  async function fetchPayments(selectedMonth: string) {
    const { data, error } = await supabase
      .from("payments")
      .select(
        `
      id,
      month,
      amount,
      status,
      tenant:tenants (
        name,
        room_id
      )
    `
      )
      .eq("month", selectedMonth)
      .order("id");

    if (!error && data) {
      setPayments(data as Payment[]);
      setHasPayments(data.length > 0);
    } else {
      setPayments([]);
      setHasPayments(false);
    }
  }

  useEffect(() => {
    if (payments.length === 0 || proofs.length === 0) return;

    const merged = payments.map((p) => {
      const proof = proofs.find((pr) => pr.room_id === p.tenant.room_id);

      return {
        ...p,
        proof: proof ? { file_url: proof.file_url } : null,
      };
    });

    setPayments(merged);
  }, [proofs]);

  async function generatePayments() {
    if (!month || hasPayments) return;

    const { data: tenants, error } = await supabase
      .from("tenants")
      .select("id");

    if (error || !tenants) return;

    const rows = tenants.map((t) => ({
      tenant_id: t.id,
      month,
      amount: AMOUNT,
      status: "pending",
    }));

    await supabase.from("payments").upsert(rows, {
      onConflict: "tenant_id,month",
    });

    fetchPayments(month);
  }

  async function updateStatus(id: number, status: string) {
    await supabase.from("payments").update({ status }).eq("id", id);
    fetchPayments(month);
  }

  return (
    <div className="bg-white p-4 rounded shadow">
      {/* Controls */}
      <div className="flex items-end gap-4 mb-6">
        <div>
          <label className="block text-sm mb-1">Month</label>
          <select
            className="border p-2 rounded min-w-[200px]"
            value={month}
            onChange={(e) => setMonth(e.target.value)}
          >
            <option value="">Select month</option>
            {months.map((m) => (
              <option key={m.value} value={m.value}>
                {m.label} {currentYear}
              </option>
            ))}
          </select>
        </div>

        <button
          onClick={generatePayments}
          disabled={!month || hasPayments}
          className={`px-4 py-2 rounded text-sm ${
            !month || hasPayments
              ? "bg-gray-300 text-gray-600 cursor-not-allowed"
              : "bg-blue-600 text-white hover:bg-blue-700"
          }`}
        >
          Generate Payments
        </button>
      </div>

      {/* Table */}
      <table className="min-w-full border border-gray-200">
        <thead className="bg-gray-100">
          <tr>
            <th className="p-3 text-left">Tenant</th>
            <th className="p-3 text-left">Room</th>
            <th className="p-3 text-left">Amount</th>
            <th className="p-3 text-left">Status</th>
            <th className="p-3 text-left">Proof</th>
          </tr>
        </thead>
        <tbody>
          {payments.map((p) => (
            <tr key={p.id} className="border-t">
              <td className="p-3">{p.tenant.name}</td>
              <td className="p-3">{p.tenant.room_id ?? "-"}</td>
              <td className="p-3">₹{p.amount}</td>
              <td className="p-3">
                <select
                  value={p.status}
                  onChange={(e) => updateStatus(p.id, e.target.value)}
                  className="border p-1 rounded"
                >
                  <option value="pending">Pending</option>
                  <option value="paid">Paid</option>
                  <option value="late">Late</option>
                </select>
              </td>
              <td className="p-3">
                {p.proof ? (
                  <a
                    href={p.proof.file_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-block px-3 py-1 text-sm bg-blue-600 text-white rounded hover:bg-blue-700"
                  >
                    View Proof
                  </a>
                ) : (
                  <span className="text-gray-400">—</span>
                )}
              </td>
            </tr>
          ))}

          {payments.length === 0 && month && (
            <tr>
              <td colSpan={4} className="p-4 text-center text-gray-500">
                No payments for selected month
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
