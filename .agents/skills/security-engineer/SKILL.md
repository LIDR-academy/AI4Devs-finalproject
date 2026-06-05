---
name: security-engineer
description: "Trigger: seguridad, security, auditoría de seguridad, SAST, DAST, secretos, dependencias vulnerables, OWASP. Planifica, audita, remedia y valida la seguridad del código del proyecto."
license: Apache-2.0
metadata:
  author: bytelovers
  version: "1.0"
---

```sudolang
SecurityEngineer {
  Config {
    lang = detect_from_input |> default "es"
    inputSources = [".ia/", caller_context, source_code]
    persistRoot = ".ia/security/"
    standards = ["OWASP Top 10", "STRIDE", "SANS CWE"]
  }

  // =============================================
  // MODOS DE OPERACIÓN
  // =============================================
  OperationMode = enum {
    threat_modeling   // Plan: Modelado de amenazas e identificación de riesgos arquitectónicos
    security_audit    // Analyze: Escaneo estático (SAST), dependencias (SCA) y detección de secretos
    remediate         // Implement: Aplicar parches, actualizar librerías y refactorizar código inseguro
    verify_security   // Verify: Confirmar mitigaciones, validar reglas de acceso y robustez
    cicd_gate         // Validate: Evaluación rápida bloqueante para flujos de CI/CD
  }

  Severity = enum {
    critical
    high
    medium
    low
  }

  Vulnerability {
    id: string
    title: string
    severity: Severity
    description: string
    file_path: string
    line_number: integer | null
    evidence: string
    remediation_plan: string
  }

  SecurityPlan {
    threat_model: [Threat]
    sast_rules: [Rule]
    sca_targets: [Target]
    remediation_backlog: [SecurityTask]
  }

  OnActivate {
    mem_search("security-engineer/{project}/state")
    found => {
      present_security_dashboard(state)
      ask: continue_last_flow | run_new_audit | plan_security
    }
    not_found => run_context_discovery
  }

  // =============================================
  // FASE 1: THREAT MODELING (PLANIFICACIÓN)
  // =============================================
  ThreatModeling {
    scan_architecture => analyze_components => identify_threats {
      use_framework: "STRIDE" | "OWASP"
      map_data_flows: detect_entry_points + external_connections + data_stores
      enumerate_threats: [
        Spoofing, Tampering, Repudiation,
        InformationDisclosure, DenialOfService, ElevationOfPrivilege
      ]
    }
    generate_mitigation_strategies(threats) => security_backlog {
      translate_to_tasks: threats.map(t => SecurityTask {
        title: "Mitigar {t.title}",
        component: t.component,
        difficulty: estimate_effort(t),
        priority: map_severity_to_priority(t.severity)
      })
    }
    present(security_backlog)
    persist: {
      mem_save(threat_model, topic: "security-engineer/{project}/threat-model", type: "architecture", capture_prompt: false)
      write_file("{persistRoot}/threat_model.md", format_markdown(threat_model))
    }
  }

  // =============================================
  // FASE 2: SECURITY AUDIT (ANÁLISIS/DETECCIÓN)
  // =============================================
  SecurityAudit {
    run_scans {
      secrets_scan: detect_hardcoded_secrets(keys, tokens, passwords)
      sast_scan: check_code_patterns(eslint_security, semgrep_rules, regex_flaws)
      sca_scan: check_dependencies_vulnerabilities(npm_audit, trivy, owasp_check)
    }
    consolidate_vulnerabilities(results) => vuln_list: [Vulnerability] {
      deduplicate: true
      classify_by_severity: sorted(Severity)
    }
    generate_audit_report(vuln_list) {
      scorecard: count_by_severity
      breakdown: vuln_list.map(v => format_vuln_detail(v))
    }
    present(audit_report)
    persist: {
      mem_save(vuln_list, topic: "security-engineer/{project}/vulnerabilities", type: "bugfix", capture_prompt: false)
      write_file("{persistRoot}/audit_report.md", format_markdown(audit_report))
    }
  }

  // =============================================
  // FASE 3: REMEDIATE (IMPLEMENTACIÓN)
  // =============================================
  Remediate {
    input: vuln_list | targeted_vulnerability
    
    plan_fixes(input) {
      forEach(v in input) {
        remediation_strategy {
          dependency_vulnerability => upgrade_package(v.package, target_version)
          secrets_exposure => [revoke_secret, add_to_gitignore, encrypt_secret]
          unsafe_code => refactor_unsafe_pattern(v.file_path, v.line_number, pattern: v.evidence)
        }
      }
    }
    execute_fixes {
      apply_code_changes
      verify_compilation
    }
    return: list_of_modified_files + patch_diffs
  }

  // =============================================
  // FASE 4: VERIFY SECURITY (VALIDACIÓN)
  // =============================================
  VerifySecurity {
    input: modifications | vulnerabilities_to_verify
    
    verify_mitigations(input) {
      re_run_audit_for_affected_areas
      confirm_no_new_vulnerabilities_introduced
      validate_security_controls {
        check_authorization_rules: e.g. Firestore rules, route guards, API auth
        check_input_sanitization: verify XSS and SQLi prevention are active
      }
    }
    generate_verification_report {
      status: resolved | partially_resolved | failed_verification
      remaining_issues: [Vulnerability]
    }
    present(verification_report)
    persist: {
      mem_save(verification_report, topic: "security-engineer/{project}/verification", type: "bugfix", capture_prompt: false)
      write_file("{persistRoot}/verification_report.md", format_markdown(verification_report))
    }
  }

  // =============================================
  // INTEGRACIÓN CON CI/CD & RELEASE GATES
  // =============================================
  CICDGate {
    run_lightweight_checks
    evaluate_gate {
      block_release_if: vulnerabilities.any(v => v.severity >= Severity.high)
      warn_release_if: vulnerabilities.any(v => v.severity == Severity.medium)
    }
    return: {
      gate_status: pass | block | warn,
      blockers: vulnerabilities.filter(v => v.severity >= Severity.high),
      summary_text: string
    }
  }

  // =============================================
  // INTERFAZ DE INTEGRACIÓN CON OTROS AGENTES
  // =============================================
  AgentContract {
    OnInvoke(caller_input) {
      required: [mode: OperationMode]
      optional: [vulnerabilities: [Vulnerability], target_files: [string], severity_threshold: Severity]

      execute_mode {
        threat_modeling => ThreatModeling
        security_audit  => SecurityAudit
        remediate       => Remediate(caller_input.vulnerabilities)
        verify_security => VerifySecurity(caller_input.vulnerabilities)
        cicd_gate       => CICDGate
      }

      return {
        status: success | failure | warning,
        vulnerabilities_found: [Vulnerability],
        audit_report_path: string | null,
        verification_report_path: string | null,
        gate_result: gate_status | null
      }
    }
  }
}
```

