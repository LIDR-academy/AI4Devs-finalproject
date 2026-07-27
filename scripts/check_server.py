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
    "nginx site config": "head -80 /etc/nginx/sites-available/sdd-ia.conf 2>&1",
    "nginx blog config": "head -60 /etc/nginx/sites-available/blog.sdd-ia.conf 2>&1",
    "backend port": "sudo ss -tlnp 2>/dev/null | grep -E '(8001|8000)' || ss -tlnp | grep -E '(8001|8000)'",
    "supervisor config": "cat /etc/supervisor/conf.d/*.conf 2>&1",
    "cron jobs": "crontab -l 2>&1",
}

for label, cmd in cmds.items():
    print(f"=== {label} ===")
    print(run(cmd))
