import subprocess

plink = r"C:\Users\Administrador\plink.exe"
base = [
    plink, "-ssh", "-batch", "-noagent",
    "-hostkey", "SHA256:FSBP5oeiPfIHhAtbgJI2/X6RO64HgbxLRWpuJbuR1Ns",
    "-pw", "aELpsl5Sq3v0wjwW",
    "ubuntu@37.187.159.167",
]

cmds = [
    # Replace the placeholder minimax key
    r"""sudo sed -i 's/^MINIMAX_API_KEY=.*/MINIMAX_API_KEY=sk-api-x8-MKD7AWmhnFcmlyL2iZk6TVLg02Pj3foW8bph6PyoNDHZ_Gflgu4i0L3b3sbWDUuSzlxtn6fe2bF9d9uCPyi5E4k-_8p8K7c4hUdU-Ac_qQOAwyzBwAkQ/' /opt/bpmn-modeler/backend/.env""",
    "grep MINIMAX_API_KEY /opt/bpmn-modeler/backend/.env",
]

for c in cmds:
    cmd = base + [c]
    p = subprocess.Popen(cmd, stdout=subprocess.PIPE, stderr=subprocess.PIPE)
    stdout, stderr = p.communicate(timeout=15)
    out = stdout.decode("utf-8", errors="replace").strip()
    err = stderr.decode("utf-8", errors="replace").strip()
    if out:
        print(out)
    if err:
        print(f"ERR: {err}")
