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
  end

  describe 'CRUD operations' do
    it 'can be created' do
      user = User.create(
        email: 'test@example.com',
        password: 'Password123!',
        password_confirmation: 'Password123!',
        first_name: 'John',
        last_name: 'Doe',
        role: :owner
      )
      expect(user).to be_persisted
    end

    it 'can be read' do
      user = create(:user)
      found = User.find(user.id)
      expect(found.email).to eq(user.email)
    end

    it 'can be updated' do
      user = create(:user)
      user.update(first_name: 'Updated Name')
      expect(user.reload.first_name).to eq('Updated Name')
    end

    it 'can be deleted' do
      user = create(:user)
      expect { user.destroy }.to change(User, :count).by(-1)
    end
  end
end
