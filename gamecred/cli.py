"""GameCred command line.

  python -m gamecred discover      build the roguelike universe from SteamSpy tags
  python -m gamecred fetch [N]     fetch store/review/tag data (cached, resumable)
  python -m gamecred wikis         discover wikis (Fandom/wiki.gg) + article & category stats
  python -m gamecred build         assemble dataset + SQLite
  python -m gamecred export        run analyses, write dashboard/data.js
  python -m gamecred doctor [--fix]  self-healing health check (see gamecred/doctor.py)
  python -m gamecred all           build + export + doctor
  python -m gamecred report        print top mechanic findings to the terminal
"""
from __future__ import annotations

import logging
import sys


def main(argv: list[str] | None = None) -> int:
    argv = argv if argv is not None else sys.argv[1:]
    logging.basicConfig(level=logging.INFO, format="%(asctime)s %(name)s %(message)s", datefmt="%H:%M:%S")
    cmd = argv[0] if argv else "all"
    if cmd == "discover":
        from .discover import discover
        discover()
    elif cmd == "fetch":
        from .fetch import fetch_all
        fetch_all(int(argv[1]) if len(argv) > 1 else None)
    elif cmd == "wikis":
        from .wikis import collect
        collect()
    elif cmd == "build":
        from .build import assemble
        assemble()
    elif cmd == "export":
        from .export import export
        export()
    elif cmd == "doctor":
        from .doctor import doctor
        return doctor(fix="--fix" in argv)
    elif cmd == "report":
        from .report import report
        report(argv[1:])
    elif cmd == "all":
        from .build import assemble
        from .doctor import doctor
        from .export import export
        assemble()
        export()
        return doctor(fix=True)
    else:
        print(__doc__)
        return 2
    return 0


if __name__ == "__main__":
    sys.exit(main())
