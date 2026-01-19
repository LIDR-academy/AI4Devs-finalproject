# frozen_string_literal: true

Rails.application.routes.draw do
  # Devise routes for authentication (registration disabled - only admin can create users)
  devise_for :users, controllers: {
    sessions: 'users/sessions',
    passwords: 'users/passwords',
    confirmations: 'users/confirmations'
  }, skip: [:registrations]

  # Root path
  root 'home#index'

  # User management (admin only)
  resources :users do
    member do
      patch :change_role
    end
  end

  # Pets resources
  resources :pets do
    # Nested routes for pet-specific resources
    resources :appointments, only: [:new, :create, :index]
    resources :medical_records, only: [:new, :create, :index]
    resources :documents, only: [:new, :create, :index]
  end

  # Appointments resources
  resources :appointments do
    member do
      post :complete
      post :cancel
      post :confirm
      post :mark_no_show
    end
    collection do
      get :available_slots
    end
  end

  # Medical records nested under appointments
  resources :appointments, only: [] do
    resources :medical_records, only: [:new, :create]
  end

  # Clinics resources (admin only)
  resources :clinics

  # Medical records resources
  resources :medical_records, except: [:destroy] do
    member do
      post :add_notes
    end
  end

  # Documents resources
  resources :documents do
    member do
      get :download
      post :share
    end
  end

  # Role-specific dashboards
  namespace :owner do
    root 'dashboard#index', as: :root
    resources :pets, only: [:index, :show]
    resources :appointments, only: [:index, :show]
  end

  namespace :veterinarian do
    root 'dashboard#index', as: :root
    resources :appointments, only: [:index, :show]
    resources :medical_records, only: [:index, :show, :new, :create]
  end

  namespace :admin do
    root 'dashboard#index', as: :root
    resources :users
    resources :reports, only: [:index, :show]
    resource :clinic_settings, only: [:show, :edit, :update]
  end

  # API routes (future)
  namespace :api do
    namespace :v1 do
      resources :pets, only: [:index, :show]
      resources :appointments, only: [:index, :show, :create, :update]
    end
  end

  # Health check
  get 'up' => 'rails/health#show', as: :rails_health_check

  # Defines the root path route ("/")
  # root "posts#index"
end
