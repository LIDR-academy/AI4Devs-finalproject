# Test-Driven Development (TDD) Cycle Reference

This reference document defines the specific Red-Green-Refactor loop steps to be followed by testing agents.

## 1. RED Phase
1. **Define Test Requirements:** Extract input/output expectations from the user task.
2. **Write Failing Test:** Create the test file containing specs representing the new capability.
   - Do NOT write implementation code yet.
   - Ensure the query or class call would throw an error or fail assert logic.
3. **Execute and Verify Fails:**
   - Execute the test command targeting the new test file.
   - Confirm it fails with a *meaningful* error (e.g. `Function X is not defined` or `Expected Y but got undefined`).
   - If it passes or fails on compilation syntax error in the test file itself, correct the test spec.

---

## 2. GREEN Phase
1. **Implement Minimal Code:** Write only the minimal production code necessary to make the failing test pass.
   - Do not optimize, refactor, or write ahead-of-time abstractions.
2. **Execute Tests:** Run the test suite targeting the file.
   - If it passes, move to the Refactor stage.
   - If it fails, analyze the assertion error, fix the implementation, and run tests again.

---

## 3. REFACTOR Phase
1. **Identify Clean-up Targets:**
   - Eliminate duplicate logic.
   - Improve variable/function names.
   - Break down overly complex methods.
2. **Refactor Code:** Apply improvements carefully.
3. **Run Suite:** Re-execute unit tests. All tests MUST remain green. If a test fails, revert the refactor step.
