# frozen_string_literal: true

class ApplicationMailer < ActionMailer::Base
  default from: "noreply@vetconnect.com"
  layout "mailer"
end
