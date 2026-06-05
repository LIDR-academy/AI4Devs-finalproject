# GitLab CI/CD Pipeline Configuration Template

This reference document contains the default pipeline configuration for projects running on GitLab CI/CD.

## Default Workflow File (`.gitlab-ci.yml`)

```yaml
stages:
  - install
  - test
  - deploy

cache:
  paths:
    - node_modules/

install_dependencies:
  stage: install
  image: node:20-alpine
  script:
    - npm ci
  artifacts:
    paths:
      - node_modules/
    expire_in: 1 hour

run_unit_tests:
  stage: test
  image: node:20-alpine
  dependencies:
    - install_dependencies
  script:
    - npm run test:coverage
  coverage: '/All files\s*\|\s*([\d\.]+)/'
  artifacts:
    paths:
      - coverage/
    expire_in: 7 days

run_e2e_tests:
  stage: test
  image: mcr.microsoft.com/playwright:v1.40.0-jammy
  dependencies:
    - install_dependencies
  script:
    - npm run test:e2e
  artifacts:
    when: always
    paths:
      - playwright-report/
    expire_in: 7 days

run_a11y_tests:
  stage: test
  image: node:20-alpine
  dependencies:
    - install_dependencies
  script:
    - npm run test:a11y
```
