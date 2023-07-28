import Image from "next/image";
import PixelCanvas from "./components/PixelCanvas";

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-between p-24 bg-white">
      <PixelCanvas />
    </main>
  );
}
