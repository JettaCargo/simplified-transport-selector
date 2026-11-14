/**
 * Whether the service is shutting down and must stop receiving traffic.
 */
export class ServiceReadiness
{
    private shutting_down = false

    /**
     * Marks the service as draining; readiness stays down from now on.
     */
    begin_shutdown(): void
    {
        this.shutting_down = true
    }

    /**
     * @returns whether shutdown has started
     */
    is_shutting_down(): boolean
    {
        return this.shutting_down
    }
}
