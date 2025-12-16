import VacantRooms from "@/components/rooms/vacantRooms";

export default function RoomsPage() {
  return (
    <div className="max-w-6xl mx-auto p-6">
      <h1 className="text-2xl font-semibold mb-6">Available Rooms</h1>
      <VacantRooms />
    </div>
  );
}
