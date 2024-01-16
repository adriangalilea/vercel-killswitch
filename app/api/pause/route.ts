import crypto from 'crypto';

const HTTP_STATUS_OK = 200;
const HTTP_STATUS_FORBIDDEN = 403;
const HTTP_STATUS_INTERNAL_SERVER_ERROR = 500;

async function verifySignature(request: Request): Promise<boolean> {
    const secret = process.env.VERCEL_PANIC_SECRET;

    if (!secret || typeof secret !== 'string') {
        console.error('panic-automatic-pause: VERCEL_PANIC_SECRET is missing or invalid');
        throw new Error('Server configuration error');
    }
    
    const body = await request.json();
    const bodyBuffer = Buffer.from(JSON.stringify(body));
    const bodySignature = crypto
        .createHmac('sha1', secret)
        .update(bodyBuffer)
        .digest('hex');

    return bodySignature === request.headers.get('x-vercel-signature');
}

export async function POST(request: Request): Promise<Response> {
    console.log('request', request)
    try {
        const projectId = process.env.VERCEL_PROJECT_ID;
        const teamId = process.env.VERCEL_TEAM_ID;
        const token = process.env.VERCEL_PANIC_TOKEN;

        if ([projectId, teamId, token].some(v => !v || typeof v !== 'string')) {
            console.error('panic-automatic-pause: missing or invalid environment variables');
            return new Response('Server configuration error', { status: HTTP_STATUS_INTERNAL_SERVER_ERROR });
        }
        
        const isSignatureValid = await verifySignature(request);
        if (!isSignatureValid) {
            return new Response('Invalid signature', { status: HTTP_STATUS_FORBIDDEN });
        }
      
        const response = await fetch(`https://api.vercel.com/v1/projects/${projectId}/pause?teamId=${teamId}`, {
            headers: {
                Authorization: `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
            method: 'POST'
        });

        if (!response.ok) {
            throw new Error(`Error pausing project: ${response.statusText}`);
        }
      
        return new Response('Project paused', { status: HTTP_STATUS_OK });
    } catch (error) {
        console.error(`An error occurred: ${error instanceof Error ? error.message : 'Unknown error'}`);
        return new Response('An internal server error occurred', { status: HTTP_STATUS_INTERNAL_SERVER_ERROR });
    }
}