import Link from 'next/link';
import Image from 'next/image';

interface StreamCardProps {
    id: string;
    title: string;
    storeName: string;
    thumbnailUrl: string;
    viewerCount: number;
    isLive: boolean;
    avatarUrl?: string; // Optional store avatar
}

export function StreamCard({
    id,
    title,
    storeName,
    thumbnailUrl,
    viewerCount,
    isLive,
    avatarUrl
}: StreamCardProps) {
    return (
        <Link
            href={`/streams/${id}`}
            className="group relative block aspect-video overflow-hidden rounded-xl bg-gray-900 shadow-lg transition-transform hover:scale-[1.02]"
        >
            {/* Thumbnail */}
            <div className="absolute inset-0">
                <Image
                    src={thumbnailUrl || '/placeholder-stream.jpg'}
                    alt={title}
                    fill
                    className="object-cover transition-opacity group-hover:opacity-90"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
            </div>

            {/* Live Badge */}
            {isLive && (
                <div className="absolute left-3 top-3 flex items-center gap-1.5 rounded bg-red-600 px-2 py-1 text-xs font-bold text-white shadow-sm">
                    <span className="relative flex h-2 w-2">
                        <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-white opacity-75"></span>
                        <span className="relative inline-flex h-2 w-2 rounded-full bg-white"></span>
                    </span>
                    LIVE
                </div>
            )}

            {/* Viewer Count */}
            <div className="absolute right-3 top-3 rounded bg-black/50 px-2 py-1 text-xs font-medium text-white backdrop-blur-sm">
                {viewerCount.toLocaleString()} viewers
            </div>

            {/* Info */}
            <div className="absolute bottom-0 left-0 right-0 p-4">
                <div className="flex items-center gap-3">
                    {avatarUrl && (
                        <div className="relative h-10 w-10 overflow-hidden rounded-full border-2 border-primary">
                            <Image src={avatarUrl} alt={storeName} fill className="object-cover" />
                        </div>
                    )}
                    <div className="flex-1 min-w-0">
                        <h3 className="truncate text-base font-semibold text-white group-hover:text-primary-400">
                            {title}
                            ,</h3>
                        <p className="truncate text-sm text-gray-300">{storeName}</p>
                    </div>
                </div>
            </div>
        </Link>
    );
}
