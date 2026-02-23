# Testing Strategy & Configuration

## 1. Testing Frameworks

- **Primary Framework**: **RSpec** (`rspec-rails`)
- **Assertion Library**: RSpec Expectation + `shoulda-matchers` for common Rails patterns.
- **System Testing**: `capybara` with `selenium-webdriver`.
- **Policy Testing**: `pundit-matchers`.

## 2. Test Pyramid & Types

The project follows a standard testing distribution:

- **Model Specs** (`spec/models/`):
  - Unit tests for ActiveRecord models.
  - validations, associations, and business logic.
- **Request Specs** (`spec/requests/`):
  - Integration tests for API endpoints and controllers.
  - Tests HTTP status codes, response bodies, and headers.
- **Feature/System Specs** (`spec/features/`):
  - End-to-end tests using Capybara.
  - Simulates user interactions in the browser.
- **Factories** (`spec/factories/`):
  - Used instead of fixtures.
  - Managed by `factory_bot_rails`.
  - Fake data generation via `faker`.

## 3. Test Configuration

### Database
- **Cleaner**: `database_cleaner-active_record` ensures a clean state between tests.
- **Transactional Fixtures**: Enabled (`config.use_transactional_fixtures = true`).

### RSpec Configuration (`spec/spec_helper.rb`, `spec/rails_helper.rb`)
- **Random Order**: Tests run in random order (`config.order = :random`) to surface order dependencies.
- **Profile**: 10 slowest examples are printed after the run.
- **Helpers**: Includes Devise helpers for Controller/Request/Feature specs.

## 4. Coverage & Quality

- **Tool**: `SimpleCov`
- **Minimum Coverage**: **80%** enforced.
- **Max Coverage Drop**: 5%.
- **Groups**:
  - Controllers
  - Models
  - Services
  - Jobs
  - Policies
  - Mailers
- **Reporting**: Coverage results are uploaded to Codecov via CI.

## 5. CI Integration

The Github Actions pipeline (`.github/workflows/ci_cd_pipeline.yml`) defines the test workflow:

1. **Services**: Spins up Postgres (v15) and Redis (v7) containers.
2. **Setup**: Installs Ruby (3.2.2) and Node (18).
3. **Database**: Creates and loads schema for `vetconnect_test`.
4. **Execution**:
   - Runs `bundle exec rspec` with JUnit formatter.
   - Runs `bundle exec rspec spec/system` for integration tests.
5. **Artifacts**: Uploads `rspec-results.xml` and coverage reports.
