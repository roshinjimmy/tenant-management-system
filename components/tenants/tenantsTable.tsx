"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";

type Tenant = {
  id: number;
  name: string;
  phone: string | null;
  email: string | null;
  address: string | null;
  room_id: number | null;
};


export default function TenantsTable() {
  const [tenants, setTenants] = useState<Tenant[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [newTenant, setNewTenant] = useState({
    name: "",
    phone: "",
    email: "",
    address: "",
    room_id: "",
  });

  useEffect(() => {
    fetchTenants();
  }, []);

  async function fetchTenants() {
    setLoading(true);
    const { data, error } = await supabase
      .from("tenants")
      .select("*")
      .order("id");

    if (!error && data) {
      setTenants(data);
    }
    setLoading(false);
  }

  async function deleteTenant(id: number) {
    await supabase.from("tenants").delete().eq("id", id);
    setTenants((prev) => prev.filter((t) => t.id !== id));
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
      },
    ]);

    if (!error) {
      setNewTenant({
        name: "",
        phone: "",
        email: "",
        address: "",
        room_id: "",
      });
      setShowForm(false);
      fetchTenants();
    }
  }

  if (loading) {
    return <p>Loading tenants...</p>;
  }

  return (
    <div className="overflow-x-auto bg-white rounded-lg shadow">
      <table className="min-w-full border border-gray-200">
        <thead className="bg-gray-100">
          <tr>
            <th className="p-3 text-left text-sm font-medium text-gray-700">
              Name
            </th>
            <th className="p-3 text-left text-sm font-medium text-gray-700">
              Phone
            </th>
            <th className="p-3 text-left text-sm font-medium text-gray-700">
              Room
            </th>
            <th className="p-3 text-left text-sm font-medium text-gray-700">
              Actions
            </th>
          </tr>
        </thead>
        <tbody>
          {tenants.map((tenant) => (
            <tr
              key={tenant.id}
              className="border-t hover:bg-gray-50 transition"
            >
              <td className="p-3">{tenant.name}</td>
              <td className="p-3">{tenant.phone ?? "-"}</td>
              <td className="p-3">{tenant.room_id ?? "Vacant"}</td>
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

              <input
                type="text"
                placeholder="Room ID"
                className="p-2 border rounded"
                value={newTenant.room_id}
                onChange={(e) =>
                  setNewTenant({ ...newTenant, room_id: e.target.value })
                }
              />
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
