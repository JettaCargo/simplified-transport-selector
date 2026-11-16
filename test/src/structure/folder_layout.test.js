const { expect } = require('chai')
const fs = require('fs')
const path = require('path')

const REPOSITORY_ROOT = path.join(__dirname, '../../..')
const GRANULAR_FOLDERS = [
    'core/input',
    'core/selection',
    'core/solver',
    'core/feedback',
    'core/scale',
    'core/messages',
    'server',
    'heartbeat',
]

/**
 * @param {string} relative_folder folder relative to the repository root
 * @param {string} suffix file suffix
 * @returns {string[]} files with the suffix sitting directly in the folder
 */
function loose_files(relative_folder, suffix)
{
    const folder = path.join(REPOSITORY_ROOT, relative_folder)
    if (!fs.existsSync(folder))
    {
        return []
    }
    return fs.readdirSync(folder, { withFileTypes: true })
        .filter(entry => entry.isFile() && entry.name.endsWith(suffix))
        .map(entry => `${relative_folder}/${entry.name}`)
}

describe('folder layout', function ()
{
    it('has no technical-layer types folder', function ()
    {
        expect(fs.existsSync(path.join(REPOSITORY_ROOT, 'src/core/types'))).to.equal(false)
    })

    it('keeps no source file directly in a domain root folder', function ()
    {
        const leftovers = GRANULAR_FOLDERS.flatMap(folder => loose_files(`src/${folder}`, '.ts'))
        expect(leftovers).to.deep.equal([])
    })

    it('keeps no test file directly in a domain root folder', function ()
    {
        const leftovers = GRANULAR_FOLDERS.flatMap(folder => loose_files(`test/src/${folder}`, '.test.js'))
        expect(leftovers).to.deep.equal([])
    })

    it('keeps test data only under test/data/src', function ()
    {
        const entries = fs.readdirSync(path.join(REPOSITORY_ROOT, 'test/data'))
        expect(entries).to.deep.equal(['src'])
    })
})
