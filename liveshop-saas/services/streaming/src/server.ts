import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import * as mediasoup from 'mediasoup';
import * as dotenv from 'dotenv';
import * as os from 'os';

dotenv.config();

const app = express();
const server = createServer(app);
const io = new Server(server, { cors: { origin: '*' } });

// Mediasoup workers
const workers: mediasoup.types.Worker[] = [];
let workerIdx = 0;

const createWorkers = async () => {
    const numWorkers = os.cpus().length;
    for (let i = 0; i < numWorkers; i++) {
        const worker = await mediasoup.createWorker({
            logLevel: 'warn',
            rtcMinPort: 10000,
            rtcMaxPort: 10100,
        });

        worker.on('died', () => {
            console.error('mediasoup worker died, exiting in 2 seconds... [pid:%d]', worker.pid);
            setTimeout(() => process.exit(1), 2000);
        });

        workers.push(worker);
    }
};

const getWorker = () => {
    const worker = workers[workerIdx];
    workerIdx = (workerIdx + 1) % workers.length;
    return worker;
};

// Rooms map
const rooms = new Map<string, {
    router: mediasoup.types.Router;
    producers: Map<string, mediasoup.types.Producer>;
    consumers: Map<string, mediasoup.types.Consumer>;
}>();

io.on('connection', (socket) => {
    console.log('Client connected:', socket.id);

    socket.on('join-room', async ({ roomId }, callback) => {
        socket.join(roomId);

        if (!rooms.has(roomId)) {
            const worker = getWorker();
            const mediaCodecs: mediasoup.types.RtpCodecCapability[] = [
                {
                    kind: 'audio',
                    mimeType: 'audio/opus',
                    clockRate: 48000,
                    channels: 2,
                },
                {
                    kind: 'video',
                    mimeType: 'video/VP8',
                    clockRate: 90000,
                    parameters: {
                        'x-google-start-bitrate': 1000
                    }
                },
            ];

            const router = await worker.createRouter({ mediaCodecs });
            rooms.set(roomId, { router, producers: new Map(), consumers: new Map() });
        }

        const room = rooms.get(roomId)!;
        const rtpCapabilities = room.router.rtpCapabilities;

        callback({ rtpCapabilities });
    });

    socket.on('create-transport', async ({ roomId, direction }, callback) => {
        const room = rooms.get(roomId);
        if (!room) return;

        try {
            const transport = await room.router.createWebRtcTransport({
                listenIps: [{ ip: '0.0.0.0', announcedIp: process.env.PUBLIC_IP || '127.0.0.1' }],
                enableUdp: true,
                enableTcp: true,
                preferUdp: true,
            });

            // Handle transport events
            transport.on('dtlsstatechange', (dtlsState) => {
                if (dtlsState === 'closed') {
                    transport.close();
                }
            });

            transport.on('close', () => {
                console.log('transport closed');
            });

            callback({
                id: transport.id,
                iceParameters: transport.iceParameters,
                iceCandidates: transport.iceCandidates,
                dtlsParameters: transport.dtlsParameters,
            });
        } catch (error) {
            console.error('Error creating transport:', error);
            callback({ error: (error as Error).message });
        }
    });

    // Connect transport
    socket.on('connect-transport', async ({ roomId, transportId, dtlsParameters }, callback) => {
        const room = rooms.get(roomId);
        if (!room) return;

        // Find transport logic would involve more complex mapping but simplified here
        // In a real app we'd map transportId to the transport object
        // This part is simplified as the original guide didn't include full transport management logic
        // We assume the transport object is accessible via some map or closure context
        // This is a placeholder for actual connect logic
        callback({});
    });

    // Produce
    socket.on('produce', async ({ roomId, transportId, kind, rtpParameters }, callback) => {
        const room = rooms.get(roomId);
        if (!room) return;

        // Simplified: need valid transport to produce
        // const producer = await transport.produce({ kind, rtpParameters });
        // room.producers.set(producer.id, producer);
        // callback({ id: producer.id });
    });

    // Consume logic...

    socket.on('disconnect', () => {
        console.log('Client disconnected:', socket.id);
    });
});

// Start
const PORT = process.env.PORT || 3002;
createWorkers().then(() => {
    server.listen(PORT, () => {
        console.log(`Streaming server running on port ${PORT}`);
        console.log(`Mediasoup workers: ${workers.length}`);
    });
});
