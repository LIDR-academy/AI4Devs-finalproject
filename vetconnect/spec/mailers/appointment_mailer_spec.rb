# frozen_string_literal: true

require 'rails_helper'

RSpec.describe AppointmentMailer, type: :mailer do
  let(:clinic) { create(:clinic) }
  let(:owner) { create(:user, role: :owner) }
  let(:pet) { create(:pet, user: owner) }
  let(:veterinarian) { create(:user, role: :veterinarian) }
  let(:appointment) do
    create(:appointment,
      pet: pet,
      veterinarian: veterinarian,
      clinic: clinic,
      appointment_date: 1.day.from_now
    )
  end

  describe '#reminder' do
    let(:mail) { described_class.reminder(appointment) }

    it 'renders the headers' do
      expect(mail.subject).to include('Recordatorio')
      expect(mail.to).to eq([owner.email])
      expect(mail.from).to eq(['noreply@vetconnect.com'])
    end

    it 'renders the body with appointment details' do
      expect(mail.body.encoded).to include(pet.name)
      expect(mail.body.encoded).to include(veterinarian.full_name)
      expect(mail.body.encoded).to include(clinic.name)
    end
  end

  describe '#confirmation' do
    let(:mail) { described_class.confirmation(appointment) }

    it 'renders the headers' do
      expect(mail.subject).to include('Confirmación')
      expect(mail.to).to eq([owner.email])
      expect(mail.from).to eq(['noreply@vetconnect.com'])
    end

    it 'renders the body with appointment details' do
      expect(mail.body.encoded).to include(pet.name)
      expect(mail.body.encoded).to include(veterinarian.full_name)
      expect(mail.body.encoded).to include(clinic.name)
    end
  end

  describe '#cancellation' do
    let(:cancelled_appointment) do
      create(:appointment, :cancelled,
        pet: pet,
        veterinarian: veterinarian,
        clinic: clinic,
        cancellation_reason: 'Personal reasons'
      )
    end
    let(:mail) { described_class.cancellation(cancelled_appointment) }

    it 'renders the headers' do
      expect(mail.subject).to include('cancelada')
      expect(mail.to).to eq([owner.email])
      expect(mail.from).to eq(['noreply@vetconnect.com'])
    end

    it 'renders the body with appointment details' do
      expect(mail.body.encoded).to include(pet.name)
      expect(mail.body.encoded).to include(clinic.name)
    end

    it 'includes cancellation reason if present' do
      expect(mail.body.encoded).to include('Personal reasons')
    end
  end

  describe '#rescheduled' do
    let(:mail) { described_class.rescheduled(appointment) }

    it 'renders the headers' do
      expect(mail.subject).to include('reprogramada')
      expect(mail.to).to eq([owner.email])
      expect(mail.from).to eq(['noreply@vetconnect.com'])
    end

    it 'renders the body with appointment details' do
      expect(mail.body.encoded).to include(pet.name)
      expect(mail.body.encoded).to include(veterinarian.full_name)
      expect(mail.body.encoded).to include(clinic.name)
    end
  end
end
