import { ServiceReadiness } from './Service_Readiness'

/**
 * Process-wide readiness flag used by the probes and the shutdown handler.
 */
export const shared_service_readiness = new ServiceReadiness()
