# frozen_string_literal: true

require 'rails_helper'

RSpec.describe Clinic, type: :model do
  describe 'associations' do
    it { should have_many(:appointments).dependent(:restrict_with_error) }
    it { should have_many(:pets).through(:appointments) }
    it { should have_many(:veterinarians).through(:appointments) }
  end

  describe 'validations' do
    it { should validate_presence_of(:name) }
    it { should validate_presence_of(:address) }
    it { should validate_presence_of(:phone) }
    it { should validate_length_of(:name).is_at_least(2).is_at_most(100) }
    it { should validate_length_of(:address).is_at_least(5).is_at_most(500) }

    it 'validates phone format' do
      clinic = build(:clinic, phone: 'invalid')
      expect(clinic).not_to be_valid
      expect(clinic.errors[:phone]).to include('must be a valid phone number')
    end

    it 'validates email format' do
      clinic = build(:clinic, email: 'invalid')
      expect(clinic).not_to be_valid
      expect(clinic.errors[:email]).to include('must be a valid email address')
    end

    it 'allows blank email' do
      clinic = build(:clinic, email: '')
      expect(clinic).to be_valid
    end

    describe 'operating_hours_format validation' do
      it 'accepts valid operating hours' do
        clinic = build(:clinic)
        expect(clinic).to be_valid
      end

      it 'rejects non-hash operating hours' do
        clinic = build(:clinic, operating_hours: 'invalid')
        expect(clinic).not_to be_valid
        expect(clinic.errors[:operating_hours]).to include('must be a valid JSON object')
      end

      it 'rejects invalid day names' do
        clinic = build(:clinic, operating_hours: { 'invalidday' => { 'open' => true } })
        expect(clinic).not_to be_valid
        expect(clinic.errors[:operating_hours]).to include('contains invalid day: invalidday')
      end

      it 'requires start and end times for open days' do
        clinic = build(:clinic, operating_hours: { 
          'monday' => { 'open' => true }
        })
        expect(clinic).not_to be_valid
        expect(clinic.errors[:operating_hours]).to include('must include start and end times for monday')
      end

      it 'validates time format' do
        clinic = build(:clinic, operating_hours: { 
          'monday' => { 'open' => true, 'start' => '25:00', 'end' => '18:00' }
        })
        expect(clinic).not_to be_valid
        expect(clinic.errors[:operating_hours]).to include('invalid start time format for monday')
      end
    end
  end

  describe 'scopes' do
    let!(:active_clinic) { create(:clinic, active: true) }
    let!(:inactive_clinic) { create(:clinic, :inactive) }

    describe '.active' do
      it 'returns only active clinics' do
        expect(Clinic.active).to include(active_clinic)
        expect(Clinic.active).not_to include(inactive_clinic)
      end
    end

    describe '.inactive' do
      it 'returns only inactive clinics' do
        expect(Clinic.inactive).to include(inactive_clinic)
        expect(Clinic.inactive).not_to include(active_clinic)
      end
    end
  end

  describe 'callbacks' do
    describe 'ensure_operating_hours_structure' do
      it 'sets default operating hours if blank' do
        clinic = build(:clinic, operating_hours: nil)
        clinic.save
        expect(clinic.operating_hours).to be_a(Hash)
        expect(clinic.operating_hours.keys).to include('monday', 'tuesday', 'wednesday')
      end
    end
  end

  describe '#open_on?' do
    let(:clinic) { create(:clinic) }

    it 'returns true for open days' do
      monday = Date.today.next_occurring(:monday)
      expect(clinic.open_on?(monday)).to be true
    end

    it 'returns false for closed days' do
      sunday = Date.today.next_occurring(:sunday)
      expect(clinic.open_on?(sunday)).to be false
    end
  end

  describe '#operating_hours_for' do
    let(:clinic) { create(:clinic) }

    it 'returns operating hours for given date' do
      monday = Date.today.next_occurring(:monday)
      hours = clinic.operating_hours_for(monday)
      expect(hours['open']).to be true
      expect(hours['start']).to eq('09:00')
      expect(hours['end']).to eq('18:00')
    end

    it 'returns empty hash for invalid date' do
      # This shouldn't happen but test defensive code
      allow_any_instance_of(Date).to receive(:strftime).and_return('invalidday')
      expect(clinic.operating_hours_for(Date.today)).to eq({})
    end
  end

  describe '#opening_time_for' do
    let(:clinic) { create(:clinic) }

    it 'returns opening time for open days' do
      monday = Date.today.next_occurring(:monday)
      expect(clinic.opening_time_for(monday)).to eq('09:00')
    end

    it 'returns nil for closed days' do
      sunday = Date.today.next_occurring(:sunday)
      expect(clinic.opening_time_for(sunday)).to be_nil
    end
  end

  describe '#closing_time_for' do
    let(:clinic) { create(:clinic) }

    it 'returns closing time for open days' do
      monday = Date.today.next_occurring(:monday)
      expect(clinic.closing_time_for(monday)).to eq('18:00')
    end

    it 'returns nil for closed days' do
      sunday = Date.today.next_occurring(:sunday)
      expect(clinic.closing_time_for(sunday)).to be_nil
    end
  end

  describe '#deactivate!' do
    it 'sets active to false' do
      clinic = create(:clinic, active: true)
      clinic.deactivate!
      expect(clinic.reload.active).to be false
    end
  end

  describe '#activate!' do
    it 'sets active to true' do
      clinic = create(:clinic, :inactive)
      clinic.activate!
      expect(clinic.reload.active).to be true
    end
  end

  describe '#full_address' do
    it 'returns the address' do
      clinic = create(:clinic)
      expect(clinic.full_address).to eq(clinic.address)
    end
  end
end
