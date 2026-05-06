# frozen_string_literal: true

require 'rails_helper'

RSpec.describe User, type: :model do
  describe 'validations' do
    subject { build(:user) }

    it { should validate_presence_of(:email) }
    it { should validate_uniqueness_of(:email).case_insensitive }
    it { should validate_presence_of(:role) }
    it { should validate_presence_of(:first_name) }
    it { should validate_presence_of(:last_name) }

    it { should validate_length_of(:first_name).is_at_least(2).is_at_most(50) }
    it { should validate_length_of(:last_name).is_at_least(2).is_at_most(50) }
    it { should validate_length_of(:phone).is_at_least(10).is_at_most(20) }

    context 'phone format' do
      it 'accepts valid phone numbers' do
        user = build(:user, phone: '+1-555-0123')
        expect(user).to be_valid
      end

      it 'accepts phone with spaces' do
        user = build(:user, phone: '+1 555 0123')
        expect(user).to be_valid
      end

      it 'accepts phone with parentheses' do
        user = build(:user, phone: '(555) 012-3456')
        expect(user).to be_valid
      end

      it 'rejects phone with letters' do
        user = build(:user, phone: '555-CALL-NOW')
        expect(user).not_to be_valid
        expect(user.errors[:phone]).to include('must be a valid phone number')
      end

      it 'allows blank phone' do
        user = build(:user, phone: nil)
        expect(user).to be_valid
      end
    end

    context 'email format' do
      it 'accepts valid email' do
        user = build(:user, email: 'test@example.com')
        expect(user).to be_valid
      end

      it 'rejects invalid email' do
        user = build(:user, email: 'invalid-email')
        expect(user).not_to be_valid
      end

      it 'rejects email without domain' do
        user = build(:user, email: 'test@')
        expect(user).not_to be_valid
      end
    end
  end

  describe 'enums' do
    it { should define_enum_for(:role).with_values(owner: 0, veterinarian: 1, admin: 2).with_prefix(:role) }
  end

  describe 'scopes' do
    let!(:owner) { create(:user, :owner) }
    let!(:veterinarian) { create(:user, :veterinarian) }
    let!(:admin) { create(:user, :admin) }
    let!(:unconfirmed_user) { create(:user, :unconfirmed) }

    describe '.owners' do
      it 'returns only owners' do
        expect(User.owners).to contain_exactly(owner)
      end
    end

    describe '.veterinarians' do
      it 'returns only veterinarians' do
        expect(User.veterinarians).to contain_exactly(veterinarian)
      end
    end

    describe '.admins' do
      it 'returns only admins' do
        expect(User.admins).to contain_exactly(admin)
      end
    end

    describe '.confirmed' do
      it 'returns only confirmed users' do
        confirmed_users = User.confirmed
        expect(confirmed_users).to include(owner, veterinarian, admin)
        expect(confirmed_users).not_to include(unconfirmed_user)
      end
    end

    describe '.unconfirmed' do
      it 'returns only unconfirmed users' do
        expect(User.unconfirmed).to contain_exactly(unconfirmed_user)
      end
    end
  end

  describe 'instance methods' do
    let(:user) { create(:user, first_name: 'John', last_name: 'Doe') }

    describe '#full_name' do
      it 'returns the full name' do
        expect(user.full_name).to eq('John Doe')
      end
    end

    describe '#initials' do
      it 'returns the initials in uppercase' do
        expect(user.initials).to eq('JD')
      end
    end

    describe '#admin?' do
      it 'returns true for admin users' do
        admin = create(:user, :admin)
        expect(admin.admin?).to be true
      end

      it 'returns false for non-admin users' do
        expect(user.admin?).to be false
      end
    end

    describe '#veterinarian?' do
      it 'returns true for veterinarian users' do
        vet = create(:user, :veterinarian)
        expect(vet.veterinarian?).to be true
      end

      it 'returns false for non-veterinarian users' do
        expect(user.veterinarian?).to be false
      end
    end

    describe '#owner?' do
      it 'returns true for owner users' do
        expect(user.owner?).to be true
      end

      it 'returns false for non-owner users' do
        vet = create(:user, :veterinarian)
        expect(vet.owner?).to be false
      end
    end
  end

  describe 'callbacks' do
    describe 'email normalization' do
      it 'converts email to lowercase' do
        user = create(:user, email: 'Test@EXAMPLE.com')
        expect(user.email).to eq('test@example.com')
      end

      it 'strips whitespace from email' do
        user = create(:user, email: '  test@example.com  ')
        expect(user.email).to eq('test@example.com')
      end
    end

    describe 'phone normalization' do
      it 'removes non-numeric characters except allowed ones' do
        user = create(:user, phone: '+1-555-0123')
        expect(user.phone).to match(/\+1-555-0123/)
      end
    end
  end

  describe 'devise modules' do
    it 'has database_authenticatable module' do
      expect(User.devise_modules).to include(:database_authenticatable)
    end

    it 'has registerable module' do
      expect(User.devise_modules).to include(:registerable)
    end

    it 'has recoverable module' do
      expect(User.devise_modules).to include(:recoverable)
    end

    it 'has rememberable module' do
      expect(User.devise_modules).to include(:rememberable)
    end

    it 'has validatable module' do
      expect(User.devise_modules).to include(:validatable)
    end

    it 'has confirmable module' do
      expect(User.devise_modules).to include(:confirmable)
    end

    it 'has trackable module' do
      expect(User.devise_modules).to include(:trackable)
    end
  end

  describe 'password security' do
    it 'requires a password on creation' do
      user = build(:user, password: nil, password_confirmation: nil)
      expect(user).not_to be_valid
    end

    it 'requires password confirmation to match' do
      user = build(:user, password: 'Password123!', password_confirmation: 'DifferentPass')
      expect(user).not_to be_valid
    end

    it 'requires minimum password length' do
      user = build(:user, password: 'short', password_confirmation: 'short')
      expect(user).not_to be_valid
    end

    it 'encrypts password' do
      user = create(:user, password: 'Password123!', password_confirmation: 'Password123!')
      expect(user.encrypted_password).not_to eq('Password123!')
      expect(user.encrypted_password).to be_present
    end
  end
end
