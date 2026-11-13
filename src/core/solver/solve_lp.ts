import { Highs_Module } from './highs_module'
import { Highs_Result } from './highs_result'

let highs_promise: Promise<Highs_Module> | null = null

/**
 * Solves an LP string with HiGHS.
 * @param model_text LP model
 * @returns HiGHS result
 */
export async function solve_lp(model_text: string): Promise<Highs_Result>
{
    const highs = await get_highs()
    return highs.solve(model_text)
}

/**
 * @returns the shared HiGHS module
 */
async function get_highs(): Promise<Highs_Module>
{
    if (!highs_promise)
    {
        highs_promise = load_highs()
    }
    return highs_promise
}

/**
 * @returns a HiGHS module promise
 */
function load_highs(): Promise<Highs_Module>
{
    return import('highs').then(start_highs)
}

/**
 * @param imported dynamic import of the highs package
 * @returns HiGHS module
 */
function start_highs(imported: typeof import('highs')): Promise<Highs_Module>
{
    const factory = imported.default as unknown as () => Promise<Highs_Module>
    return factory()
}
