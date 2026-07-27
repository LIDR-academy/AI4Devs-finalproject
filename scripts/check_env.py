import subprocess

plink = r"C:\Users\Administrador\plink.exe"
base = [plink, "-ssh", "-batch", "-noagent",
        "-hostkey", "SHA256:FSBP5oeiPfIHhAtbgJI2/X6RO64HgbxLRWpuJbuR1Ns",
        "-pw", "aELpsl5Sq3v0wjwW",
        "ubuntu@37.187.159.167"]

# Read the full .env from production
cmd = base + ["grep -E '(API_KEY|LLM_KEY|LLM_PROVIDER|MODEL)' /opt/bpmn-modeler/backend/.env 2>&1 || echo 'grep failed'"]
p = subprocess.Popen(cmd, stdout=subprocess.PIPE, stderr=subprocess.PIPE)
stdout, stderr = p.communicate(timeout=15)
print(stdout.decode("utf-8", errors="replace"))
