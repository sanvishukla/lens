"""Fail if a training config uses data its license doesn't allow.

Usage: python ml/scripts/check_licenses.py ml/configs/*.yaml
"""

from __future__ import annotations

import sys
from pathlib import Path

import yaml

ALLOWLIST = Path(__file__).resolve().parent.parent / "data" / "licenses.yaml"


def check(config_path: Path, datasets: dict) -> list[str]:
    config = yaml.safe_load(config_path.read_text(encoding="utf-8"))
    name = config.get("name", config_path.stem)
    release = bool(config.get("release", False))
    errors: list[str] = []
    share_alike = False

    for split, needed_use in (("train", "train"), ("eval", "eval")):
        for ds in config.get("datasets", {}).get(split, []):
            entry = datasets.get(ds)
            if entry is None:
                errors.append(f"{name}: '{ds}' is not in licenses.yaml")
                continue
            uses = set(entry.get("uses", []))
            if needed_use == "train":
                if "train" in uses:
                    share_alike |= bool(entry.get("share_alike"))
                elif "research" in uses:
                    if release:
                        errors.append(f"{name}: '{ds}' ({entry['license']}) is research-only but release is true")
                else:
                    errors.append(f"{name}: '{ds}' ({entry['license']}) may not be used for training")
            elif needed_use not in uses:
                errors.append(f"{name}: '{ds}' may not be used for {needed_use}")

    if release and share_alike and config.get("weights_license") != "CC-BY-SA-4.0":
        errors.append(f"{name}: trains on share-alike data, so weights_license must be CC-BY-SA-4.0")

    return errors


def main(argv: list[str]) -> int:
    if not argv:
        print(__doc__)
        return 2
    datasets = yaml.safe_load(ALLOWLIST.read_text(encoding="utf-8"))["datasets"]
    errors = [e for path in argv for e in check(Path(path), datasets)]
    for e in errors:
        print(f"LICENSE ERROR {e}")
    if not errors:
        print(f"OK: {len(argv)} config(s) pass license checks")
    return 1 if errors else 0


if __name__ == "__main__":
    sys.exit(main(sys.argv[1:]))
