# frozen_string_literal: true

require 'rails_helper'

RSpec.describe Document, type: :model do
  describe 'associations' do
    it { should belong_to(:pet) }
    it { should belong_to(:uploaded_by).class_name('User') }
  end

  describe 'validations' do
    it { should validate_presence_of(:title) }
    it { should validate_presence_of(:document_type) }
    it { should validate_presence_of(:file_name) }
  end

  describe 'CRUD operations' do
    let(:pet) { create(:pet) }
    let(:user) { create(:user) }

    it 'can be created' do
      document = Document.create(
        pet: pet,
        uploaded_by: user,
        title: 'Test Document',
        document_type: 'lab_result',
        file_name: 'test.pdf'
      )
      expect(document).to be_persisted
    end

    it 'can be read' do
      document = create(:document, pet: pet, uploaded_by: user)
      found = Document.find(document.id)
      expect(found.title).to eq(document.title)
    end

    it 'can be updated' do
      document = create(:document, pet: pet, uploaded_by: user)
      document.update(title: 'Updated Title')
      expect(document.reload.title).to eq('Updated Title')
    end

    it 'can be deleted' do
      document = create(:document, pet: pet, uploaded_by: user)
      expect { document.destroy }.to change(Document, :count).by(-1)
    end
  end
end
