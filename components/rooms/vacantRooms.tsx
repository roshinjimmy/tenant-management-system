"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";

type Room = {
  id: number;
  room_no: string;
  floor: number;
  extra_facilities: string | null;
};

export default function VacantRooms() {
  const [rooms, setRooms] = useState<Room[]>([]);

  useEffect(() => {
    fetchVacantRooms();
  }, []);

  async function fetchVacantRooms() {
    // 1. Get occupied room IDs
    const { data: occupied, error: occError } = await supabase
      .from("tenants")
      .select("room_id")
      .not("room_id", "is", null);

    if (occError) return;

    const occupiedRoomIds = occupied.map((t) => t.room_id);

    // 2. Get rooms that are NOT occupied
    let query = supabase
      .from("rooms")
      .select("id, room_no, floor, extra_facilities")
      .order("floor")
      .order("room_no");

    if (occupiedRoomIds.length > 0) {
      query = query.not("id", "in", `(${occupiedRoomIds.join(",")})`);
    }

    const { data: vacantRooms, error } = await query;

    if (!error && vacantRooms) {
      setRooms(vacantRooms);
    }
  }

  return (
    <div>
      {rooms.length === 0 ? (
        <p className="text-gray-500">No vacant rooms available.</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {rooms.map((room) => (
            <div
              key={room.id}
              className="bg-white p-4 rounded shadow hover:shadow-md transition"
            >
              <h2 className="text-lg font-medium mb-1">Room {room.room_no}</h2>

              <p className="text-sm text-gray-600 mb-1">Floor {room.floor}</p>

              <p className="text-sm text-gray-600 mb-4">
                Facilities: {room.extra_facilities || "Not specified"}
              </p>

              <span className="inline-block px-2 py-1 text-xs rounded bg-green-100 text-green-700">
                Available
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
