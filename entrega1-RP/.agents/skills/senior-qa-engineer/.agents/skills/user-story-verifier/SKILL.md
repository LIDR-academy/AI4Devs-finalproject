---
name: user-story-static-verifier
description: Skill for static verification and analysis of user stories in agile development, ensuring they meet best practices like INVEST criteria and detecting common defects (ambiguity, omission, inconsistency, inaccuracy, non-testability, scope creep).
---

# User Story Static Verifier

This skill helps analyze user stories statically to verify their quality, completeness, and detect common defects.

## When to Use

Use this skill when you need to review or validate user stories for:

- Completeness
- Clarity
- Adherence to agile principles
- INVEST criteria (Independent, Negotiable, Valuable, Estimable, Small, Testable)
- Common requirement defects (ambiguity, omission, inconsistency, etc.)

## How to Analyze a User Story

1. **Check Format**: Ensure it follows the standard format: "As a [role], I want [feature] so that [benefit]"

2. **INVEST Criteria**:
   - **Independent**: The story should be self-contained and not depend on other stories.
   - **Negotiable**: Details should be open to discussion with stakeholders.
   - **Valuable**: The story must provide clear value to the end user.
   - **Estimable**: The effort required should be estimable by the team.
   - **Small**: The story should be small enough to complete within one sprint.
   - **Testable**: There must be clear acceptance criteria to verify completion.

3. **Additional Checks**:
   - **Acceptance Criteria**: Ensure they are specific, measurable, and testable.
   - **Clarity**: Avoid ambiguous language; use clear, concise terms.
   - **Role Definition**: The "As a" part should specify a real user role.
   - **Benefit**: The "so that" part should explain the business value.

## Requirement Defect Matrix

Scan user stories for these common defects:

### 1. Ambiguity
**What it is**: Use of subjective terms that can be interpreted differently by developers and QA.

**Example** ❌: "The system must load the report quickly."

**Why it fails**: What is "quickly"? 1s? 10s? Cannot be measured objectively.

**Fix**: "The system must load the report in under 3 seconds."

### 2. Omission
**What it is**: Missing critical information needed to develop or test the complete functionality.

**Example** ❌: "User can pay with credit card."

**Why it fails**: What card brands? What happens if it's rejected? Missing negative flow.

**Fix**: "User can pay with Visa, Mastercard, or Amex. If payment is rejected, display error message with reason and allow retry."

### 3. Inconsistency
**What it is**: Information within the same user story (or related stories) that contradicts itself.

**Example** ❌:
- Title: "Payment in Dollars only"
- Criterion: "Allow selecting Euros"

**Why it fails**: Title and criterion say opposite things. Total confusion.

**Fix**: Align title and criteria - decide on single currency or multi-currency and be consistent.

### 4. Inaccuracy
**What it is**: Incorrect, imprecise, outdated, or technically wrong information.

**Example** ❌: "The system should calculate an approximate 10% discount."

**Why it fails**: Doesn't define an exact value for comparison. How many decimals? What margin of error is acceptable?

**Fix**: "The system must calculate a 10% discount rounded to 2 decimal places."

### 5. Non-Testable
**What it is**: Requirements that have no logical or technical way to be verified.

**Example** ❌: "The interface must be beautiful and intuitive."

**Why it fails**: "Beautiful" is subjective. Cannot be automated or measured.

**Fix**: "The interface must pass WCAG 2.1 Level AA accessibility standards and complete user tasks in ≤3 clicks."

### 6. Scope Creep
**What it is**: Including unnecessary features that don't add value to the current story.

**Example** ❌: "When logging in, display fireworks on the screen."

**Why it fails**: Adds complexity and risk without clear business value.

**Fix**: Remove unless explicitly required for business goals. Keep stories focused on core value.

## ISTQB Test Design Techniques Applicability

Verify that the user story provides sufficient information to apply standard ISTQB Foundation Level test design techniques:

### Black-Box Techniques

**1. Equivalence Partitioning**
- Story should identify input/output domains that can be partitioned into valid and invalid classes
- Example: "User can enter age between 18-65" → Valid partition: 18-65, Invalid: <18, >65

