const { expect } = require('chai')
const { execFileSync } = require('child_process')
const fs = require('fs')
const os = require('os')
const path = require('path')

const REPOSITORY_ROOT = path.join(__dirname, '../../..')
const WRITE_NPMRC = path.join(REPOSITORY_ROOT, 'scripts/ci_write_npmrc.sh')

/**
 * @param {string} relative_path path from the repository root
 * @returns {string} file contents
 */
function read_repository_file(relative_path)
{
    return fs.readFileSync(path.join(REPOSITORY_ROOT, relative_path), 'utf8')
}

/**
 * @returns {string} empty directory
 */
function empty_directory()
{
    return fs.mkdtempSync(path.join(os.tmpdir(), 'ci-npmrc-'))
}

describe('ci npmrc', function ()
{
    it('writes the registry auth line from NPM_TOKEN', function ()
    {
        const directory = empty_directory()
        execFileSync(WRITE_NPMRC, {
            cwd: directory,
            env: { PATH: process.env.PATH, NPM_TOKEN: 'test-token-value' }
        })
        const npmrc = fs.readFileSync(path.join(directory, '.npmrc'), 'utf8')
        expect(npmrc).to.equal('//registry.npmjs.org/:_authToken=test-token-value\n')
        fs.rmSync(directory, { recursive: true })
    })

    it('refuses to write npmrc when NPM_TOKEN is missing', function ()
    {
        const directory = empty_directory()
        expect(function ()
        {
            execFileSync(WRITE_NPMRC, {
                cwd: directory,
                env: { PATH: process.env.PATH },
                stdio: 'pipe'
            })
        }).to.throw()
        expect(fs.existsSync(path.join(directory, '.npmrc'))).to.equal(false)
        fs.rmSync(directory, { recursive: true })
    })

    it('creates npmrc before npm ci and mounts it as a build secret', function ()
    {
        const workflow = read_repository_file('.github/workflows/ci.yml')
        const script_at = workflow.indexOf('scripts/ci_write_npmrc.sh')
        const install_at = workflow.indexOf('npm ci && npm audit')
        expect(workflow).to.include('NPM_TOKEN: ${{ secrets.NPM_TOKEN }}')
        expect(script_at).to.be.greaterThan(-1)
        expect(script_at).to.be.lessThan(install_at)
        expect(workflow).to.include('--secret id=npmrc,src=.npmrc')
        const dockerfile = read_repository_file('container/Dockerfile')
        const secret_mounts = dockerfile.match(/type=secret,id=npmrc,target=\/opt\/app\/\.npmrc/g)
        expect(secret_mounts).to.have.length(2)
        expect(read_repository_file('.gitignore')).to.match(/^\.npmrc$/m)
        expect(read_repository_file('.dockerignore')).to.match(/^\.npmrc$/m)
    })
})
