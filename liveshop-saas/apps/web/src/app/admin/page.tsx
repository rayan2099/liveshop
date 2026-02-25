'use client';
import Link from 'next/link';

export default function AdminPlaceholderPage() {
    return (
        <div className="min-h-screen bg-void flex items-center justify-center px-4 text-center">
            <div className="glass rounded-3xl p-8 max-w-md w-full">
                <h1 className="text-2xl font-bold mb-4">Admin Dashboard</h1>
                <p className="text-white/60 mb-6">The global admin dashboard is coming soon. Please contact the system administrator.</p>
                <Link href="/" className="text-neon-pink hover:underline">Back to Home</Link>
            </div>
        </div>
    );
}
