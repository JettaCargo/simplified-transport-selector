import { Readable } from 'stream'
import { RequestAbortedException } from '../../core/solver/pool/errors/Request_Aborted_Exception'
import { PayloadTooLargeException } from './Payload_Too_Large_Exception'

/**
 * Body text collected so far and whether reading is over.
 */
interface Body_Reading
{
    chunks: Buffer[]
    size: number
    done: boolean
}

/**
 * Reads the full request body as text, bounded in size.
 * Rejects as soon as the limit is passed or the client goes away.
 * @param request request stream
 * @param max_body_bytes largest accepted body
 * @returns body text
 */
export function read_body(request: Readable, max_body_bytes: number): Promise<string>
{
    const reading: Body_Reading = { chunks: [], size: 0, done: false }
    return new Promise((resolve, reject) =>
    {
        request.on('data', chunk => collect_chunk(reading, Buffer.from(chunk), { max_body_bytes, reject }))
        request.on('end', () => finish(reading, () => resolve(Buffer.concat(reading.chunks).toString('utf8'))))
        request.on('close', () => finish(reading, () => reject(new RequestAbortedException())))
        request.on('error', error => finish(reading, () => reject(error)))
    })
}

/**
 * @param reading body so far
 * @param chunk next chunk
 * @param limit size limit and the rejection callback
 */
function collect_chunk(
    reading: Body_Reading,
    chunk: Buffer,
    limit: { max_body_bytes: number, reject: (error: Error) => void },
): void
{
    if (reading.done)
    {
        return
    }
    reading.size += chunk.length
    if (reading.size > limit.max_body_bytes)
    {
        finish(reading, () => limit.reject(new PayloadTooLargeException(limit.max_body_bytes)))
        return
    }
    reading.chunks.push(chunk)
}

/**
 * Settles the read once.
 * @param reading body so far
 * @param settle settle callback
 */
function finish(reading: Body_Reading, settle: () => void): void
{
    if (reading.done)
    {
        return
    }
    reading.done = true
    settle()
}
