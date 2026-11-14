const { expect } = require('chai')
const { parse_request } = require('../../../../../build/core/input/request/parse_request')
const { expand_divisible_groups } = require('../../../../../build/core/selection/groups/expand_divisible_groups')
const { build_aggregated_model } = require('../../../../../build/core/solver/model/build_aggregated_model')

describe('aggregated model size', function ()
{
    it('keeps variables linear in groups × types, not fleet copies', function ()
    {
        const groups = 26
        const types = 7
        const payload = {
            gapVolume: 0,
            gapWeight: 0,
            config: { minimum_required_volume: 0, minimum_required_supported_weight: 0 },
            vehicles: Array.from({ length: types }, (_, index) => ({
                id: `type_${index}`,
                name: `Type ${index}`,
                amount: 1,
                unlimited: true,
                cost: index,
                supported_weight: 30000,
                containers: [{
                    id: `container_${index}`,
                    name: `Container ${index}`,
                    length: 14,
                    width: 2.5,
                    height: 2.5,
                    supported_weight: 30000,
                }],
            })),
            collects: Array.from({ length: groups }, (_, index) => ({
                id: `group_${index}`,
                restrictedToVehicles: [],
                items: [{
                    id: String(index),
                    name: `Item ${index}`,
                    amount: 1,
                    weight: 500,
                    length: 1,
                    width: 1,
                    height: 1,
                    volume: 1,
                    rotations: ['POS1'],
                    current_rotation: 'POS1',
                }],
            })),
        }
        const request = parse_request(payload)
        request.groups = expand_divisible_groups(request.groups, request.vehicles, request.gaps)
        const model = build_aggregated_model(request)
        expect(model.assignment_keys.length).to.equal(groups * types)
        expect(model.count_keys.length).to.equal(types)
        expect(model.assignment_keys.length + model.count_keys.length).to.be.below(300)
    })
})
