#!/usr/bin/env python3
"""Copy only site source and verification inputs to a new disposable directory."""
from pathlib import Path
import shutil
import sys

ROOT = Path(__file__).resolve().parents[1]
SOURCE_PATHS = (
    ".hugo-version", "hugo.toml", "wrangler.jsonc", "package.json", "package-lock.json",
    "archetypes", "content", "data", "docs", "layouts", "scripts", "static", "themes",
)
IGNORE = shutil.ignore_patterns(
    ".DS_Store", "__pycache__", "*.pyc", ".env", ".env.*", ".dev.vars", ".dev.vars.*",
    "node_modules", ".git", ".wrangler", "public", "resources", ".hugo_build.lock",
)


def copy_source(destination: Path) -> None:
    destination = destination.resolve()
    if destination == ROOT or ROOT in destination.parents:
        raise ValueError("Disposable source must be outside the working tree")
    destination.mkdir(parents=True, exist_ok=False)
    for name in SOURCE_PATHS:
        source = ROOT / name
        if source.is_symlink() or (source.is_dir() and any(p.is_symlink() for p in source.rglob("*"))):
            raise ValueError(f"Source symlinks are not supported: {name}")
        if source.is_dir():
            shutil.copytree(source, destination / name, ignore=IGNORE)
        else:
            shutil.copy2(source, destination / name)


if __name__ == "__main__":
    copy_source(Path(sys.argv[1]))
