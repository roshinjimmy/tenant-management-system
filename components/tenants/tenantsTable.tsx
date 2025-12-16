"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";

/* ---------- Types ---------- */

type Tenant = {
  id: number;
  name: string;
  phone: string | null;
  email: string | null;
  address: string | null;
  room_id: number | null;
  room: {
    room_no: string;
  } | null;
  deposit_amount: number;
  deposit_paid: boolean;
};

type Room = {
  id: number;
  room_no: string;
};

/* ---------- Component ---------- */

export default function TenantsTable() {
  const [tenants, setTenants] = useState<Tenant[]>([]);
  const [availableRooms, setAvailableRooms] = useState<Room[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);

  const [newTenant, setNewTenant] = useState({
    name: "",
    phone: "",
    email: "",
    address: "",
    room_id: "",
    deposit_amount: "",
    deposit_paid: false,
  });

  useEffect(() => {
    fetchTenants();
    fetchAvailableRooms();
  }, []);

  /* ---------- Fetch tenants with room numbers ---------- */

  async function fetchTenants() {
    setLoading(true);

    const { data, error } = await supabase
      .from("tenants")
      .select(
        `
        id,
        name,
        phone,
        email,
        address,
        room_id,
        deposit_amount,
        deposit_paid,
        room:rooms (
          room_no
        )
      `
      )
      .order("id");

    if (!error && data) {
      setTenants(data as Tenant[]);
    }

    setLoading(false);
  }

  /* ---------- Fetch available (vacant) rooms ---------- */

  async function fetchAvailableRooms() {
    // 1. Get occupied room IDs
    const { data: occupied } = await supabase
      .from("tenants")
      .select("room_id")
      .not("room_id", "is", null);

    const occupiedIds = occupied?.map((r) => r.room_id) ?? [];

    // 2. Fetch rooms NOT in occupied list
    let query = supabase.from("rooms").select("id, room_no").order("room_no");

    if (occupiedIds.length > 0) {
      query = query.not("id", "in", `(${occupiedIds.join(",")})`);
    }

    const { data } = await query;
    if (data) setAvailableRooms(data as Room[]);
  }

  /* ---------- Actions ---------- */

  async function deleteTenant(id: number) {
    await supabase.from("tenants").delete().eq("id", id);
    fetchTenants();
    fetchAvailableRooms();
  }

  async function addTenant(e: React.FormEvent) {
    e.preventDefault();
    if (!newTenant.name) return;

    const { error } = await supabase.from("tenants").insert([
      {
        name: newTenant.name,
        phone: newTenant.phone || null,
        email: newTenant.email || null,
        address: newTenant.address || null,
        room_id: newTenant.room_id ? Number(newTenant.room_id) : null,
        deposit_amount: Number(newTenant.deposit_amount) || 0,
        deposit_paid: newTenant.deposit_paid,
      },
    ]);

    if (!error) {
      setNewTenant({
        name: "",
        phone: "",
        email: "",
        address: "",
        room_id: "",
        deposit_amount: "",
        deposit_paid: false,
      });

      setShowForm(false);
      fetchTenants();
      fetchAvailableRooms();
    }
  }

  if (loading) {
    return <p>Loading tenants...</p>;
  }

  /* ---------- Sort tenants by room number (Vacant last) ---------- */

  const sortedTenants = [...tenants].sort((a, b) => {
    if (!a.room && !b.room) return 0;
    if (!a.room) return 1;
    if (!b.room) return -1;

    const aNum = Number(a.room.room_no);
    const bNum = Number(b.room.room_no);

    if (!isNaN(aNum) && !isNaN(bNum)) return aNum - bNum;
    return a.room.room_no.localeCompare(b.room.room_no);
  });

  /* ---------- UI ---------- */

  return (
    <div className="overflow-x-auto bg-white rounded-lg shadow p-4">
      <table className="min-w-full border border-gray-200">
        <thead className="bg-gray-100">
          <tr>
            <th className="p-3 text-left text-sm font-medium">Name</th>
            <th className="p-3 text-left text-sm font-medium">Phone</th>
            <th className="p-3 text-left text-sm font-medium">Room</th>
            <th className="p-3 text-left text-sm font-medium">Deposit</th>
            <th className="p-3 text-left text-sm font-medium">
              Deposit Status
            </th>
            <th className="p-3 text-left text-sm font-medium">Actions</th>
          </tr>
        </thead>
        <tbody>
          {sortedTenants.map((tenant) => (
            <tr key={tenant.id} className="border-t hover:bg-gray-50">
              <td className="p-3">{tenant.name}</td>
              <td className="p-3">{tenant.phone ?? "-"}</td>
              <td className="p-3">
                {tenant.room ? tenant.room.room_no : "Vacant"}
              </td>
              <td className="p-3">
                ₹{tenant.deposit_amount.toLocaleString("en-IN")}
              </td>

              <td className="p-3">
                {tenant.deposit_paid ? (
                  <span className="text-green-600 font-medium">Paid</span>
                ) : (
                  <span className="text-red-600 font-medium">Not Paid</span>
                )}
              </td>
              <td className="p-3">
                <button
                  onClick={() => deleteTenant(tenant.id)}
                  className="text-red-600 hover:text-red-800 text-sm"
                >
                  Delete
                </button>
              </td>
            </tr>
          ))}

          {tenants.length === 0 && (
            <tr>
              <td colSpan={4} className="p-4 text-center text-gray-500">
                No tenants found
              </td>
            </tr>
          )}
        </tbody>
      </table>

      {/* ---------- Add Tenant ---------- */}

      <div className="mt-4">
        {!showForm ? (
          <button
            onClick={() => setShowForm(true)}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 text-sm"
          >
            + Add Tenant
          </button>
        ) : (
          <form
            onSubmit={addTenant}
            className="mt-4 p-4 border rounded bg-gray-50"
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <input
                type="text"
                placeholder="Name *"
                className="p-2 border rounded"
                value={newTenant.name}
                onChange={(e) =>
                  setNewTenant({ ...newTenant, name: e.target.value })
                }
                required
              />

              <input
                type="text"
                placeholder="Phone"
                className="p-2 border rounded"
                value={newTenant.phone}
                onChange={(e) =>
                  setNewTenant({ ...newTenant, phone: e.target.value })
                }
              />

              <input
                type="email"
                placeholder="Email"
                className="p-2 border rounded"
                value={newTenant.email}
                onChange={(e) =>
                  setNewTenant({ ...newTenant, email: e.target.value })
                }
              />

              {/* Available rooms dropdown */}
              <select
                className="p-2 border rounded"
                value={newTenant.room_id}
                onChange={(e) =>
                  setNewTenant({ ...newTenant, room_id: e.target.value })
                }
              >
                <option value="">Select Room</option>
                {availableRooms.map((room) => (
                  <option key={room.id} value={room.id}>
                    {room.room_no}
                  </option>
                ))}
              </select>

              <input
                type="number"
                placeholder="Deposit Amount"
                className="p-2 border rounded"
                value={newTenant.deposit_amount}
                onChange={(e) =>
                  setNewTenant({ ...newTenant, deposit_amount: e.target.value })
                }
              />

              <label className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={newTenant.deposit_paid}
                  onChange={(e) =>
                    setNewTenant({
                      ...newTenant,
                      deposit_paid: e.target.checked,
                    })
                  }
                />
                Deposit Paid
              </label>
            </div>

            <div className="mt-4 flex gap-2">
              <button
                type="submit"
                className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 text-sm"
              >
                Save
              </button>
              <button
                type="button"
                onClick={() => setShowForm(false)}
                className="px-4 py-2 border rounded text-sm"
              >
                Cancel
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
