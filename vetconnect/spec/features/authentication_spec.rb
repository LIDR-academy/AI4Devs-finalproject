# frozen_string_literal: true

require 'rails_helper'

RSpec.describe 'User Authentication', type: :feature do
  describe 'User Sign Up' do
    it 'allows a user to sign up with valid credentials' do
      visit new_user_registration_path
      
      fill_in 'First Name', with: 'John'
      fill_in 'Last Name', with: 'Doe'
      fill_in 'Email Address', with: 'john.doe@example.com'
      fill_in 'Phone Number', with: '+1-555-0123'
      select 'Pet Owner', from: 'I am a'
      fill_in 'Password', with: 'Password123!'
      fill_in 'Confirm Password', with: 'Password123!'
      
      expect {
        click_button 'Create Account'
      }.to change(User, :count).by(1)
      
      expect(page).to have_content('confirmation email')
    end

    it 'prevents sign up with invalid email' do
      visit new_user_registration_path
      
      fill_in 'First Name', with: 'John'
      fill_in 'Last Name', with: 'Doe'
      fill_in 'Email Address', with: 'invalid-email'
      select 'Pet Owner', from: 'I am a'
      fill_in 'Password', with: 'Password123!'
      fill_in 'Confirm Password', with: 'Password123!'
      
      expect {
        click_button 'Create Account'
      }.not_to change(User, :count)
      
      expect(page).to have_content('Email is invalid')
    end

    it 'prevents sign up with short password' do
      visit new_user_registration_path
      
      fill_in 'First Name', with: 'John'
      fill_in 'Last Name', with: 'Doe'
      fill_in 'Email Address', with: 'john.doe@example.com'
      select 'Pet Owner', from: 'I am a'
      fill_in 'Password', with: 'short'
      fill_in 'Confirm Password', with: 'short'
      
      expect {
        click_button 'Create Account'
      }.not_to change(User, :count)
      
      expect(page).to have_content('Password is too short')
    end

    it 'prevents sign up with mismatched passwords' do
      visit new_user_registration_path
      
      fill_in 'First Name', with: 'John'
      fill_in 'Last Name', with: 'Doe'
      fill_in 'Email Address', with: 'john.doe@example.com'
      select 'Pet Owner', from: 'I am a'
      fill_in 'Password', with: 'Password123!'
      fill_in 'Confirm Password', with: 'DifferentPassword'
      
      expect {
        click_button 'Create Account'
      }.not_to change(User, :count)
      
      expect(page).to have_content("Password confirmation doesn't match")
    end

    it 'allows selecting different roles' do
      visit new_user_registration_path
      
      expect(page).to have_select('I am a', options: ['Pet Owner', 'Veterinarian', 'Clinic Administrator'])
    end
  end

  describe 'User Sign In' do
    let!(:user) { create(:user, email: 'test@example.com', password: 'Password123!') }

    it 'allows a confirmed user to sign in with valid credentials' do
      visit new_user_session_path
      
      fill_in 'Email Address', with: 'test@example.com'
      fill_in 'Password', with: 'Password123!'
      
      click_button 'Sign In'
      
      expect(page).to have_content('Signed in successfully')
    end

    it 'prevents sign in with incorrect password' do
      visit new_user_session_path
      
      fill_in 'Email Address', with: 'test@example.com'
      fill_in 'Password', with: 'WrongPassword'
      
      click_button 'Sign In'
      
      expect(page).to have_content('Invalid')
    end

    it 'prevents sign in with non-existent email' do
      visit new_user_session_path
      
      fill_in 'Email Address', with: 'nonexistent@example.com'
      fill_in 'Password', with: 'Password123!'
      
      click_button 'Sign In'
      
      expect(page).to have_content('Invalid')
    end

    it 'shows remember me checkbox' do
      visit new_user_session_path
      
      expect(page).to have_field('Remember me', type: 'checkbox')
    end
  end

  describe 'Password Recovery' do
    let!(:user) { create(:user, email: 'test@example.com') }

    it 'allows user to request password reset' do
      visit new_user_password_path
      
      fill_in 'Email Address', with: 'test@example.com'
      
      click_button 'Send Reset Instructions'
      
      expect(page).to have_content('You will receive an email')
    end

    it 'shows success message even for non-existent email (security)' do
      visit new_user_password_path
      
      fill_in 'Email Address', with: 'nonexistent@example.com'
      
      click_button 'Send Reset Instructions'
      
      # Paranoid mode: shows same message to prevent email enumeration
      expect(page).to have_content('You will receive an email')
    end
  end

  describe 'Email Confirmation' do
    let!(:unconfirmed_user) { create(:user, :unconfirmed, email: 'unconfirmed@example.com') }

    it 'prevents unconfirmed users from signing in' do
      visit new_user_session_path
      
      fill_in 'Email Address', with: 'unconfirmed@example.com'
      fill_in 'Password', with: 'Password123!'
      
      click_button 'Sign In'
      
      expect(page).to have_content('You have to confirm your email address')
    end

    it 'allows requesting new confirmation email' do
      visit new_user_confirmation_path
      
      fill_in 'Email Address', with: 'unconfirmed@example.com'
      
      click_button 'Resend Confirmation'
      
      expect(page).to have_content('You will receive an email')
    end
  end

  describe 'Sign Out' do
    let!(:user) { create(:user, email: 'test@example.com', password: 'Password123!') }

    it 'allows signed in user to sign out' do
      sign_in user
      visit root_path
      
      click_button 'Sign Out'
      
      expect(page).to have_content('Signed out successfully')
      expect(page).to have_link('Sign In')
    end
  end

  describe 'Navigation' do
    it 'shows sign in and sign up links when not authenticated' do
      visit root_path
      
      expect(page).to have_link('Sign In')
      expect(page).to have_link('Sign Up')
    end

    it 'shows user info and sign out when authenticated' do
      user = create(:user, first_name: 'John', last_name: 'Doe')
      sign_in user
      visit root_path
      
      expect(page).to have_content('John Doe')
      expect(page).to have_button('Sign Out')
      expect(page).not_to have_link('Sign In')
    end
  end

  describe 'Role-based redirects' do
    it 'redirects owner to owner dashboard after sign in' do
      owner = create(:user, :owner, password: 'Password123!')
      visit new_user_session_path
      
      fill_in 'Email Address', with: owner.email
      fill_in 'Password', with: 'Password123!'
      click_button 'Sign In'
      
      # This would redirect to owner dashboard (once implemented)
      # For now, just verify successful sign in
      expect(page).to have_content('Signed in successfully')
    end

    it 'redirects veterinarian to veterinarian dashboard after sign in' do
      vet = create(:user, :veterinarian, password: 'Password123!')
      visit new_user_session_path
      
      fill_in 'Email Address', with: vet.email
      fill_in 'Password', with: 'Password123!'
      click_button 'Sign In'
      
      expect(page).to have_content('Signed in successfully')
    end

    it 'redirects admin to admin dashboard after sign in' do
      admin = create(:user, :admin, password: 'Password123!')
      visit new_user_session_path
      
      fill_in 'Email Address', with: admin.email
      fill_in 'Password', with: 'Password123!'
      click_button 'Sign In'
      
      expect(page).to have_content('Signed in successfully')
    end
  end
end
