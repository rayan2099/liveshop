'use client';

import { ShieldAlert, Home, ChevronLeft } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function UnauthorizedPage() {
    const router = useRouter();

    return (
        <div className="min-h-screen bg-void flex items-center justify-center px-4">
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-neon-pink/10 rounded-full blur-[150px]" />
                <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-neon-cyan/10 rounded-full blur-[150px]" />
            </div>

            <div className="relative glass rounded-3xl p-12 max-w-md w-full text-center border-neon-pink/20">
                <div className="w-20 h-20 rounded-2xl bg-neon-pink/10 flex items-center justify-center mx-auto mb-6">
                    <ShieldAlert className="w-10 h-10 text-neon-pink" />
                </div>
                <h1 className="font-display font-bold text-3xl mb-2">Access Denied</h1>
                <p className="text-white/60 mb-8 leading-relaxed">
                    You don't have permission to access this page. This might be because of your account role.
                </p>

                <div className="grid gap-4">
                    <Link href="/" className="btn-primary w-full py-4 flex items-center justify-center gap-2">
                        <Home className="w-5 h-5" />
                        Back to Home
                    </Link>
                    <button
                        onClick={() => router.back()}
                        className="text-white/40 hover:text-white transition-colors text-sm flex items-center justify-center gap-2"
                    >
                        <ChevronLeft className="w-4 h-4" />
                        Go Back
                    </button>
                </div>
            </div>
        </div>
    );
}
