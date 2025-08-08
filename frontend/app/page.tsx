"use client"
import Topbar from "@/components/topbar";
import { useAuthRedirect } from "@/hooks/client"

export default function Home() {

  const {authenticated, queryComplete} = useAuthRedirect()

  return (
    <>
      <Topbar authenticated={authenticated} authLoading={!queryComplete} />
      <div className="grid grid-rows-[20px_1fr_20px] items-center justify-items-center min-h-screen p-8 pb-20 gap-16 sm:p-20 font-[family-name:var(--font-geist-sans)]">
        <p>Hello! This is the landing page. The future of Learn ASL</p>
      </div>
    </>
  );
}