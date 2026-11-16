const { expect } = require('chai')
const { z } = require('zod')
const { number_schema } = require('../../../../../../build/core/input/schema/number/number_schema')

describe('number schema', function ()
{
    const decimal_schema = number_schema(z.number())
    const integer_schema = number_schema(z.number().int())
    const default_schema = number_schema(z.number().default(0))

    it('keeps a finite number and trims a decimal string', function ()
    {
        expect(decimal_schema.parse(1.5)).to.equal(1.5)
        expect(decimal_schema.parse(' 203.94 ')).to.equal(203.94)
        expect(decimal_schema.parse('-1.5')).to.equal(-1.5)
        expect(decimal_schema.parse('0.0')).to.equal(0)
        expect(decimal_schema.parse('1e2')).to.equal(100)
        expect(integer_schema.parse('2.0')).to.equal(2)
    })

    it('rejects strings that are not finite decimals', function ()
    {
        expect(() => decimal_schema.parse('')).to.throw()
        expect(() => decimal_schema.parse('0x10')).to.throw()
        expect(() => decimal_schema.parse('1,5')).to.throw()
        expect(() => decimal_schema.parse(true)).to.throw()
        expect(() => integer_schema.parse('2.5')).to.throw()
    })

    it('keeps the default when the value is missing', function ()
    {
        expect(default_schema.parse(undefined)).to.equal(0)
    })
})
