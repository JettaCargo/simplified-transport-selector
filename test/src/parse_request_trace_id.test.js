const { expect } = require('chai')
const { parse_request } = require('../../src/parse_request')

describe('parse_request trace_id', () =>
{
    it('keeps payload.trace_id on the parsed request', () =>
    {
        const request = parse_request({
            trace_id: 'portal-trace&1',
            log_header: 'sel-0',
            vehicles: [],
            collects: [],
        })
        expect(request.trace_id).to.equal('portal-trace&1')
        expect(request.log_header).to.equal('sel-0')
    })

    it('sets trace_id to null when absent', () =>
    {
        const request = parse_request({ vehicles: [], collects: [] })
        expect(request.trace_id).to.equal(null)
    })
})
