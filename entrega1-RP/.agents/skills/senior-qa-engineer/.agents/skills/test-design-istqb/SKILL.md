---
name: test-design-istqb
description: Apply ISTQB Foundation Level test design techniques including equivalence partitioning, boundary value analysis, decision tables, and state transition testing to create comprehensive test cases.
---

# Test Design - ISTQB Techniques

Expert skill for designing comprehensive test cases using ISTQB Foundation Level test design techniques.

## When to Use

Use this skill when you need to:
- Design test cases from requirements
- Apply black-box testing techniques
- Create test data specifications
- Ensure comprehensive test coverage
- Generate test scenarios for positive, negative, and edge cases

## ISTQB Test Design Techniques

### 1. Equivalence Partitioning

**What it is**: Divide input domains into classes where all members should be treated the same.

**How to apply**:
1. Identify all inputs and outputs
2. Determine valid and invalid partitions
3. Create one test case per partition
4. Cover both valid and invalid classes

**Example**:
```
Requirement: Age must be 18-65
Partitions:
- Invalid: < 18 (e.g., 17)
- Valid: 18-65 (e.g., 30)
- Invalid: > 65 (e.g., 66)
```

### 2. Boundary Value Analysis

**What it is**: Test at the edges of equivalence partitions where defects often hide.

**How to apply**:
1. Identify boundaries in requirements
2. Test: min-1, min, min+1, max-1, max, max+1
3. Focus on limits, ranges, and thresholds

**Example**:
```
Requirement: Password 8-20 characters
Test values: 7, 8, 9, 19, 20, 21 characters
```

### 3. Decision Tables

**What it is**: Test combinations of conditions and their resulting actions.

**How to apply**:
1. Identify conditions (inputs/states)
2. List possible actions (outputs/behaviors)
3. Create table with all meaningful combinations
4. Generate test cases from each column

**Example**:
```
Condition 1: Premium customer? (Y/N)
Condition 2: Order > $100? (Y/N)

| Premium | Order>$100 | Discount |
|---------|-----------|----------|
| Y       | Y         | 20%      |
| Y       | N         | 10%      |
| N       | Y         | 10%      |
| N       | N         | 0%       |

= 4 test cases
```

### 4. State Transition Testing

**What it is**: Test how system behavior changes based on state and events.

**How to apply**:
1. Identify all states
2. Map valid transitions
3. Identify invalid transitions
4. Test all valid paths
5. Test invalid transitions for error handling

**Example**:
```
Order States: Draft → Submitted → Approved → Shipped → Delivered

Valid transitions:
- Draft → Submitted
- Submitted → Approved
- Approved → Shipped
- Shipped → Delivered

Invalid transitions to test:
- Draft → Shipped (should reject)
- Delivered → Draft (should reject)
```

### 5. Error Guessing

**What it is**: Use experience to anticipate common defects.

**Common areas**:
- Empty/null values
- Special characters
- Boundary conditions
- Concurrent access
- Network failures
- Timeout scenarios

## Test Case Template

```
Test Case ID: TC-XXX
Title: [Clear, descriptive title]
Preconditions: [System state before test]
Test Data: [Specific values to use]

Steps:
1. [Action]
2. [Action]
3. [Action]

Expected Results:
1. [Expected outcome]
2. [Expected outcome]
3. [Expected outcome]

Actual Results: [Filled during execution]
Status: [Pass/Fail]
Notes: [Any observations]
```

## Coverage Checklist

Ensure test design includes:
- ✓ Positive scenarios (happy path)
- ✓ Negative scenarios (error handling)
- ✓ Edge cases (boundaries)
- ✓ Data validation tests
- ✓ State transitions
- ✓ Error messages verification
- ✓ Performance considerations
- ✓ Security aspects
- ✓ Usability/UX validation

## Test Design Output

Deliverables:
1. **Test cases** with clear steps and expected results
2. **Test data specifications** with valid/invalid examples
3. **Traceability matrix** linking requirements to tests
4. **Coverage analysis** showing technique application
5. **Risk assessment** highlighting critical test areas

## Best Practices

- Start with happy path, then add negative cases
- Use meaningful test case IDs with prefixes
- Keep test cases atomic (one objective per test)
- Make steps reproducible by anyone
- Include cleanup/teardown procedures
- Review test cases with team
- Update tests when requirements change
