// This file ensures that server-only dependencies are traced by Next.js 
// so they are included in the .next/standalone/node_modules folder.
import 'socket.io';
import 'dotenv';

export const forceBundle = () => {
    // No-op
};
