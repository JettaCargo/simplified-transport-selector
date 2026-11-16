const { expect } = require('chai')
const { execFileSync } = require('child_process')
const fs = require('fs')
const path = require('path')

const REPOSITORY_ROOT = path.join(__dirname, '../../..')
const SAMPLE_SHA = 'abcdef1234567890'

/**
 * @param {string} relative_path path from the repository root
 * @returns {string} file contents
 */
function read_repository_file(relative_path)
{
    return fs.readFileSync(path.join(REPOSITORY_ROOT, relative_path), 'utf8')
}

/**
 * @param {string} deploy_env branch env name passed to the tag script
 * @returns {string[]} floating name, then immutable tag
 */
function image_tag_lines(deploy_env)
{
    const output = execFileSync(path.join(REPOSITORY_ROOT, 'scripts/ci_image_tags.sh'), {
        env: { ...process.env, ENV: deploy_env, GITHUB_SHA: SAMPLE_SHA },
        encoding: 'utf8'
    })
    return output.trim().split('\n')
}

/**
 * @param {object} policy parsed IAM policy
 * @param {string} repository_suffix ECR repository name suffix
 * @returns {object} matching statement
 */
function statement_for_repository(policy, repository_suffix)
{
    return policy.Statement.find(function (statement)
    {
        return String(statement.Resource).includes(`repository/${repository_suffix}`)
    })
}

describe('ci image policy', function ()
{
    it('maps main to prod tags and keeps dev and stage names', function ()
    {
        expect(image_tag_lines('main')).to.deep.equal(['prod', 'prod-abcdef1'])
        expect(image_tag_lines('dev')).to.deep.equal(['dev', 'dev-abcdef1'])
        expect(image_tag_lines('stage')).to.deep.equal(['stage', 'stage-abcdef1'])
    })

    it('smoke-tests the immutable tag and still verifies in node-ci', function ()
    {
        const workflow = read_repository_file('.github/workflows/ci.yml')
        expect(workflow).to.match(/IMAGE="\$\{ECR_URI\}:\$\{image_tag\}"/)
        expect(workflow).to.include('node-ci')
        expect(workflow).to.include('npm audit --audit-level=critical')
        expect(workflow).to.include('npm run ci:coverage')
    })

    it('keeps one image per environment prefix and expires untagged images after one day', function ()
    {
        const policy = JSON.parse(read_repository_file('k8s/ecr-lifecycle-policy.json'))
        const tagged_rules = policy.rules.filter(function (rule)
        {
            return rule.selection.tagStatus === 'tagged'
        })
        const prefixes = tagged_rules.flatMap(function (rule)
        {
            return rule.selection.tagPrefixList
        })
        expect(prefixes).to.deep.equal(['dev-', 'stage-', 'prod-'])
        for (const rule of tagged_rules)
        {
            expect(rule.selection.countNumber).to.equal(1)
        }
        const untagged = policy.rules.find(function (rule)
        {
            return rule.selection.tagStatus === 'untagged'
        })
        expect(untagged.selection.countUnit).to.equal('days')
        expect(untagged.selection.countNumber).to.equal(1)
    })

    it('applies the lifecycle policy even when the repository already exists', function ()
    {
        const script = read_repository_file('scripts/ci_ensure_ecr_repository.sh')
        const policy_call = script.indexOf('put-lifecycle-policy')
        expect(policy_call).to.be.greaterThan(-1)
        expect(script.slice(0, policy_call)).not.to.include('exit 0')
    })

    it('allows lifecycle updates and still pulls the node-ci image', function ()
    {
        const policy = JSON.parse(read_repository_file('iam/github-actions-deploy-ecr-policy.json'))
        const app_statement = statement_for_repository(policy, 'simplified-transport-selector')
        expect(app_statement.Action).to.include('ecr:GetLifecyclePolicy')
        expect(app_statement.Action).to.include('ecr:PutLifecyclePolicy')
        const node_ci = statement_for_repository(policy, 'node-ci')
        expect(node_ci.Action).to.include('ecr:BatchGetImage')
    })
})
