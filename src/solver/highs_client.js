let highs_promise = null

/**
 * Lazy-loads the HiGHS WASM module once.
 * @returns {Promise<{solve: Function}>}
 */
async function get_highs()
{
    if (!highs_promise)
        highs_promise = require('highs')()
    return highs_promise
}

/**
 * Solves an MPS/LP string with HiGHS.
 * @param {string} model_text LP model
 * @returns {Promise<object>} HiGHS result
 */
async function solve_lp(model_text)
{
    const highs = await get_highs()
    return highs.solve(model_text)
}

module.exports = { solve_lp }
