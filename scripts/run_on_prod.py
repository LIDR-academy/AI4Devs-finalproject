#!/usr/bin/env python3
"""Run a command on the production server via plink."""
import subprocess
import sys

host = "37.187.159.167"
user = "ubuntu"
password = "aELpsl5Sq3v0wjwW"
plink = r"C:\Users\Administrador\plink.exe"

cmd = sys.argv[1] if len(sys.argv) > 1 else "hostname"

full_cmd = [plink, "-ssh", "-batch", "-noagent",
            "-hostkey", "SHA256:FSBP5oeiPfIHhAtbgJI2/X6RO64HgbxLRWpuJbuR1Ns",
            "-pw", password, f"{user}@{host}", cmd]

result = subprocess.run(full_cmd, capture_output=True, text=True, timeout=30)
out = result.stdout.strip()
err = result.stderr.strip()
if out:
    print(out)
if err:
    print(f"[ERR] {err}", file=sys.stderr, flush=True)
sys.exit(result.returncode)
