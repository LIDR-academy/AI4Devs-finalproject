# frozen_string_literal: true

require 'rails_helper'

RSpec.describe Appointment, type: :model do
  describe 'associations' do
    it { should belong_to(:pet) }
    it { should belong_to(:veterinarian).class_name('User') }
    it { should belong_to(:clinic) }
    it { should have_one(:medical_record).dependent(:nullify) }
    it { should have_one(:owner).through(:pet) }
  end

  describe 'validations' do
    it { should validate_presence_of(:appointment_date) }
    it { should validate_presence_of(:reason) }
    it { should validate_length_of(:reason).is_at_most(200) }
    
    describe 'duration_minutes' do
      it { should validate_numericality_of(:duration_minutes).only_integer }
      it { should validate_numericality_of(:duration_minutes).is_greater_than_or_equal_to(15) }
      it { should validate_numericality_of(:duration_minutes).is_less_than_or_equal_to(180) }
    end

    describe 'appointment_date_cannot_be_in_past' do
      it 'validates appointment_date is not in the past on create' do
        appointment = build(:appointment, appointment_date: 1.day.ago)
        expect(appointment).not_to be_valid
        expect(appointment.errors[:appointment_date]).to include('no puede ser en el pasado')
      end

      it 'allows past dates when updating existing appointment' do
        appointment = create(:appointment, appointment_date: 2.days.from_now)
        travel_to 3.days.from_now do
          appointment.reason = "Updated reason"
          expect(appointment).to be_valid
        end
      end
    end

    describe 'veterinarian_must_be_vet_or_admin' do
      it 'allows veterinarian role' do
        vet = create(:user, role: :veterinarian)
        appointment = build(:appointment, veterinarian: vet)
        appointment.valid?
        expect(appointment.errors[:veterinarian]).to be_empty
      end

      it 'allows admin role' do
        admin = create(:user, role: :admin)
        appointment = build(:appointment, veterinarian: admin)
        appointment.valid?
        expect(appointment.errors[:veterinarian]).to be_empty
      end

      it 'rejects owner role' do
        owner = create(:user, role: :owner)
        appointment = build(:appointment, veterinarian: owner)
        expect(appointment).not_to be_valid
        expect(appointment.errors[:veterinarian]).to include('debe ser un veterinario o administrador')
      end
    end

    describe 'veterinarian_available_at_time' do
      let(:vet) { create(:user, role: :veterinarian) }
      let(:clinic) { create(:clinic) }
      let(:pet) { create(:pet) }
      let(:appointment_time) { Time.zone.local(2026, 3, 10, 10, 0) }

      before do
        travel_to Time.zone.local(2026, 3, 1, 12, 0)
      end

      after do
        travel_back
      end

      it 'allows non-overlapping appointments' do
        create(:appointment, 
          veterinarian: vet, 
          clinic: clinic,
          appointment_date: appointment_time, 
          duration_minutes: 30
        )
        
        new_appointment = build(:appointment,
          veterinarian: vet,
          clinic: clinic,
          pet: pet,
          appointment_date: appointment_time + 30.minutes,
          duration_minutes: 30
        )
        
        expect(new_appointment).to be_valid
      end

      it 'rejects overlapping appointments' do
        create(:appointment, 
          veterinarian: vet, 
          clinic: clinic,
          appointment_date: appointment_time, 
          duration_minutes: 30
        )
        
        overlapping = build(:appointment,
          veterinarian: vet,
          clinic: clinic,
          pet: pet,
          appointment_date: appointment_time + 15.minutes,
          duration_minutes: 30
        )
        
        expect(overlapping).not_to be_valid
        expect(overlapping.errors[:appointment_date]).to include('el veterinario ya tiene una cita en ese horario')
      end

      it 'allows overlapping with cancelled appointments' do
        create(:appointment, :cancelled,
          veterinarian: vet,
          clinic: clinic,
          appointment_date: appointment_time,
          duration_minutes: 30
        )
        
        new_appointment = build(:appointment,
          veterinarian: vet,
          clinic: clinic,
          pet: pet,
          appointment_date: appointment_time,
          duration_minutes: 30
        )
        
        expect(new_appointment).to be_valid
      end

      it 'allows overlapping with no_show appointments' do
        create(:appointment, :no_show,
          veterinarian: vet,
          clinic: clinic,
          appointment_date: appointment_time,
          duration_minutes: 30
        )
        
        new_appointment = build(:appointment,
          veterinarian: vet,
          clinic: clinic,
          pet: pet,
          appointment_date: appointment_time,
          duration_minutes: 30
        )
        
        expect(new_appointment).to be_valid
      end
    end

    describe 'within_clinic_operating_hours' do
      let(:clinic) { create(:clinic) }
      let(:pet) { create(:pet) }
      let(:vet) { create(:user, role: :veterinarian) }

      before do
        travel_to Time.zone.local(2026, 3, 1, 12, 0)
      end

      after do
        travel_back
      end

      it 'allows appointments within operating hours' do
        monday = Date.new(2026, 3, 10) # A Monday
        appointment = build(:appointment,
          clinic: clinic,
          pet: pet,
          veterinarian: vet,
          appointment_date: Time.zone.local(2026, 3, 10, 10, 0),
          duration_minutes: 30
        )
        
        expect(appointment).to be_valid
      end

      it 'rejects appointments on closed days' do
        sunday = Date.new(2026, 3, 9) # A Sunday
        appointment = build(:appointment,
          clinic: clinic,
          pet: pet,
          veterinarian: vet,
          appointment_date: Time.zone.local(2026, 3, 9, 10, 0),
          duration_minutes: 30
        )
        
        expect(appointment).not_to be_valid
        expect(appointment.errors[:appointment_date]).to include('la clínica está cerrada ese día')
      end

      it 'rejects appointments before opening time' do
        appointment = build(:appointment,
          clinic: clinic,
          pet: pet,
          veterinarian: vet,
          appointment_date: Time.zone.local(2026, 3, 10, 8, 0), # Before 9:00
          duration_minutes: 30
        )
        
        expect(appointment).not_to be_valid
        expect(appointment.errors[:appointment_date]).to include('fuera del horario de atención')
      end

      it 'rejects appointments that end after closing time' do
        appointment = build(:appointment,
          clinic: clinic,
          pet: pet,
          veterinarian: vet,
          appointment_date: Time.zone.local(2026, 3, 10, 17, 45), # 17:45, ends at 18:15
          duration_minutes: 30
        )
        
        expect(appointment).not_to be_valid
        expect(appointment.errors[:appointment_date]).to include('fuera del horario de atención')
      end
    end
  end

  describe 'scopes' do
    let(:clinic) { create(:clinic) }

    before do
      travel_to Time.zone.local(2026, 3, 10, 12, 0)
    end

    after do
      travel_back
    end

    describe '.upcoming' do
      it 'returns future appointments ordered by date' do
        past = create(:appointment, clinic: clinic, appointment_date: 1.day.ago)
        future1 = create(:appointment, clinic: clinic, appointment_date: 2.days.from_now)
        future2 = create(:appointment, clinic: clinic, appointment_date: 1.day.from_now)
        
        result = Appointment.upcoming
        expect(result).to eq([future2, future1])
        expect(result).not_to include(past)
      end
    end

    describe '.past' do
      it 'returns past appointments ordered by date desc' do
        future = create(:appointment, clinic: clinic, appointment_date: 1.day.from_now)
        past1 = create(:appointment, clinic: clinic, appointment_date: 2.days.ago)
        past2 = create(:appointment, clinic: clinic, appointment_date: 1.day.ago)
        
        result = Appointment.past
        expect(result).to eq([past2, past1])
        expect(result).not_to include(future)
      end
    end

    describe '.pending_reminder' do
      it 'returns appointments needing reminders' do
        needs_reminder = create(:appointment, 
          clinic: clinic,
          appointment_date: 24.hours.from_now + 30.minutes,
          status: :scheduled,
          reminder_sent_at: nil
        )
        
        already_sent = create(:appointment, 
          clinic: clinic,
          appointment_date: 24.hours.from_now + 30.minutes,
          status: :scheduled,
          reminder_sent_at: 1.hour.ago
        )
        
        too_soon = create(:appointment, 
          clinic: clinic,
          appointment_date: 30.hours.from_now,
          status: :scheduled,
          reminder_sent_at: nil
        )
        
        result = Appointment.pending_reminder
        expect(result).to include(needs_reminder)
        expect(result).not_to include(already_sent, too_soon)
      end
    end

    describe '.for_veterinarian' do
      it 'returns appointments for specific veterinarian' do
        vet1 = create(:user, role: :veterinarian)
        vet2 = create(:user, role: :veterinarian)
        
        apt1 = create(:appointment, clinic: clinic, veterinarian: vet1)
        apt2 = create(:appointment, clinic: clinic, veterinarian: vet2)
        
        result = Appointment.for_veterinarian(vet1.id)
        expect(result).to include(apt1)
        expect(result).not_to include(apt2)
      end
    end

    describe '.for_clinic' do
      it 'returns appointments for specific clinic' do
        clinic2 = create(:clinic)
        
        apt1 = create(:appointment, clinic: clinic)
        apt2 = create(:appointment, clinic: clinic2)
        
        result = Appointment.for_clinic(clinic.id)
        expect(result).to include(apt1)
        expect(result).not_to include(apt2)
      end
    end
  end

  describe 'instance methods' do
    let(:clinic) { create(:clinic) }

    describe '#end_time' do
      it 'calculates end time correctly' do
        appointment = build(:appointment,
          clinic: clinic,
          appointment_date: Time.zone.local(2026, 3, 10, 10, 0),
          duration_minutes: 45
        )
        
        expect(appointment.end_time).to eq(Time.zone.local(2026, 3, 10, 10, 45))
      end
    end

    describe '#can_be_cancelled?' do
      it 'returns true for scheduled appointments' do
        appointment = build(:appointment, :scheduled, clinic: clinic)
        expect(appointment.can_be_cancelled?).to be true
      end

      it 'returns true for confirmed appointments' do
        appointment = build(:appointment, :confirmed, clinic: clinic)
        expect(appointment.can_be_cancelled?).to be true
      end

      it 'returns false for completed appointments' do
        appointment = build(:appointment, :completed, clinic: clinic)
        expect(appointment.can_be_cancelled?).to be false
      end

      it 'returns false for cancelled appointments' do
        appointment = build(:appointment, :cancelled, clinic: clinic)
        expect(appointment.can_be_cancelled?).to be false
      end
    end

    describe '#cancel!' do
      it 'cancels a scheduled appointment' do
        appointment = create(:appointment, :scheduled, clinic: clinic)
        result = appointment.cancel!('Cambio de planes')
        
        expect(result).to be true
        expect(appointment.reload.status).to eq('cancelled')
        expect(appointment.cancellation_reason).to eq('Cambio de planes')
      end

      it 'cannot cancel a completed appointment' do
        appointment = create(:appointment, :completed, clinic: clinic)
        result = appointment.cancel!
        
        expect(result).to be false
        expect(appointment.reload.status).to eq('completed')
      end
    end

    describe '#complete!' do
      it 'marks appointment as completed' do
        appointment = create(:appointment, :scheduled, clinic: clinic)
        appointment.complete!
        
        expect(appointment.reload.status).to eq('completed')
      end
    end

    describe '#confirm!' do
      it 'marks appointment as confirmed' do
        appointment = create(:appointment, :scheduled, clinic: clinic)
        appointment.confirm!
        
        expect(appointment.reload.status).to eq('confirmed')
      end
    end

    describe '#mark_no_show!' do
      it 'marks appointment as no_show' do
        appointment = create(:appointment, :scheduled, clinic: clinic)
        appointment.mark_no_show!
        
        expect(appointment.reload.status).to eq('no_show')
      end
    end

    describe '#reschedule!' do
      before do
        travel_to Time.zone.local(2026, 3, 1, 12, 0)
      end

      after do
        travel_back
      end

      it 'reschedules a scheduled appointment' do
        appointment = create(:appointment, :scheduled, 
          clinic: clinic,
          appointment_date: Time.zone.local(2026, 3, 10, 10, 0)
        )
        
        new_date = Time.zone.local(2026, 3, 15, 14, 0)
        result = appointment.reschedule!(new_date)
        
        expect(result).to be true
        expect(appointment.reload.appointment_date).to eq(new_date)
        expect(appointment.reminder_sent_at).to be_nil
      end

      it 'cannot reschedule a completed appointment' do
        appointment = create(:appointment, :completed, 
          clinic: clinic,
          appointment_date: 1.day.ago
        )
        
        new_date = Time.zone.local(2026, 3, 15, 14, 0)
        result = appointment.reschedule!(new_date)
        
        expect(result).to be false
      end
    end
  end

  describe 'class methods' do
    describe '.available_slots' do
      let(:clinic) { create(:clinic) }
      let(:vet) { create(:user, role: :veterinarian) }
      let(:date) { Date.new(2026, 3, 10) } # A Monday

      it 'returns available slots' do
        slots = Appointment.available_slots(vet.id, date, clinic.id)
        
        expect(slots).to be_an(Array)
        expect(slots).not_to be_empty
      end

      it 'excludes occupied slots' do
        create(:appointment,
          veterinarian: vet,
          clinic: clinic,
          appointment_date: Time.zone.local(2026, 3, 10, 10, 0),
          duration_minutes: 30
        )
        
        slots = Appointment.available_slots(vet.id, date, clinic.id)
        occupied_slot = slots.find { |s| s[:start_time].hour == 10 && s[:start_time].min == 0 }
        
        expect(occupied_slot).to be_nil
      end
    end
  end
end
