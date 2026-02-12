# frozen_string_literal: true

require 'rails_helper'

RSpec.describe 'Documents CRUD', type: :request do
  let(:owner) { create(:user, role: :owner) }
  let(:pet) { create(:pet, user: owner) }
  let(:document) { create(:document, :uploaded_by_owner, pet: pet, uploaded_by: owner) }

  before { sign_in owner }

  describe 'GET /documents' do
    it 'lists documents' do
      get documents_path
      expect(response).to have_http_status(:success)
    end
  end

  describe 'GET /documents/:id' do
    it 'shows document' do
      # Document belongs to owner's pet, so should be accessible
      get document_path(document)
      expect(response).to have_http_status(:success)
    end
  end

  describe 'POST /documents' do
    it 'creates document' do
      expect {
        post documents_path, params: {
          document: {
            pet_id: pet.id,
            title: 'Test Document',
            document_type: 'lab_result',
            file_name: 'test.pdf'
          }
        }
      }.to change(Document, :count).by(1)
      expect(response).to have_http_status(:redirect)
    end
  end

  describe 'PATCH /documents/:id' do
    it 'updates document' do
      patch document_path(document), params: {
        document: { title: 'Updated Title' }
      }
      expect(document.reload.title).to eq('Updated Title')
      expect(response).to have_http_status(:redirect)
    end
  end

  describe 'DELETE /documents/:id' do
    it 'deletes document' do
      # Create document with owner as uploaded_by
      doc = create(:document, :uploaded_by_owner, pet: pet, uploaded_by: owner)
      
      expect {
        delete document_path(doc)
      }.to change(Document, :count).by(-1)
      expect(response).to have_http_status(:redirect)
    end
  end
end
