import { sendPasswordResetEmail } from '../services/email';
import * as dotenv from 'dotenv';
import * as path from 'path';

// Load .env from root
dotenv.config({ path: path.resolve(__dirname, '../../../../.env') });

async function testResend() {
    console.log('Testing Resend Integration...');
    console.log('RESEND_API_KEY:', process.env.RESEND_API_KEY ? 'Present' : 'Missing');
    console.log('FROM_EMAIL:', process.env.FROM_EMAIL);

    try {
        await sendPasswordResetEmail(
            'rayansabih@protonmail.com',
            'Rayan',
            'test-token-123'
        );
        console.log('✅ Email sent successfully via Resend!');
    } catch (error) {
        console.error('❌ Failed to send email:', error);
    }
}

testResend();
