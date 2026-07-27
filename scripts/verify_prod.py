import subprocess

plink = r"C:\Users\Administrador\plink.exe"
base = [
    plink, "-ssh", "-batch", "-noagent",
    "-hostkey", "SHA256:FSBP5oeiPfIHhAtbgJI2/X6RO64HgbxLRWpuJbuR1Ns",
    "-pw", "aELpsl5Sq3v0wjwW",
    "ubuntu@37.187.159.167",
]

checks = {
    "Our changes in ai.py": "grep -c '_call_default_llm' /opt/bpmn-modeler/backend/routers/ai.py",
    "Our changes in projects.py": "grep -c 'is_system_project' /opt/bpmn-modeler/backend/routers/projects.py",
    "DeepSeek key in .env": "grep -c 'DEEPSEEK_API_KEY=sk-f3f' /opt/bpmn-modeler/backend/.env",
    "Default provider": "grep 'DEFAULT_LLM_PROVIDER' /opt/bpmn-modeler/backend/.env",
    "Frontend build": "ls -la /opt/bpmn-modeler/frontend/build/index.html 2>&1",
    "Backend service": "sudo supervisorctl status bpmn-backend 2>&1",
    "API health": "curl -s -o /dev/null -w '%{http_code}' https://sdd-ia.com/api/",
}

for label, cmd_str in checks.items():
    cmd = base + [cmd_str]
    p = subprocess.Popen(cmd, stdout=subprocess.PIPE, stderr=subprocess.PIPE)
    stdout, stderr = p.communicate(timeout=15)
    out = stdout.decode("utf-8", errors="replace").strip()
    err = stderr.decode("utf-8", errors="replace").strip()
    status = out if out else (err if err else "?")
    print(f"{label}: {status}")
