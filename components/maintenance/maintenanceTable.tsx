"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";

type MaintenanceRequest = {
  id: number;
  issue: string;
  status: "open" | "in_progress" | "resolved";
  room: {
    room_no: string;
  };
};

export default function MaintenanceTable() {
  const [requests, setRequests] = useState<MaintenanceRequest[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [issue, setIssue] = useState("");
  const [roomId, setRoomId] = useState("");
  const [rooms, setRooms] = useState<{ id: number; room_no: string }[]>([]);

  useEffect(() => {
    fetchRequests();
    fetchRooms();
  }, []);

  async function fetchRequests() {
    const { data } = await supabase
      .from("maintenance_requests")
      .select(
        `
        id,
        issue,
        status,
        room:rooms (
          room_no
        )
      `
      )
      .order("created_at", { ascending: false });

    if (data) setRequests(data as any);
  }

  async function fetchRooms() {
    const { data } = await supabase
      .from("rooms")
      .select("id, room_no")
      .order("room_no");

    if (data) setRooms(data);
  }

  async function addRequest(e: React.FormEvent) {
    e.preventDefault();

    if (!issue || !roomId) return;

    await supabase.from("maintenance_requests").insert([
      {
        issue,
        room_id: Number(roomId),
        status: "open",
      },
    ]);

    setIssue("");
    setRoomId("");
    setShowForm(false);
    fetchRequests();
  }

  async function updateStatus(id: number, status: string) {
    await supabase
      .from("maintenance_requests")
      .update({ status })
      .eq("id", id);

    fetchRequests();
  }

  return (
    <div className="bg-white p-4 rounded shadow">
      {/* Add button */}
      {!showForm && (
        <button
          onClick={() => setShowForm(true)}
          className="mb-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 text-sm"
        >
          + Add Request
        </button>
      )}

      {/* Inline form */}
      {showForm && (
        <form
          onSubmit={addRequest}
          className="mb-6 p-4 border rounded bg-gray-50"
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <select
              className="border p-2 rounded"
              value={roomId}
              onChange={(e) => setRoomId(e.target.value)}
              required
            >
              <option value="">Select Room</option>
              {rooms.map((r) => (
                <option key={r.id} value={r.id}>
                  {r.room_no}
                </option>
              ))}
            </select>

            <input
              type="text"
              placeholder="Issue description"
              className="border p-2 rounded"
              value={issue}
              onChange={(e) => setIssue(e.target.value)}
              required
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

      {/* Table */}
      <table className="min-w-full border border-gray-200">
        <thead className="bg-gray-100">
          <tr>
            <th className="p-3 text-left">Room</th>
            <th className="p-3 text-left">Issue</th>
            <th className="p-3 text-left">Status</th>
          </tr>
        </thead>
        <tbody>
          {requests.map((r) => (
            <tr key={r.id} className="border-t">
              <td className="p-3">{r.room.room_no}</td>
              <td className="p-3">{r.issue}</td>
              <td className="p-3">
                <select
                  value={r.status}
                  onChange={(e) => updateStatus(r.id, e.target.value)}
                  className="border p-1 rounded"
                >
                  <option value="open">Open</option>
                  <option value="in_progress">In Progress</option>
                  <option value="resolved">Resolved</option>
                </select>
              </td>
            </tr>
          ))}

          {requests.length === 0 && (
            <tr>
              <td colSpan={3} className="p-4 text-center text-gray-500">
                No maintenance requests
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
