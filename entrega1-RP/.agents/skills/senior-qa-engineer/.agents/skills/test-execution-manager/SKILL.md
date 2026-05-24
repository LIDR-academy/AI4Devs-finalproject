---
name: test-execution-manager
description: Manage test execution lifecycle including test suite runs, defect logging, exploratory testing, and execution reporting. Covers smoke, regression, functional, and integration testing.
---

# Test Execution Manager

Expert skill for executing tests systematically and managing the test execution lifecycle.

## When to Use

Use this skill when you need to:
- Execute test suites
- Log defects with complete information
- Perform exploratory testing
- Monitor test execution progress
- Report test results
- Triage test failures

## Test Execution Types

### 1. Smoke Testing
**Purpose**: Quick validation that critical functionality works
**When**: After each build/deployment
**Scope**: Core features only (15-30 minutes)
**Goal**: Determine if further testing is viable

### 2. Regression Testing
**Purpose**: Verify existing functionality still works
**When**: Before each release
**Scope**: Previously working features
**Goal**: Catch unintended side effects

### 3. Functional Testing
**Purpose**: Verify features work per requirements
**When**: During development and QA cycles
**Scope**: All functional requirements
**Goal**: Validate business logic

### 4. Integration Testing
**Purpose**: Verify components work together
**When**: After module completion
**Scope**: Inter-system interfaces, APIs, data flow
**Goal**: Validate system integration

### 5. Exploratory Testing
**Purpose**: Unscripted investigation to find edge cases
**When**: Throughout testing cycle
**Scope**: Areas prone to defects
**Goal**: Discover unexpected behaviors

## Test Execution Workflow

```
1. Prepare Test Environment
   - Verify environment setup
   - Load test data
   - Check system availability

2. Execute Test Suite
   - Follow test case steps exactly
   - Document actual results
   - Capture screenshots/logs for failures

3. Log Defects
   - Use defect template
   - Include reproduction steps
   - Attach evidence

4. Triage Results
   - Categorize: Pass/Fail/Blocked
   - Prioritize failures
   - Determine root cause

5. Report Status
   - Update test metrics
   - Communicate blockers
   - Provide recommendations
```

## Defect Logging Template

**Required Information:**

```
Defect ID: BUG-XXX
Title: [Clear, specific title]
Severity: [Critical/High/Medium/Low]
Priority: [P0/P1/P2/P3]

Environment:
- OS: [Windows/Mac/Linux + version]
- Browser: [Chrome/Firefox/etc + version]
- App Version: [x.y.z]
- Test Environment: [Dev/QA/Staging]

Steps to Reproduce:
1. [Exact step]
2. [Exact step]
3. [Exact step]

Expected Result: [What should happen]
Actual Result: [What actually happened]

Attachments:
- Screenshots
- Error logs
- Network traces
- Video recording (if applicable)

Additional Info:
- Frequency: [Always/Intermittent]
- Related tickets: [Links]
- Workaround: [If any]
```

## Severity Definitions

- **Critical**: System crash, data loss, security breach
- **High**: Major feature broken, no workaround
- **Medium**: Feature partially broken, workaround exists
- **Low**: Cosmetic issue, minor inconvenience

## Priority Definitions

- **P0**: Blocks release, fix immediately
- **P1**: Must fix before release
- **P2**: Should fix, can defer if needed
- **P3**: Nice to have, can be backlogged

## Test Execution Best Practices

### During Execution
- ✓ Execute tests exactly as written
- ✓ Don't assume - verify every step
- ✓ Capture evidence immediately
- ✓ Note environment details
- ✓ Report blockers immediately
- ✓ Retest fixed defects promptly

### Test Data Management
- ✓ Use test accounts, not production
- ✓ Reset data between test runs
- ✓ Protect sensitive information
- ✓ Document data dependencies

### Communication
- ✓ Daily test status updates
- ✓ Flag risks early
- ✓ Collaborate with developers
- ✓ Provide clear reproduction steps

## Test Execution Metrics

Track these metrics:
- **Test Pass Rate**: Passed / Total executed
- **Defect Detection Rate**: Defects found / Total tests
- **Test Coverage**: Tests executed / Total planned
- **Execution Progress**: Completed / Total
- **Blocked Tests**: Tests unable to run
- **Flaky Tests**: Inconsistent results

## Exploratory Testing Charter Template

```
Mission: [What to explore]
Duration: 60-90 minutes
Areas:
- [Specific feature/flow to investigate]
- [Edge cases to try]
- [Integration points]

Notes:
- [Observations]
- [Interesting behaviors]
- [Potential defects]

Defects Found: [Count + IDs]
Coverage: [What was tested]
Risks: [Concerns identified]
```

## Test Execution Report Template

```
Test Execution Summary
Date: [Date]
Sprint/Release: [Version]
Tester: [Name]

Overall Status: [On Track / At Risk / Blocked]

Test Results:
- Total Planned: XXX
- Executed: XXX
- Passed: XXX (XX%)
- Failed: XXX (XX%)
- Blocked: XXX (XX%)
- Remaining: XXX

Defects Summary:
- Critical: XX
- High: XX
- Medium: XX
- Low: XX
- Total: XX

Blockers:
1. [Description + impact]
2. [Description + impact]

Risks:
1. [Risk + mitigation]

Next Steps:
1. [Action item]
2. [Action item]
```

## Completion Criteria

A test cycle is complete when:
- ✓ All planned tests executed
- ✓ Critical defects fixed and verified
- ✓ Pass rate meets threshold (typically 95%+)
- ✓ No blocking defects remain
- ✓ Test evidence documented
- ✓ Sign-off obtained from stakeholders
