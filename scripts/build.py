#!/usr/bin/env python3
"""
Regenerate all adapters from core/policy.md.

Usage:
    python scripts/build.py

Each adapter file contains a POLICY_PLACEHOLDER comment that gets replaced
with the content of core/policy.md.
"""
import re
from pathlib import Path

ROOT = Path(__file__).parent.parent
POLICY = (ROOT / "core" / "policy.md").read_text()
ADAPTERS = ROOT / "adapters"

PLACEHOLDER = "<!-- paste contents of core/policy.md here -->"


def inject(path: Path) -> bool:
    text = path.read_text()
    if PLACEHOLDER not in text:
        return False
    path.write_text(text.replace(PLACEHOLDER, POLICY))
    print(f"  updated {path.relative_to(ROOT)}")
    return True


def check_sync() -> list[str]:
    """Return list of adapters whose policy block differs from core/policy.md."""
    out_of_sync = []
    for f in ADAPTERS.rglob("*"):
        if not f.is_file() or f.suffix in (".py", ".json"):
            continue
        if POLICY.strip() not in f.read_text():
            out_of_sync.append(str(f.relative_to(ROOT)))
    return out_of_sync


if __name__ == "__main__":
    import sys

    if "--check" in sys.argv:
        stale = check_sync()
        if stale:
            print("Out of sync with core/policy.md:")
            for s in stale:
                print(f"  {s}")
            sys.exit(1)
        print("All adapters in sync.")
    else:
        print("Injecting core/policy.md into adapters...")
        for f in ADAPTERS.rglob("*"):
            if f.is_file() and f.suffix not in (".py", ".json"):
                inject(f)
        print("Done.")
