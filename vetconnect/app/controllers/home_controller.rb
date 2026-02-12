# frozen_string_literal: true

class HomeController < ApplicationController
  # Use skip_authentication? instead of skip_before_action to avoid Devise loading issues
  def skip_authentication?
    action_name == 'index'
  end
  
  def index
    # If user is signed in, redirect to their dashboard
    if user_signed_in?
      redirect_to after_sign_in_path_for(current_user)
    end
  end
end
