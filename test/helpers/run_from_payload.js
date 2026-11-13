const fs = require('fs')
const path = require('path')
const { select_transports } = require('../../build/index')

const FIXTURE_DIR = path.join(__dirname, '../data/from_payload')

/**
 * Loads a from_payload fixture and runs the selector.
 * @param {string} file_name fixture file name
 * @returns {Promise<object>} selector response
 */
async function run_with_file(file_name)
{
    const payload = JSON.parse(fs.readFileSync(path.join(FIXTURE_DIR, file_name), 'utf8'))
    return select_transports(payload)
}

module.exports = { run_with_file, FIXTURE_DIR }
