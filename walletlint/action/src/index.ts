import * as core from '@actions/core';
import * as github from '@actions/github';
import { exec } from '@actions/exec';
import { readFileSync } from 'fs';

interface Finding {
  ruleId: string;
  severity: 'BLOCK' | 'WARN' | 'INFO';
  message: string;
  txHash: string;
  txIndex: number;
  metadata?: Record<string, unknown>;
}

async function run(): Promise<void> {
  try {
    const traceFile = core.getInput('trace-file', { required: true });
    const format = core.getInput('format') || 'terminal';
    const failOnWarn = core.getBooleanInput('fail-on-warn');
    const rpc = core.getInput('rpc') || 'https://eth.llamarpc.com';
    const chain = core.getInput('chain') || 'evm';

    core.info(`🔍 Running WalletLint on ${traceFile} (chain: ${chain})...`);

    const args = [
      'walletlint', 'analyze', traceFile,
      '--format', 'json',
      '--rpc', rpc,
      '--chain', chain,
    ];
    if (failOnWarn) {
      args.push('--fail-on-warn');
    }

    let output = '';
    let errorOutput = '';

    const exitCode = await exec('npx', args, {
      silent: true,
      listeners: {
        stdout: (data: Buffer) => { output += data.toString(); },
        stderr: (data: Buffer) => { errorOutput += data.toString(); },
      },
      ignoreReturnCode: true,
    });

    let findings: Finding[] = [];
    try {
      findings = JSON.parse(output) as Finding[];
    } catch {
      core.warning('Could not parse WalletLint JSON output');
      core.info('Raw output:');
      core.info(output || errorOutput);
    }

    const blocks = findings.filter((f) => f.severity === 'BLOCK');
    const warns = findings.filter((f) => f.severity === 'WARN');
    const infos = findings.filter((f) => f.severity === 'INFO');

    core.info(`\n📊 WalletLint Results:`);
    core.info(`   🚫 BLOCK: ${blocks.length}`);
    core.info(`   ⚠️  WARN:  ${warns.length}`);
    core.info(`   ℹ️  INFO:  ${infos.length}`);

    if (github.context.payload.pull_request && findings.length > 0) {
      const octokit = github.getOctokit(process.env.GITHUB_TOKEN || '');
      const { owner, repo } = github.context.repo;
      const pull_number = github.context.payload.pull_request.number;

      for (const finding of findings) {
        const level = finding.severity === 'BLOCK'
          ? 'failure'
          : finding.severity === 'WARN'
          ? 'warning'
          : 'notice';

        await octokit.rest.checks.create({
          owner,
          repo,
          name: `WalletLint: ${finding.ruleId}`,
          head_sha: github.context.sha,
          status: 'completed',
          conclusion: level === 'failure' ? 'failure' : 'neutral',
          output: {
            title: finding.ruleId,
            summary: finding.message,
            annotations: [
              {
                path: traceFile,
                start_line: 1,
                end_line: 1,
                annotation_level: level,
                message: `[${finding.severity}] ${finding.message} (tx: ${finding.txHash})`,
                title: finding.ruleId,
              },
            ],
          },
        }).catch(() => {
          // Fallback: post as PR comment if checks API fails
        });
      }
    }

    core.setOutput('block-count', blocks.length);
    core.setOutput('warn-count', warns.length);
    core.setOutput('info-count', infos.length);
    core.setOutput('findings', JSON.stringify(findings));

    if (exitCode !== 0) {
      core.setFailed(`WalletLint found ${blocks.length} BLOCK-level issues.`);
      return;
    }

    core.info('✅ WalletLint passed.');
  } catch (error) {
    if (error instanceof Error) {
      core.setFailed(error.message);
    } else {
      core.setFailed('Unknown error');
    }
  }
}

run();