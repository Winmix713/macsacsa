# CI Pipeline Overview

## Runtime Pinning

- **Node.js**: `20.17.1` via `.nvmrc` and `package.json#engines`
- **npm**: `10.8.2` pinned in `package.json#engines`
- **Python**: `3.11.8` via `.python-version` and `runtime.txt`

These files ensure developers and CI runners bootstrap consistent toolchains. Use `nvm use` / `pyenv local` (or `asdf`) to mirror the CI runtime locally.

## Workflow Architecture

The workflow file lives at `.github/workflows/ci.yml` and is triggered on pushes and pull requests targeting `main` or `develop`, with manual overrides via `workflow_dispatch`.

### 1. `Detect Changes`
Determines which stack (web or ML pipeline) was touched using `dorny/paths-filter`. Downstream jobs short-circuit when no relevant files change, reducing unnecessary runner minutes.

### 2. `Web • Lint & Build`
Runs only when web-facing files change.

- Installs Node based on `.nvmrc`, caching npm modules by `package-lock.json`
- Executes `npm ci`, `npm run lint`, and `npm run build`
- Skips the build step for draft pull requests to provide fast feedback
- Uploads the generated `dist/` artifact for reuse or manual debugging
- Appends tool versions to the job summary for traceability

### 3. `Python • pytest`
Runs when ML pipeline sources change and the PR is ready for review.

- Uses pinned Python 3.11.8 with pip cache invalidated from `src/ml_pipeline/requirements.txt`
- Installs runtime dependencies plus `pytest`
- Splits the suite per module (`data_loader`, `system_log`, `train_model`) to surface flaky tests quickly and in parallel
- Publishes pytest caches for post-mortem inspection
- Records versions and module names in the job summary

## Caching & Artifact Strategy

- **npm** cache leverages `actions/setup-node` with the lockfile as the cache key (ensures deterministic installs)
- **pip** cache uses `actions/setup-python`, keyed by `requirements.txt`
- **Build artifacts** (`dist/`) are uploaded on non-draft runs to unblock downstream jobs or manual verification without rerunning the build
- **Pytest cache** uploads help debug failing shards without rerunning locally

## Conditional Execution & Early Feedback

- Path filters ensure the workflow only runs the minimal set of jobs per change-set
- Draft pull requests skip slower build/test phases but still execute linting for immediate feedback
- Concurrency (`ci-${{ github.ref }}`) cancels superseded runs when developers push updates rapidly

## Observability & Debugging

Each job logs the exact runtime versions and top-line actions into the step summary. Combined with uploaded artifacts, this shortens the time-to-diagnose for failing runs. Additional metrics (duration, cache hit ratios) can be harvested from the GitHub Actions UI or exported to external dashboards.

## Local Reproduction

```
# Node stack
nvm use
npm ci
npm run lint
npm run build

# Python ML pipeline
pyenv local 3.11.8  # or any compatible 3.11 interpreter
python -m venv .venv && source .venv/bin/activate
pip install -r src/ml_pipeline/requirements.txt pytest
pytest src/ml_pipeline/tests
```

Following these commands mirrors the CI workflow, enabling developers to reproduce failures before pushing.
