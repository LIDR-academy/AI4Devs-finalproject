# frozen_string_literal: true

require 'rails_helper'

RSpec.describe AvailabilityCalculator do
  let(:clinic) { create(:clinic) }
  let(:veterinarian) { create(:user, role: :veterinarian) }
  let(:date) { Date.today.next_occurring(:monday) }
  
  describe '#calculate' do
    context 'when clinic is open' do
      it 'returns available slots' do
        calculator = described_class.new(clinic, veterinarian.id, date, [])
        slots = calculator.calculate
        
        expect(slots).not_to be_empty
        expect(slots.first).to have_key(:start_time)
        expect(slots.first).to have_key(:end_time)
        expect(slots.first).to have_key(:available)
        expect(slots.first[:available]).to be true
      end

      it 'generates 30-minute slots' do
        calculator = described_class.new(clinic, veterinarian.id, date, [])
        slots = calculator.calculate
        
        first_slot = slots.first
        duration = (first_slot[:end_time] - first_slot[:start_time]) / 60
        expect(duration).to eq(30)
      end

      it 'covers the entire operating hours' do
        calculator = described_class.new(clinic, veterinarian.id, date, [])
        slots = calculator.calculate
        
        hours = clinic.operating_hours_for(date)
        expected_start = hours['start']
        expected_end = hours['end']
        
        first_slot_time = slots.first[:start_time].strftime('%H:%M')
        last_slot_end = slots.last[:end_time].strftime('%H:%M')
        
        expect(first_slot_time).to eq(expected_start)
        expect(last_slot_end).to eq(expected_end)
      end
    end

    context 'when clinic is closed' do
      let(:sunday) { Date.today.next_occurring(:sunday) }

      it 'returns empty array' do
        calculator = described_class.new(clinic, veterinarian.id, sunday, [])
        slots = calculator.calculate
        
        expect(slots).to be_empty
      end
    end

    context 'with existing appointments' do
      let(:appointment_time) { Time.zone.local(date.year, date.month, date.day, 10, 0) }
      let!(:appointment) do
        create(:appointment,
          veterinarian: veterinarian,
          clinic: clinic,
          appointment_date: appointment_time,
          duration_minutes: 30
        )
      end

      it 'excludes occupied time slots' do
        calculator = described_class.new(
          clinic, 
          veterinarian.id, 
          date, 
          [appointment]
        )
        slots = calculator.calculate
        
        # Check that the 10:00 slot is not in available slots
        occupied_slot = slots.find { |s| s[:start_time] == appointment_time }
        expect(occupied_slot).to be_nil
      end

      it 'includes slots before appointment' do
        calculator = described_class.new(
          clinic, 
          veterinarian.id, 
          date, 
          [appointment]
        )
        slots = calculator.calculate
        
        # Check that 9:00 and 9:30 slots are available
        morning_slots = slots.select { |s| s[:start_time].hour == 9 }
        expect(morning_slots).not_to be_empty
      end

      it 'includes slots after appointment' do
        calculator = described_class.new(
          clinic, 
          veterinarian.id, 
          date, 
          [appointment]
        )
        slots = calculator.calculate
        
        # Check that slots after 10:30 are available
        afternoon_slots = slots.select { |s| s[:start_time].hour >= 11 }
        expect(afternoon_slots).not_to be_empty
      end
    end

    context 'with appointment of different duration' do
      let(:appointment_time) { Time.zone.local(date.year, date.month, date.day, 14, 0) }
      let!(:long_appointment) do
        create(:appointment,
          veterinarian: veterinarian,
          clinic: clinic,
          appointment_date: appointment_time,
          duration_minutes: 60
        )
      end

      it 'excludes all slots covered by the appointment' do
        calculator = described_class.new(
          clinic, 
          veterinarian.id, 
          date, 
          [long_appointment]
        )
        slots = calculator.calculate
        
        # Both 14:00 and 14:30 should be unavailable
        slot_14_00 = slots.find { |s| s[:start_time].hour == 14 && s[:start_time].min == 0 }
        slot_14_30 = slots.find { |s| s[:start_time].hour == 14 && s[:start_time].min == 30 }
        
        expect(slot_14_00).to be_nil
        expect(slot_14_30).to be_nil
      end
    end

    context 'with multiple appointments' do
      let(:appointment1_time) { Time.zone.local(date.year, date.month, date.day, 10, 0) }
      let(:appointment2_time) { Time.zone.local(date.year, date.month, date.day, 11, 0) }
      let!(:appointment1) do
        create(:appointment,
          veterinarian: veterinarian,
          clinic: clinic,
          appointment_date: appointment1_time,
          duration_minutes: 30
        )
      end
      let!(:appointment2) do
        create(:appointment,
          veterinarian: veterinarian,
          clinic: clinic,
          appointment_date: appointment2_time,
          duration_minutes: 30
        )
      end

      it 'excludes all occupied slots' do
        calculator = described_class.new(
          clinic, 
          veterinarian.id, 
          date, 
          [appointment1, appointment2]
        )
        slots = calculator.calculate
        
        slot_10_00 = slots.find { |s| s[:start_time] == appointment1_time }
        slot_11_00 = slots.find { |s| s[:start_time] == appointment2_time }
        
        expect(slot_10_00).to be_nil
        expect(slot_11_00).to be_nil
      end

      it 'includes slots between appointments' do
        calculator = described_class.new(
          clinic, 
          veterinarian.id, 
          date, 
          [appointment1, appointment2]
        )
        slots = calculator.calculate
        
        # 10:30 should be available (between 10:00-10:30 and 11:00-11:30)
        slot_10_30 = slots.find { |s| s[:start_time].hour == 10 && s[:start_time].min == 30 }
        expect(slot_10_30).not_to be_nil
      end
    end
  end
end
