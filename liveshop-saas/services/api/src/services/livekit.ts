import { AccessToken } from 'livekit-server-sdk';
import * as dotenv from 'dotenv';

dotenv.config();

export class LiveKitService {
    private apiKey: string;
    private apiSecret: string;

    constructor() {
        this.apiKey = process.env.LIVEKIT_API_KEY || 'devkey';
        this.apiSecret = process.env.LIVEKIT_API_SECRET || 'secret';
    }

    /**
     * Generate a participant token for a LiveKit room
     */
    async generateToken(roomId: string, participantName: string, isPublisher: boolean = false) {
        const at = new AccessToken(this.apiKey, this.apiSecret, {
            identity: participantName,
        });

        at.addGrant({
            roomJoin: true,
            room: roomId,
            canPublish: isPublisher,
            canSubscribe: true,
            canPublishData: true,
        });

        return at.toJwt();
    }
}

export const liveKitService = new LiveKitService();
