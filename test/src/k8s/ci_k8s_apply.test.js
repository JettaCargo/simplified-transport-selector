const { expect } = require('chai')
const { spawnSync } = require('child_process')
const fs = require('fs')
const os = require('os')
const path = require('path')

const REPOSITORY_ROOT = path.join(__dirname, '../../..')
const APPLY_SCRIPT = path.join(REPOSITORY_ROOT, 'scripts/ci_k8s_apply.sh')
const FAKE_KUBECTL_SCRIPT = [
    '#!/usr/bin/env bash',
    'if [ "$1" = "apply" ]; then cp -r "$3"/. "$CAPTURE_DIR"/; fi',
    'exit 0',
    ''
].join('\n')

/**
 * Runs the CI apply script for one deploy env with a stub kubectl and returns a rendered manifest.
 * @param {string} deploy_env value of ENV (dev, stage or main)
 * @param {string} file_name manifest file name inside k8s/template
 * @returns {string} rendered manifest contents
 */
function render_manifest_for_env(deploy_env, file_name)
{
    const work_dir = fs.mkdtempSync(path.join(os.tmpdir(), 'ci-k8s-apply-'))
    const capture_dir = path.join(work_dir, 'capture')
    fs.mkdirSync(capture_dir)
    fs.writeFileSync(path.join(work_dir, 'kubectl'), FAKE_KUBECTL_SCRIPT, { mode: 0o755 })
    const result = spawnSync('bash', [APPLY_SCRIPT], {
        encoding: 'utf8',
        env: {
            ...process.env,
            PATH: `${work_dir}:${process.env.PATH}`,
            ENV: deploy_env,
            IMAGE_TAG: 'test-tag',
            PROJECT_NAME: 'simplified-transport-selector',
            CAPTURE_DIR: capture_dir
        }
    })
    if (result.status !== 0)
    {
        fs.rmSync(work_dir, { recursive: true, force: true })
        throw new Error(`ci_k8s_apply.sh failed for ENV=${deploy_env}: ${result.stderr}`)
    }
    const rendered = fs.readFileSync(path.join(capture_dir, file_name), 'utf8')
    fs.rmSync(work_dir, { recursive: true, force: true })
    return rendered
}

describe('ci_k8s_apply.sh replica count per environment', function ()
{
    it('renders one replica in dev for the deployment and the autoscaler minimum', function ()
    {
        expect(render_manifest_for_env('dev', 'deploy.yaml')).to.match(/^  replicas: 1$/m)
        expect(render_manifest_for_env('dev', 'hpa.yaml')).to.match(/^  minReplicas: 1$/m)
    })

    it('renders two replicas for stage and prod in the deployment and the autoscaler minimum', function ()
    {
        for (const deploy_env of ['stage', 'main'])
        {
            expect(render_manifest_for_env(deploy_env, 'deploy.yaml')).to.match(/^  replicas: 2$/m)
            expect(render_manifest_for_env(deploy_env, 'hpa.yaml')).to.match(/^  minReplicas: 2$/m)
        }
    })
})
