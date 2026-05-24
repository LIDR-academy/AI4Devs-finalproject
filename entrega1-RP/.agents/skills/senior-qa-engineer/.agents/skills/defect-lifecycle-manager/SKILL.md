---
name: defect-lifecycle-manager
description: Manage the complete defect lifecycle from discovery through closure, including logging, tracking, metrics analysis, root cause analysis, and stakeholder reporting.
---

# Defect Lifecycle Manager

Expert skill for managing defects throughout their lifecycle and tracking quality metrics.

## When to Use

Use this skill when you need to:
- Log new defects with complete information
- Track defect status and lifecycle
- Analyze defect trends and metrics
- Conduct root cause analysis
- Report quality status to stakeholders
- Verify defect fixes
- Prevent defect recurrence

## Defect Lifecycle States

```
NEW → ASSIGNED → IN PROGRESS → RESOLVED → VERIFIED → CLOSED
                                    ↓
                                REOPENED (if verification fails)
```

### State Definitions

**NEW**: Just logged, awaiting triage
**ASSIGNED**: Assigned to developer
**IN PROGRESS**: Developer actively working
**RESOLVED**: Fix completed, ready for verification
**VERIFIED**: QA confirmed fix works
**CLOSED**: Accepted and archived
**REOPENED**: Fix didn't work, back to dev

## Defect Logging Standards

### Complete Defect Report

```
Defect ID: [Auto-generated or manual]
Title: [Action] + [Component] + [Unexpected Behavior]
  Example: "Login button does not respond on mobile Chrome"

Type: [Functional/UI/Performance/Security/Data/Integration]
Severity: [Critical/High/Medium/Low]
Priority: [P0/P1/P2/P3]

Reported By: [Name]
Date Reported: [Date]
Detected In: [Environment]
Build/Version: [x.y.z]

Environment Details:
- OS: [Platform + version]
- Browser/Device: [Details]
- Network: [WiFi/Mobile/etc]

Preconditions:
[System state before reproduction]

Steps to Reproduce:
1. [Exact action]
2. [Exact action]
3. [Exact action]

Expected Result:
[What should happen per requirements]

Actual Result:
[What actually happened]

Reproducibility: [Always / Intermittent (X out of Y attempts)]

Impact:
[Who is affected? How many users? What's blocked?]

Attachments:
- Screenshot: [filename]
- Error log: [filename]
- Video: [filename]
- Network trace: [filename]

Additional Context:
- Related defects: [Links]
- Related requirements: [Links]
- Workaround: [If available]
```

## Defect Triage Process

### Step 1: Validate
- Can you reproduce it?
- Is it a duplicate?
- Is it really a defect or expected behavior?

### Step 2: Categorize
- Determine type and root cause area
- Assign to correct component/team

### Step 3: Assess Impact
- Severity (technical impact)
- Priority (business impact + timing)
- Customer impact

### Step 4: Assign & Schedule
- Route to appropriate developer
- Set target fix version
- Establish timeline

## Defect Metrics & Analysis

### Key Metrics

**Defect Density**
```
Defects per 1000 lines of code
or
Defects per feature/module
```

**Defect Detection Rate**
```
(Defects found in QA) / (Total defects found)
Goal: 90%+ caught before production
```

**Defect Age**
```
Days from New → Closed
Track: Average, Median, Max
```

**Fix Time**
```
Days from Assigned → Resolved
By severity level
```

**Reopen Rate**
```
(Reopened defects) / (Total resolved)
Goal: < 10%
```

**Defect Escape Rate**
```
(Production defects) / (Total defects)
Goal: < 5%
```

### Trend Analysis

Monitor weekly/monthly:
- Defect discovery rate (increasing/decreasing?)
- Open vs closed trend (gap closing or widening?)
- Severity distribution (more critical over time?)
- Component hot spots (which areas have most defects?)
- Root cause patterns (similar issues repeating?)

## Root Cause Analysis

### 5 Whys Technique

```
Problem: Users unable to login

Why? → Authentication service returned error 500
Why? → Database connection timed out
Why? → Connection pool exhausted
Why? → Pool size set too low for expected load
Why? → Configuration not updated after scaling users

Root Cause: Incorrect configuration management
Prevention: Add load testing + auto-scaling configs
```

### Common Root Causes

1. **Requirements Issues**
   - Missing information
   - Ambiguous specifications
   - Changing requirements

2. **Design Issues**
   - Incorrect architecture
   - Missing edge case handling
   - Performance not considered

3. **Implementation Issues**
   - Coding errors
   - Logic mistakes
   - Missing validation

4. **Testing Gaps**
   - Test cases missing scenarios
   - Insufficient coverage
   - Environment differences

5. **Environmental Issues**
   - Configuration problems
   - Deployment errors
   - Integration failures

## Defect Prevention

Based on root cause analysis:

- **Update Requirements**: Add missing acceptance criteria
- **Enhance Test Cases**: Cover discovered edge cases
- **Improve Code Reviews**: Add checklists for common issues
- **Automate Detection**: Create automated tests
- **Team Training**: Share lessons learned
- **Process Improvements**: Update development practices

## Defect Verification

When defect is marked RESOLVED:

### Verification Steps

1. **Review Fix**: Understand what was changed
2. **Verify Original Issue**: Run original reproduction steps
3. **Test Related Areas**: Check for unintended side effects
4. **Regression Test**: Ensure fix doesn't break other features
5. **Edge Cases**: Test variations of original scenario
6. **Document Result**: Update defect with verification notes

### Verification Outcomes

- ✓ **VERIFIED**: Fix works, no side effects → CLOSED
- ✗ **REOPENED**: Issue still occurs or new issues introduced
- ⚠️ **PARTIAL**: Fixed but with new concerns → Discuss with dev

## Defect Status Reports

### Daily Standup Update
```
Yesterday: Fixed 5 defects, found 3 new
Today: Will verify 8 fixes, test new feature
Blockers: 2 critical defects blocking release
```

### Weekly Status Report
```
Week: [Date range]

Defect Summary:
- Opened: 45
- Closed: 38
- Net Change: +7

Open Defects: 67 total
- Critical: 2
- High: 12
- Medium: 35
- Low: 18

Top Risks:
1. [Critical defect description + impact]
2. [High priority issue + timeline]

Trends:
- Defect rate decreasing (good)
- Backlog growing (concerning)
- Most defects in payment module (focus area)
```

### Release Readiness Report
```
Release: v2.3.0
Date: [Target date]

Status: [GREEN / YELLOW / RED]

Defect Gate Criteria:
✓ Critical defects: 0 (Goal: 0) 
✓ High defects: 2 (Goal: ≤3)
✗ P0/P1 open: 1 (Goal: 0) ← BLOCKER

Recommendation: [Go / No-Go / Conditional Go]

Conditions for Go:
1. [Must fix BUG-XXX by date]
2. [Must complete regression testing]
```

## Best Practices

- ✓ Log defects immediately, don't batch
- ✓ Be specific and factual, not subjective
- ✓ Include all reproduction steps
- ✓ Attach evidence (screenshots, logs)
- ✓ Follow up on assigned defects
- ✓ Verify fixes thoroughly
- ✓ Close defects promptly
- ✓ Analyze patterns for prevention
- ✓ Communicate risks early
- ✓ Keep stakeholders informed