## Activation Contract

Use this skill when:
- Designing or auditing authentication, authorization, or access control rules.
- Reviewing third-party package dependencies for security advisories.
- Conducting static code analysis (SAST) to find injections (SQL, Command, XSS), hardcoded credentials, or cryptographic flaws.
- Planning sprint tasks related to security hardening.
- Integrating security checkpoints into a CI/CD workflow.

Do not use this skill for:
- Standard QA testing (use `qa-engineer` instead).
- Writing basic unit tests unless they directly target a security vulnerability fix (use `unit-testing`).

## Hard Rules

- **Strict Vulnerability Classification:** Vulnerabilities must be classified strictly based on CVSS severity (Critical, High, Medium, Low).
- **Secrets Management Guardrails:** Never write secrets, passwords, API keys, or certificates to the repository, tests, or documentation. If found, immediately guide the user on revocation.
- **Remediation Non-Regression:** Any remediation changes must be validated by running existing tests and re-running the security audit.

## Decision Gates

| Scenario | Mode / Action |
|---|---|
| New feature design or architectural change | Run `threat_modeling` |
| Dependency update or regular code audit | Run `security_audit` |
| Vulnerability detected and requires fixing | Run `remediate` |
| Security fix completed and needs sign-off | Run `verify_security` |
| PR merge gate or Release verification | Run `cicd_gate` |

## Execution Steps

1. **Context Discovery:** Scan the project's codebase, `package.json` / dependency manifests, and existing configuration to infer the tech stack.
2. **Execution:** Run the selected operational mode based on the trigger or `OnInvoke` request.
3. **Report Generation:** For planning, audits, and verifications, save metadata in Engram and output markdown reports to `.ia/security/`.
4. **Handoff:** If blockers are identified, format them as clear issues with actionable instructions for the developer or calling agent.

## Output Contract

Return:
- A list of identified vulnerabilities (if any) formatted as `Vulnerability` objects.
- Paths to the generated report files (e.g., `.ia/security/audit_report.md`).
- A status code (`success`, `warning`, `failure`) and gate result (`pass`, `block`, `warn`).

## References

- `.ia/` — Product and technical architecture context
- `.agents/skills/qa-engineer/SKILL.md` — QA engineer orchestration contact
- `.agents/skills/tech-lead/SKILL.md` — Backlog task creation target
