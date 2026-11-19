const { expect } = require('chai')
const { resolve_trace_id } = require('../../../src/trace/resolve_trace_id')

describe('resolve_trace_id', () =>
{
    it('returns payload.trace_id when present', () =>
    {
        expect(resolve_trace_id({ trace_id: 'portal-trace&1' })).to.equal('portal-trace&1')
    })

    it('returns null when trace_id is missing', () =>
    {
        expect(resolve_trace_id({})).to.equal(null)
        expect(resolve_trace_id({ trace_id: '' })).to.equal(null)
        expect(resolve_trace_id({ trace_id: null })).to.equal(null)
    })
})
