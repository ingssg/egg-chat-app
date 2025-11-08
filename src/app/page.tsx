"use client";
import { useRouter } from "next/navigation";

export default function Home() {
  const router = useRouter();

  return (
    <main className="w-full h-screen flex justify-center items-center">
      <div>
        <p className="text-5xl font-bold text-center mb-12">에그톡</p>
        <button
          className="w-96 h-12 bg-amber-400 hover:bg-primary-700 focus:ring-4 focus:outline-none focus:ring-primary-300 font-bold rounded-lg px-5 py-2.5 text-center mb-1 custom-shadow text-2xl"
          onClick={() => router.push("/main")}
        >
          시작하기
        </button>
      </div>
    </main>
  );
}
