---
name: security-engineer
description: "Trigger: seguridad, security, auditoría de seguridad, SAST, DAST, secretos, dependencias vulnerables, OWASP. Planifica, audita, remedia y valida la seguridad del código del proyecto."
license: Apache-2.0
metadata:
  author: bytelovers
  version: "2.0"
---

## Activation Contract

Load this skill when security models, threat mappings, static code audits, package vulnerabilities scans, or secrets management rules are requested. Triggers: `seguridad`, `security`, `auditoría de seguridad`, `SAST`, `DAST`, `secretos`, `dependencias vulnerables`, `OWASP`.

## Hard Rules

- **Secrets Sanitization:** Never commit credentials, tokens, or private keys to the repository. Guide immediate rotation if found.
- **Vulnerability Baseline:** Classify issues strictly against CVSS standards. Reject builds containing High or Critical threats.
- **Verification Non-Regression:** Any security patch must pass prior functional unit tests and a re-run of the security audit.

## Decision Gates

| Target Scenario | Operation Mode |
|---|---|
| New system architecture or epic | Threat Modeling (STRIDE) |
| Code audit / SCA package scan | Security Audit (SAST/SCA) |
| Fix security bugs | Remediate |
| CI merge checkpoint | CICD Gate (Evaluates threshold) |

## Execution Steps

```sudolang
SecurityEngineer {
  Config {
    lang = detect_from_input |> default "es"
    inputSources = ["docs/", caller_context, source_code]
    persistRoot = "docs/security/"
    standards = ["OWASP Top 10", "STRIDE", "SANS CWE"]
  }

  OnActivate {
    mem_search("security-engineer/{project}/state")
    found => present_security_dashboard(state) => ask: continue | run_new_audit | plan_security
    not_found => run_context_discovery
  }

  ThreatModeling {
    // Analyze components -> Enumerate STRIDE threats -> Mitigate
    persist: {
      mem_save(threat_model, topic: "security-engineer/{project}/threat-model", type: "architecture", capture_prompt: false)
      write_file("{persistRoot}/threat_model.md", format_markdown(threat_model))
    }
  }

  SecurityAudit {
    // Scan secrets, packages, and code patterns
    persist: {
      mem_save(vuln_list, topic: "security-engineer/{project}/vulnerabilities", type: "bugfix", capture_prompt: false)
      write_file("{persistRoot}/audit_report.md", format_markdown(audit_report))
    }
  }

  VerifySecurity {
    // Confirm mitigations and access rules (e.g. Firestore rules, OAuth flows)
  }
}
```

1. **Information Discovery**: Check dependency locks and directory environments.
2. **Modeling / Scanning**: Run code matching, dependency trees, and threat indices.
3. **Remediation & Testing**: Develop patches and run regressions.
4. **CI Evaluation**: Evaluate whether safety thresholds are satisfied.

## Output Contract

Return:
- List of vulnerabilities with ID, title, severity, and files impacted.
- CI gate verdict: `PASS`, `WARN`, or `BLOCK`.
- Path locations of generated vulnerability audit reports.

## References

- `docs/` — Document context sources (PRDs, wireframes, architectures).
- `.agents/skills/qa-engineer/SKILL.md` — Quality assurance coordinate target.
