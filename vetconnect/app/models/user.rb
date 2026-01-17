# frozen_string_literal: true

# User model for VetConnect authentication system
# Supports three types of users: owners (pet owners), veterinarians, and admins
class User < ApplicationRecord
  # Include default devise modules. Others available are:
  # :lockable, :timeoutable, :omniauthable
  devise :database_authenticatable, :registerable,
         :recoverable, :rememberable, :validatable,
         :confirmable, :trackable

  # Role-based access control using enum
  # owner: Pet owners who manage their pets' health records
  # veterinarian: Veterinary professionals who provide medical services
  # admin: System administrators with full access
  enum role: { owner: 0, veterinarian: 1, admin: 2 }, _prefix: true

  # Associations
  has_many :pets, dependent: :destroy
  has_many :appointments_as_vet, class_name: 'Appointment', foreign_key: 'veterinarian_id', dependent: :nullify
  has_many :medical_records_created, class_name: 'MedicalRecord', foreign_key: 'veterinarian_id', dependent: :nullify
  has_many :documents_uploaded, class_name: 'Document', foreign_key: 'uploaded_by_id', dependent: :nullify

  # Validations
  validates :email, presence: true, 
                   uniqueness: { case_sensitive: false },
                   format: { with: URI::MailTo::EMAIL_REGEXP }
  
  validates :role, presence: true
  validates :first_name, presence: true, length: { minimum: 2, maximum: 50 }
  validates :last_name, presence: true, length: { minimum: 2, maximum: 50 }
  validates :phone, format: { 
    with: /\A\+?[0-9\s\-()]+\z/, 
    message: "must be a valid phone number" 
  }, allow_blank: true, length: { minimum: 10, maximum: 20 }

  # Callbacks
  before_validation :normalize_email
  before_save :normalize_phone

  # Scopes
  scope :owners, -> { where(role: :owner) }
  scope :veterinarians, -> { where(role: :veterinarian) }
  scope :admins, -> { where(role: :admin) }
  scope :confirmed, -> { where.not(confirmed_at: nil) }
  scope :unconfirmed, -> { where(confirmed_at: nil) }

  # Instance methods
  def full_name
    "#{first_name} #{last_name}"
  end

  def initials
    "#{first_name[0]}#{last_name[0]}".upcase
  end

  # Check if user has admin privileges
  def admin?
    role_admin?
  end

  # Check if user is a veterinarian
  def veterinarian?
    role_veterinarian?
  end

  # Check if user is a pet owner
  def owner?
    role_owner?
  end

  # Override Devise's send_devise_notification to use ActiveJob
  def send_devise_notification(notification, *args)
    devise_mailer.send(notification, self, *args).deliver_later
  end

  private

  # Normalize email to lowercase and strip whitespace
  def normalize_email
    self.email = email.to_s.downcase.strip if email.present?
  end

  # Normalize phone number by removing non-numeric characters
  def normalize_phone
    if phone.present?
      # Keep only digits, spaces, hyphens, parentheses, and plus sign
      self.phone = phone.gsub(/[^\d\s\-+()]/, '')
    end
  end
end
