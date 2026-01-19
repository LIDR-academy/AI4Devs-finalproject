# frozen_string_literal: true

require 'rails_helper'

RSpec.describe DocumentPolicy do
  subject { described_class }

  let(:owner) { create(:user, role: :owner) }
  let(:other_owner) { create(:user, role: :owner) }
  let(:veterinarian) { create(:user, role: :veterinarian) }
  let(:admin) { create(:user, role: :admin) }
  
  let(:pet) { create(:pet, user: owner) }
  let(:other_pet) { create(:pet, user: other_owner) }
  
  let(:document) { create(:document, pet: pet, uploaded_by: veterinarian) }
  let(:other_document) { create(:document, pet: other_pet, uploaded_by: veterinarian) }
  let(:owner_document) { create(:document, pet: pet, uploaded_by: owner) }

  describe 'Scope' do
    let!(:owner_documents) { create_list(:document, 2, pet: pet, uploaded_by: veterinarian) }
    let!(:other_documents) { create_list(:document, 2, pet: other_pet, uploaded_by: veterinarian) }

    context 'as owner' do
      it 'only shows documents for own pets' do
        scope = Pundit.policy_scope(owner, Document)
        expect(scope.to_a).to match_array(owner_documents)
        expect(scope).not_to include(*other_documents)
      end
    end

    context 'as veterinarian' do
      it 'shows all documents' do
        scope = Pundit.policy_scope(veterinarian, Document)
        expect(scope.to_a).to match_array(owner_documents + other_documents)
      end
    end

    context 'as admin' do
      it 'shows all documents' do
        scope = Pundit.policy_scope(admin, Document)
        expect(scope.to_a).to match_array(owner_documents + other_documents)
      end
    end
  end

  permissions :show? do
    it 'allows pet owner to view document' do
      expect(subject).to permit(owner, document)
    end

    it 'allows veterinarian to view any document' do
      expect(subject).to permit(veterinarian, document)
      expect(subject).to permit(veterinarian, other_document)
    end

    it 'allows admin to view any document' do
      expect(subject).to permit(admin, document)
      expect(subject).to permit(admin, other_document)
    end

    it 'denies other owners from viewing document' do
      expect(subject).not_to permit(other_owner, document)
    end
  end

  permissions :create? do
    it 'allows owner to create documents for their pets' do
      expect(subject).to permit(owner, Document.new)
    end

    it 'allows veterinarian to create documents' do
      expect(subject).to permit(veterinarian, Document.new)
    end

    it 'allows admin to create documents' do
      expect(subject).to permit(admin, Document.new)
    end
  end

  permissions :update? do
    it 'allows uploader to update their document' do
      expect(subject).to permit(owner, owner_document)
      expect(subject).to permit(veterinarian, document)
    end

    it 'allows admin to update any document' do
      expect(subject).to permit(admin, document)
      expect(subject).to permit(admin, owner_document)
    end

    it 'denies non-uploader from updating document' do
      expect(subject).not_to permit(owner, document)
      expect(subject).not_to permit(veterinarian, owner_document)
    end
  end

  permissions :destroy? do
    it 'allows uploader to delete their document' do
      expect(subject).to permit(owner, owner_document)
      expect(subject).to permit(veterinarian, document)
    end

    it 'allows admin to delete any document' do
      expect(subject).to permit(admin, document)
      expect(subject).to permit(admin, owner_document)
    end

    it 'denies non-uploader from deleting document' do
      expect(subject).not_to permit(owner, document)
      expect(subject).not_to permit(veterinarian, owner_document)
    end
  end

  permissions :download? do
    it 'allows pet owner to download their pet documents' do
      expect(subject).to permit(owner, document)
    end

    it 'allows veterinarian to download any document' do
      expect(subject).to permit(veterinarian, document)
    end

    it 'allows admin to download any document' do
      expect(subject).to permit(admin, document)
    end

    it 'denies other owners from downloading document' do
      expect(subject).not_to permit(other_owner, document)
    end
  end

  permissions :share? do
    it 'allows pet owner to share their pet documents' do
      expect(subject).to permit(owner, document)
    end

    it 'allows veterinarian to share documents' do
      expect(subject).to permit(veterinarian, document)
    end

    it 'allows admin to share documents' do
      expect(subject).to permit(admin, document)
    end

    it 'denies other owners from sharing document' do
      expect(subject).not_to permit(other_owner, document)
    end
  end
end