**2. Boundary Value Analysis**
- Story must specify clear boundaries, ranges, or thresholds
- Example: "Password must be 8-20 characters" → Test boundaries: 7, 8, 20, 21 characters

**3. Decision Tables**
- Story should have multiple conditions with clear business rules
- Example: "Discount = 10% if total >$100 AND customer is VIP" → Can create decision table with combinations

**4. State Transition Testing**
- Story must describe state changes and transitions
- Example: "Order status: Draft → Submitted → Approved → Shipped" → Can test valid/invalid transitions

### White-Box Techniques Readiness

**Code Coverage**
- Story should be specific enough to derive logical paths
- Acceptance criteria should cover positive and negative flows

### Experience-Based Techniques

**Error Guessing**
- Story provides context for common error scenarios
- Example: Missing required fields, timeout scenarios, edge cases

### Verification Checklist

When reviewing a user story, verify it enables:
- ✓ **Clear input domains** for equivalence partitioning
- ✓ **Defined boundaries** for boundary value analysis
- ✓ **Business rules** for decision table creation
- ✓ **State flows** for state transition testing
- ✓ **Negative scenarios** for comprehensive test coverage
- ✓ **Measurable acceptance criteria** for test oracle definition

### Example: Testability Analysis

**User Story**: "As a customer, I want to apply a discount code so that I can reduce my order total."

**ISTQB Technique Applicability**:
- ❌ **Equivalence Partitioning**: Missing - What makes a code valid/invalid? Format? Expiration?
- ❌ **Boundary Values**: Missing - Any limits on code usage? Min/max discount amount?
- ❌ **Decision Tables**: Missing - Rules unclear (e.g., one code per order? Stackable?)
- ✓ **State Transition**: Possible - Code states: unused → applied → redeemed
- ⚠️ **Negative scenarios**: Partially - What if code is expired, invalid, or already used?

**Improved Version**: "As a customer, I want to apply a single-use alphanumeric discount code (5-15 chars) so that I can reduce my order total by 5-50%. The code must be valid (not expired, not previously used). If invalid, display specific error message. Only one code per order."

**Now supports**:
- ✓ Partitioning: Valid format (5-15 alphanumeric) vs invalid (too short, special chars, etc.)
- ✓ Boundary Values: 4, 5, 15, 16 characters; 4%, 5%, 50%, 51% discount
- ✓ Decision Tables: code valid/invalid × expired/active × used/unused combinations
- ✓ State Transition: unused → applied (if valid) → redeemed / error states
- ✓ Negative cases: expired, invalid format, already used, multiple codes

## Example Analysis

**User Story**: "As a user, I want to login so that I can access my account."

**Analysis**:
- Format: ✓ Correct
- Independent: ✓ Yes
- Negotiable: ✓ Can discuss login methods
- Valuable: ✓ Access account
- Estimable: ✓ Standard login feature
- Small: ✓ Yes
- Testable: ✓ With acceptance criteria like "User enters credentials and sees dashboard"

**Defect Check**:
- Ambiguity: ✓ None
- Omission: ⚠️ Missing: What happens on failed login? Password requirements? Session timeout?
- Inconsistency: ✓ None
- Inaccuracy: ✓ None
- Non-Testable: ✓ Testable with proper acceptance criteria
- Scope Creep: ✓ Focused on core functionality

**Recommendation**: Add acceptance criteria for negative flows (failed login, account locked) and specify security requirements.

---

**Bad Example**: "The system should load data fast and look nice."

**Defects Found**:
- ❌ **Ambiguity**: "fast" and "nice" are subjective
- ❌ **Omission**: No user role, no benefit, missing format
- ❌ **Non-Testable**: Cannot measure "nice" objectively
- ❌ **Inaccuracy**: "fast" has no specific threshold

**Fixed Version**: "As a sales manager, I want the customer dashboard to load in under 2 seconds so that I can quickly access client information during calls."

When analyzing user stories, provide clear feedback on both INVEST criteria and defect detection, with actionable suggestions for improvement.