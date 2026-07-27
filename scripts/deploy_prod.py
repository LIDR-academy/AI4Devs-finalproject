import subprocess
import sys

plink = r"C:\Users\Administrador\plink.exe"
base = [
    plink, "-ssh", "-batch", "-noagent",
    "-hostkey", "SHA256:FSBP5oeiPfIHhAtbgJI2/X6RO64HgbxLRWpuJbuR1Ns",
    "-pw", "aELpsl5Sq3v0wjwW",
    "ubuntu@37.187.159.167",
]

# Try running without 2>&1 and capture separately
cmd = base + ["sudo /opt/bpmn-modeler/update.sh"]
p = subprocess.Popen(cmd, stdout=subprocess.PIPE, stderr=subprocess.PIPE)
stdout, stderr = p.communicate(timeout=300)
out = stdout.decode("utf-8", errors="replace").strip()
err = stderr.decode("utf-8", errors="replace").strip()
if out:
    print(out[-3000:])
if err:
    print(f"STDERR: {err[:1000]}")
print(f"RC: {p.returncode}")
sys.exit(p.returncode)
