# frozen_string_literal: true

require 'rails_helper'

RSpec.describe 'Pet CRUD Flow', type: :feature do
  let(:owner) { create(:user, role: :owner, password: 'Password123!') }

  before do
    sign_in owner
  end

  it 'allows owner to create, view, update and delete a pet' do
    # Create
    visit new_pet_path
    fill_in 'Nombre', with: 'Max'
    # The form in new.html.erb uses different options:
    # ['🐕 Perro', 'dog'], ['🐈 Gato', 'cat'], etc.
    # Select by visible text which includes emoji
    select '🐕 Perro', from: 'pet_species'
    fill_in 'Fecha de Nacimiento', with: 2.years.ago.to_date.strftime('%Y-%m-%d')
    # Gender options: ['♂️ Macho', 'male'], ['♀️ Hembra', 'female']
    select '♂️ Macho', from: 'pet_gender'
    click_button 'Registrar Mascota'

    expect(page).to have_content('Max')
    pet = Pet.find_by(name: 'Max')
    expect(pet).to be_present

    # Read
    visit pet_path(pet)
    expect(page).to have_content('Max')

    # Update
    visit edit_pet_path(pet)
    fill_in 'Nombre', with: 'Max Updated'
    click_button 'Actualizar Mascota'
    expect(page).to have_content('Max Updated')
    expect(pet.reload.name).to eq('Max Updated')

    # Delete (soft delete) - verificar que el botón existe
    visit pet_path(pet)
    if page.has_button?('Eliminar') || page.has_link?('Eliminar')
      accept_confirm do
        click_button('Eliminar') rescue click_link('Eliminar')
      end
      expect(pet.reload.active).to be false
    end
  end
end
