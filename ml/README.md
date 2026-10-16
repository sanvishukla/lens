# ml/

Models Lens may train later (PRD.md, "Models"). Nothing here ships in the launch phase: v1 uses
prompted hosted models. A model replaces a prompt only when it beats that prompt on the eval set.

```
ml/
  data/licenses.yaml      allowlist: every dataset, its license, and what it may be used for
  scripts/check_licenses.py  CI gate: configs may only use data their license allows
  configs/                one YAML per model run (base model, datasets, ship gate)
  models/m1..m8/          notes per model
  synthetic/              generators for license-clean training data
  eval/                   held-out sets and scoring
  notebooks/              exploration (not used by CI)
```

## Rules

1. A dataset must be in `data/licenses.yaml` before any config references it.
2. `research`-only data (WebUI, TORGO, Concadia) never trains released weights.
3. `eval`-only data (ASSET, VizWiz, VisText, ChartQA, WebA11yBench) never enters training.
4. Training on share-alike data (RICO Semantics, OneStopEnglish, WikiLarge) means releasing weights as CC BY-SA 4.0.
5. User feedback is only used from people with `training_opt_in = true`.
6. Base models must be permissively licensed (MIT/Apache-2.0). Not Qwen research-licensed models, not Ultralytics YOLO (AGPL).

## Setup

```bash
python -m venv .venv && .venv/Scripts/activate   # Windows; use bin/activate elsewhere
pip install -r ml/requirements.txt
python ml/scripts/check_licenses.py ml/configs/*.yaml
```
