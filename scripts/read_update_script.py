import subprocess, sys

plink = r"C:\Users\Administrador\plink.exe"
hostkey = "SHA256:FSBP5oeiPfIHhAtbgJI2/X6RO64HgbxLRWpuJbuR1Ns"
host = "ubuntu@37.187.159.167"
pw = "aELpsl5Sq3v0wjwW"

base_cmd = [plink, "-ssh", "-batch", "-noagent", "-hostkey", hostkey, "-pw", pw, host]

cmd = base_cmd + ["head -c 3000 /home/ubuntu/update-dev.sh"]
p = subprocess.Popen(cmd, stdout=subprocess.PIPE, stderr=subprocess.PIPE)
stdout, stderr = p.communicate(timeout=30)

with open(r"C:\Users\Administrador\_out.txt", "wb") as f:
    f.write(stdout)

print(p.returncode)
