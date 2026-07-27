import subprocess

plink = r"C:\Users\Administrador\plink.exe"
hostkey = "SHA256:FSBP5oeiPfIHhAtbgJI2/X6RO64HgbxLRWpuJbuR1Ns"
host = "ubuntu@37.187.159.167"
pw = "aELpsl5Sq3v0wjwW"

base_cmd = [plink, "-ssh", "-batch", "-noagent", "-hostkey", hostkey, "-pw", pw, host]

# Read the rest of update-dev.sh (lines 60-150)
cmd = base_cmd + ["tail -n +60 /home/ubuntu/update-dev.sh | head -c 3000"]
p = subprocess.Popen(cmd, stdout=subprocess.PIPE, stderr=subprocess.PIPE)
stdout, stderr = p.communicate(timeout=30)
with open(r"C:\Users\Administrador\_out2.txt", "wb") as f:
    f.write(stdout)

# Also check nginx config
cmd2 = base_cmd + ["ls /etc/nginx/sites-enabled/ 2>&1"]
p2 = subprocess.Popen(cmd2, stdout=subprocess.PIPE, stderr=subprocess.PIPE)
stdout2, stderr2 = p2.communicate(timeout=15)
with open(r"C:\Users\Administrador\_out3.txt", "wb") as f:
    f.write(stdout2)

print("OK")
