import { StreamCard } from '@/components/streams/StreamCard';

// Temporary mock data
const mockStreams = [
    {
        id: '1',
        title: 'New Spring Collection Launch!',
        storeName: 'Fashion Forward',
        thumbnailUrl: 'https://images.unsplash.com/photo-1483985988355-763728e1935b?w=800&auto=format&fit=crop&q=60',
        viewerCount: 1205,
        isLive: true,
        avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=64&h=64&auto=format&fit=crop&q=80'
    },
    {
        id: '2',
        title: 'Cooking Demo: Italian Pasta',
        storeName: 'Chef\'s Kitchen',
        thumbnailUrl: 'https://images.unsplash.com/photo-1556910103-1c02745a30bf?w=800&auto=format&fit=crop&q=60',
        viewerCount: 850,
        isLive: true,
        avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=64&h=64&auto=format&fit=crop&q=80'
    },
    {
        id: '3',
        title: 'Live Review: Tech Gadgets 2026',
        storeName: 'Tech World',
        thumbnailUrl: 'https://images.unsplash.com/photo-1519389950473-47ba0277781c?w=800&auto=format&fit=crop&q=60',
        viewerCount: 3400,
        isLive: true,
        avatarUrl: 'https://images.unsplash.com/photo-1531427186611-ecfd6d936c79?w=64&h=64&auto=format&fit=crop&q=80'
    },
    {
        id: '4',
        title: 'Handmade Jewelry Showcase',
        storeName: 'Artisan Gems',
        thumbnailUrl: 'https://images.unsplash.com/photo-1573408301185-a1d31f667545?w=800&auto=format&fit=crop&q=60',
        viewerCount: 450,
        isLive: false, // Scheduled
        avatarUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=64&h=64&auto=format&fit=crop&q=80'
    }
];

export default function CustomerHomePage() {
    return (
        <div className="container mx-auto px-4 py-8 space-y-12">
            {/* Hero Section */}
            <section className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-purple-900 via-indigo-900 to-blue-900 p-8 text-white shadow-2xl">
                <div className="relative z-10 max-w-2xl">
                    <h1 className="mb-4 text-4xl font-extrabold tracking-tight sm:text-5xl">
                        Experience Shopping <span className="text-transparent bg-clip-text bg-gradient-to-r from-pink-400 to-purple-400">Live</span>
                    </h1>
                    <p className="mb-8 text-lg text-gray-200">
                        Discover real-time product demos, chat with store owners, and buy instantly while watching.
                    </p>
                    <button className="rounded-full bg-white px-8 py-3 text-lg font-semibold text-indigo-900 transition-transform hover:scale-105 hover:bg-gray-100">
                        Start Watching
                    </button>
                </div>

                {/* Decorative elements */}
                <div className="absolute -right-20 -top-20 h-96 w-96 rounded-full bg-purple-500/20 blur-3xl"></div>
                <div className="absolute -bottom-20 -left-20 h-72 w-72 rounded-full bg-blue-500/20 blur-3xl"></div>
            </section>

            {/* Live Now */}
            <section>
                <div className="mb-6 flex items-center justify-between">
                    <h2 className="text-2xl font-bold flex items-center gap-2">
                        <span className="flex h-3 w-3 relative">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
                        </span>
                        Live Now
                    </h2>
                    <a href="/streams" className="text-sm font-medium text-indigo-600 hover:text-indigo-500">
                        View all &rarr;
                    </a>
                </div>

                <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                    {mockStreams.filter(s => s.isLive).map((stream) => (
                        <StreamCard
                            key={stream.id}
                            {...stream}
                        />
                    ))}
                </div>
            </section>

            {/* Upcoming / Scheduled */}
            <section>
                <div className="mb-6 flex items-center justify-between">
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Upcoming Streams</h2>
                    <a href="/schedule" className="text-sm font-medium text-indigo-600 hover:text-indigo-500">
                        View schedule &rarr;
                    </a>
                </div>

                <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                    {mockStreams.filter(s => !s.isLive).map((stream) => (
                        <StreamCard
                            key={stream.id}
                            {...stream}
                        />
                    ))}
                </div>
            </section>

            {/* Featured Categories (Optional) */}
            <section>
                <h2 className="mb-6 text-2xl font-bold text-gray-900 dark:text-white">Explore Categories</h2>
                <div className="grid grid-cols-2 gap-4 md:grid-cols-4 lg:grid-cols-6">
                    {['Fashion', 'Beauty', 'Electronics', 'Home', 'Food', 'Art'].map((cat) => (
                        <a
                            key={cat}
                            href={`/category/${cat.toLowerCase()}`}
                            className="flex h-24 items-center justify-center rounded-lg bg-gray-100 p-4 text-center font-medium text-gray-700 transition-colors hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-200 dark:hover:bg-gray-700"
                        >
                            {cat}
                        </a>
                    ))}
                </div>
            </section>
        </div>
    );
}
