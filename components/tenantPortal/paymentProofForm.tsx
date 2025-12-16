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

/* ---------------- Constants ---------------- */

const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

const CURRENT_YEAR = new Date().getFullYear();

/* ---------------- Component ---------------- */

export default function PaymentProofForm() {
  const [tenants, setTenants] = useState<TenantWithRoom[]>([]);
  const [selectedTenantId, setSelectedTenantId] = useState("");

  const [tenantName, setTenantName] = useState("");
  const [roomId, setRoomId] = useState<number | null>(null);
  const [roomNo, setRoomNo] = useState<string>("");

  const [month, setMonth] = useState("");
  const [file, setFile] = useState<File | null>(null);

  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  /* ---------------- Data Fetch ---------------- */

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
    if (!file || !roomId || !month || !tenantName) return;

    setSubmitting(true);

    try {
      // 1. Upload file
      const ext = file.name.split(".").pop();
      const filePath = `${roomId}/${month}_${Date.now()}.${ext}`;

      const { error: uploadError } = await supabase.storage
        .from("payment-proofs")
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      // 2. Get file URL
      const { data: urlData } = supabase.storage
        .from("payment-proofs")
        .getPublicUrl(filePath);

      // 3. Insert DB record
      await supabase.from("payment_proofs").insert({
        tenant_name: tenantName,
        room_id: roomId,
        month: `${month}-01`,
        file_url: urlData.publicUrl,
      });

      // Reset form
      setSelectedTenantId("");
      setTenantName("");
      setRoomId(null);
      setRoomNo("");
      setMonth("");
      setFile(null);
      setSuccess(true);
    } catch (err) {
      console.error("Upload failed", err);
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

      {/* Month */}
      <div>
        <label className="block text-sm mb-1">Month</label>
        <select
          className="border p-2 rounded w-full"
          value={month}
          onChange={(e) => setMonth(e.target.value)}
          required
        >
          <option value="">Select month</option>
          {MONTHS.map((m, i) => {
            const value = `${CURRENT_YEAR}-${String(i + 1).padStart(2, "0")}`;
            return (
              <option key={value} value={value}>
                {m} {CURRENT_YEAR}
              </option>
            );
          })}
        </select>
      </div>

      {/* File Upload */}
      <div>
        <label className="block text-sm mb-1">Payment Proof</label>
        <label className="inline-flex items-center px-4 py-2 border rounded cursor-pointer bg-gray-100 hover:bg-gray-200 text-sm">
          {file ? file.name : "Choose file"}
          <input
            type="file"
            accept="image/*,.pdf"
            className="hidden"
            onChange={(e) => setFile(e.target.files?.[0] || null)}
            required
          />
        </label>
      </div>

      {/* Submit */}
      <button
        type="submit"
        disabled={submitting}
        className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50 text-sm"
      >
        {submitting ? "Uploading..." : "Submit Payment Proof"}
      </button>

      {success && (
        <p className="text-green-600 text-sm">
          Payment proof submitted successfully.
        </p>
      )}
    </form>
  );
}
