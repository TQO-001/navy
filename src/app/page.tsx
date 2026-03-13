import Link from "next/link"
import Image from 'next/image';
import { Anchor } from "lucide-react"

export default function HomePage() {
  return (
    <div className="min-h-screen bg-[#05070a] flex flex-col items-center justify-center px-4 text-center selection:bg-blue-500/30">
      {/* Subtle background glow to match the app aesthetic */}
      <div className="fixed top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-600/10 blur-[120px] rounded-full -z-10" />
      
      {/* Logo */}
      <div className="flex flex-col items-center gap-3 mb-10 group">
        <h1 className="text-4xl font-semibold text-white tracking-tight mb-2 uppercase drop-shadow-[0_0_12px_rgba(59,130,246,0.8)]">
          NAVY
        </h1>
        <div className="flex justify-center mb-4">
          <Image 
            src="/logo.png" 
            alt="Navy Logo" 
            width={104} 
            height={104} 
            className="object-contain drop-shadow-[0_0_10px_rgba(59,130,246,0.5)]"
          />
        </div>
      </div>

      <h1 className="text-5xl font-bold mb-5 max-w-lg leading-tight text-white tracking-tight">
        Your job search,<br />organised.
      </h1>
      
      <p className="text-lg mb-12 max-w-sm text-gray-500 leading-relaxed">
        Track every application — from wishlist to offer — with a Kanban board, calendar, and more.
      </p>

      <div className="flex gap-4">
        <Link
          href="/register"
          className="px-7 py-3.5 text-sm font-bold text-white bg-blue-600 rounded-2xl hover:bg-blue-500 hover:scale-[1.02] active:scale-95 transition-all shadow-[0_0_20px_rgba(37,99,235,0.3)]"
        >
          Get started free
        </Link>
        <Link
          href="/login"
          className="px-7 py-3.5 text-sm font-semibold text-gray-300 bg-white/5 border border-white/10 rounded-2xl hover:bg-white/10 hover:text-white transition-all"
        >
          Sign in
        </Link>
      </div>
    </div>
  )
}