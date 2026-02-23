# Pin npm packages by running ./bin/importmap

pin "application", preload: true
pin "@hotwired/turbo-rails", to: "turbo.min.js", preload: true
pin "@hotwired/stimulus", to: "stimulus.min.js", preload: true
pin "@hotwired/stimulus-loading", to: "stimulus-loading.js", preload: true

# Note: Currently no Stimulus controllers are defined in this application.
# The controllers/application.js and controllers/index.js files exist but are not being used.
# If you add Stimulus controllers later, uncomment the following line to pin them automatically:
# pin_all_from "app/javascript/controllers", under: "controllers"
