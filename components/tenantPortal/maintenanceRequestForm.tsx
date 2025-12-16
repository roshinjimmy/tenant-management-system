"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";

/* ---------------- Types ---------------- */

type TenantWithRoom = {
  id: number;
  name: string;
  room_id: number | null;
  room: {
    room_no: string;
  } | null;
};

/* ---------------- Component ---------------- */

export default function MaintenanceRequestForm() {
  const [tenants, setTenants] = useState<TenantWithRoom[]>([]);
  const [selectedTenantId, setSelectedTenantId] = useState("");

  const [tenantName, setTenantName] = useState("");
  const [roomId, setRoomId] = useState<number | null>(null);
  const [roomNo, setRoomNo] = useState("");

  const [issue, setIssue] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  /* ---------------- Fetch tenants ---------------- */

  useEffect(() => {
    fetchTenants();
  }, []);

  async function fetchTenants() {
    const { data } = await supabase
      .from("tenants")
      .select(`
        id,
        name,
        room_id,
        room:rooms (
          room_no
        )
      `)
      .order("name");

    if (data) setTenants(data as TenantWithRoom[]);
  }

  /* ---------------- Handlers ---------------- */

  function handleTenantChange(tenantId: string) {
    setSelectedTenantId(tenantId);
    setSuccess(false);

    const tenant = tenants.find(t => t.id === Number(tenantId));

    if (tenant && tenant.room) {
      setTenantName(tenant.name);
      setRoomId(tenant.room_id);
      setRoomNo(tenant.room.room_no);
    } else {
      setTenantName("");
      setRoomId(null);
      setRoomNo("");
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!tenantName || !roomId || !issue.trim()) return;

    setSubmitting(true);

    try {
      await supabase.from("maintenance_requests").insert({
        tenant_name: tenantName,
        room_id: roomId,
        issue: issue.trim(),
        status: "open",
      });

      // Reset
      setSelectedTenantId("");
      setTenantName("");
      setRoomId(null);
      setRoomNo("");
      setIssue("");
      setSuccess(true);
    } catch (err) {
      console.error("Failed to submit maintenance request", err);
    } finally {
      setSubmitting(false);
    }
  }

  /* ---------------- UI ---------------- */

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Tenant */}
      <div>
        <label className="block text-sm mb-1">Name</label>
        <select
          className="border p-2 rounded w-full"
          value={selectedTenantId}
          onChange={(e) => handleTenantChange(e.target.value)}
          required
        >
          <option value="">Select your name</option>
          {tenants.map(t => (
            <option key={t.id} value={t.id}>
              {t.name}
            </option>
          ))}
        </select>
      </div>

      {/* Room */}
      <div>
        <label className="block text-sm mb-1">Room No</label>
        <input
          type="text"
          value={roomNo}
          disabled
          placeholder="Auto-selected"
          className="border p-2 rounded w-full bg-gray-100"
        />
      </div>

      {/* Issue */}
      <div>
        <label className="block text-sm mb-1">Issue</label>
        <textarea
          className="border p-2 rounded w-full"
          rows={4}
          placeholder="Describe the issue (e.g., fan not working, water leakage)"
          value={issue}
          onChange={(e) => setIssue(e.target.value)}
          required
        />
      </div>

      {/* Submit */}
      <button
        type="submit"
        disabled={submitting}
        className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50 text-sm"
      >
        {submitting ? "Submitting..." : "Submit Maintenance Request"}
      </button>

      {success && (
        <p className="text-green-600 text-sm">
          Maintenance request submitted successfully.
        </p>
      )}
    </form>
  );
}
