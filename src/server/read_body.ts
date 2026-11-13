import { IncomingMessage } from 'http'

/**
 * Reads the full request body as text.
 * @param request request
 * @returns body text
 */
export function read_body(request: IncomingMessage): Promise<string>
{
    return new Promise((resolve, reject) =>
    {
        const chunks: Buffer[] = []
        request.on('data', chunk => chunks.push(Buffer.from(chunk)))
        request.on('end', () => resolve(Buffer.concat(chunks).toString('utf8')))
        request.on('error', reject)
    })
}
