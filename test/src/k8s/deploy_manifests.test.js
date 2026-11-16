const { expect } = require('chai')
const fs = require('fs')
const path = require('path')

const REPOSITORY_ROOT = path.join(__dirname, '../../..')
const TEMPLATE_DIR = path.join(REPOSITORY_ROOT, 'k8s/template')

/**
 * @param {string} relative_path path from the repository root
 * @returns {string} file contents
 */
function read_repository_file(relative_path)
{
    return fs.readFileSync(path.join(REPOSITORY_ROOT, relative_path), 'utf8')
}

describe('k8s deploy manifests', function ()
{
    const deployment = read_repository_file('k8s/template/deploy.yaml')

    it('probes liveness on /livez and readiness on /readyz', function ()
    {
        expect(deployment).to.match(/livenessProbe:[\s\S]*?path: \/livez/)
        expect(deployment).to.match(/readinessProbe:[\s\S]*?path: \/readyz/)
    })

    it('rolls out without taking a ready pod away and drains before termination', function ()
    {
        expect(deployment).to.match(/type: RollingUpdate[\s\S]*?maxUnavailable: 0/)
        expect(deployment).to.match(/preStop:[\s\S]*?sleep/)
        const grace = Number(deployment.match(/terminationGracePeriodSeconds: (\d+)/)[1])
        const shutdown_grace_milliseconds = Number(deployment.match(/SHUTDOWN_GRACE_MILLISECONDS\s+value: "(\d+)"/)[1])
        expect(grace * 1000).to.be.greaterThan(shutdown_grace_milliseconds)
    })

    it('passes ENV and the solver pool settings to the container', function ()
    {
        expect(deployment).to.match(/- name: ENV\s+value: "VAR_ENV"/)
        for (const name of ['SOLVER_POOL_SIZE', 'SOLVER_QUEUE_LIMIT', 'SOLVER_TIME_LIMIT_SECONDS', 'SOLVER_WORKER_MAX_OLD_GENERATION_MB'])
        {
            expect(deployment).to.include(`- name: ${name}`)
        }
    })

    it('keeps two replicas available through voluntary disruptions', function ()
    {
        expect(read_repository_file('k8s/template/hpa.yaml')).to.match(/minReplicas: 2/)
        expect(fs.readdirSync(TEMPLATE_DIR)).to.include('pdb.yaml')
        expect(read_repository_file('k8s/template/pdb.yaml')).to.match(/kind: PodDisruptionBudget[\s\S]*?minAvailable: 1/)
    })

    it('applies in place and waits for the rollout instead of deleting resources', function ()
    {
        const apply_script = read_repository_file('scripts/ci_k8s_apply.sh')
        expect(apply_script).not.to.include('kubectl delete')
        expect(apply_script).to.include('kubectl rollout status')
    })

    it('deploys the immutable sha image tag, not the floating environment tag', function ()
    {
        const workflow = read_repository_file('.github/workflows/ci.yml')
        expect(workflow).not.to.match(/IMAGE_TAG: \$\{\{ needs\.resolve-env\.outputs\.env_name \}\}/)
        expect(workflow).to.match(/IMAGE_TAG: \$\{\{ steps\.image\.outputs\.tag \}\}/)
    })
})
