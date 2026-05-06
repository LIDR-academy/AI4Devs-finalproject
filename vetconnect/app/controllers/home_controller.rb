# frozen_string_literal: true

class HomeController < ApplicationController
  skip_before_action :authenticate_user!, only: [:index]
  
  def index
    # If user is signed in, redirect to their dashboard
    if user_signed_in?
      redirect_to after_sign_in_path_for(current_user)
    end
  end
end
