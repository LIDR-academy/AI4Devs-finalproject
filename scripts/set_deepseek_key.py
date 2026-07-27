import subprocess

plink = r"C:\Users\Administrador\plink.exe"
base = [
    plink, "-ssh", "-batch", "-noagent",
    "-hostkey", "SHA256:FSBP5oeiPfIHhAtbgJI2/X6RO64HgbxLRWpuJbuR1Ns",
    "-pw", "aELpsl5Sq3v0wjwW",
    "ubuntu@37.187.159.167",
]

commands = [
    # Remove old DEEPSEEK_API_KEY line if any
    "sudo sed -i '/^DEEPSEEK_API_KEY/d' /opt/bpmn-modeler/backend/.env",
    # Add the new key at the end
    "echo 'DEEPSEEK_API_KEY=sk-f3f49110dfc04e60937e5c7c5d5f7c81' | sudo tee -a /opt/bpmn-modeler/backend/.env > /dev/null",
    # Set default provider to deepseek
    "sudo sed -i 's/^DEFAULT_LLM_PROVIDER=.*/DEFAULT_LLM_PROVIDER=deepseek/' /opt/bpmn-modeler/backend/.env",
    # Verify
    "grep -E '(DEEPSEEK|DEFAULT_LLM)' /opt/bpmn-modeler/backend/.env",
]

for cmd_str in commands:
    cmd = base + [cmd_str]
    p = subprocess.Popen(cmd, stdout=subprocess.PIPE, stderr=subprocess.PIPE)
    stdout, stderr = p.communicate(timeout=15)
    out = stdout.decode("utf-8", errors="replace").strip()
    err = stderr.decode("utf-8", errors="replace").strip()
    if out:
        print(out)
    if err:
        print(f"ERR: {err}")
