import subprocess

plink = r"C:\Users\Administrador\plink.exe"
hostkey = "SHA256:FSBP5oeiPfIHhAtbgJI2/X6RO64HgbxLRWpuJbuR1Ns"
host = "ubuntu@37.187.159.167"
pw = "aELpsl5Sq3v0wjwW"

def run(cmd_str):
    cmd = [plink, "-ssh", "-batch", "-noagent", "-hostkey", hostkey, "-pw", pw, host, cmd_str]
    p = subprocess.Popen(cmd, stdout=subprocess.PIPE, stderr=subprocess.PIPE)
    stdout, stderr = p.communicate(timeout=15)
    return stdout.decode("utf-8", errors="replace")

cmds = {
    "backend logs (last 30 lines)": "sudo tail -30 /var/log/bpmn-backend.err.log 2>&1",
    "backend out logs": "sudo tail -20 /var/log/bpmn-backend.out.log 2>&1",
    "frontend build log": "ls -la /opt/bpmn-modeler/frontend/build/ 2>&1",
}

for label, cmd in cmds.items():
    print(f"=== {label} ===")
    print(run(cmd))
