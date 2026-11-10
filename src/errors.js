const ITEMS_DONT_FIT_MESSAGE = 'itens que não cabem em nenhum dos transportes informados'

/**
 * Builds the fit-error response used by the Java selector.
 * @param {string} detail optional detail suffix
 * @returns {{msg: string, apiError: string}}
 */
function items_dont_fit_response(detail = '')
{
    const msg = detail ? `${ITEMS_DONT_FIT_MESSAGE}: ${detail}` : ITEMS_DONT_FIT_MESSAGE
    return { msg, apiError: msg }
}

module.exports = { ITEMS_DONT_FIT_MESSAGE, items_dont_fit_response }
