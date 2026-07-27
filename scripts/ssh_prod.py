#!/usr/bin/env python3
"""SSH into production server using plink."""
import subprocess
import sys

host = "37.187.159.167"
user = "ubuntu"
password = "aELpsl5Sq3v0wjwW"
plink = r"C:\Users\Administrador\plink.exe"

full_cmd = [plink, "-ssh", "-batch", "-noagent",
            "-hostkey", "SHA256:FSBP5oeiPfIHhAtbgJI2/X6RO64HgbxLRWpuJbuR1Ns",
            "-pw", password, f"{user}@{host}",
            " && ".join(commands)]

try:
    result = subprocess.run(full_cmd, capture_output=True, text=True, timeout=30)
    print(result.stdout)
    if result.stderr:
        print(f"[STDERR]\n{result.stderr}", flush=True)
    print(f"Exit code: {result.returncode}", flush=True)
except subprocess.TimeoutExpired:
    print("TIMEOUT", flush=True)
except Exception as e:
    print(f"ERROR: {e}", flush=True)

print("=== DONE ===", flush=True)
