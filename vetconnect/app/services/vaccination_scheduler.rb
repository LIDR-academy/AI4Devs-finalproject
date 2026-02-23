# frozen_string_literal: true

# Service to calculate next vaccination due dates based on protocols
class VaccinationScheduler
  def initialize(pet, vaccine_type, current_dose_number = 1)
    @pet = pet
    @vaccine_type = vaccine_type
    @current_dose_number = current_dose_number
  end
  
  # Calculate next due date for a vaccination
  def calculate_next_due_date(administered_date)
    protocol = find_next_protocol
    
    if protocol
      administered_date + protocol.next_dose_interval_weeks.weeks
    else
      # Default intervals if no protocol found
      default_interval_weeks = default_interval_for_vaccine_type
      administered_date + default_interval_weeks.weeks
    end
  end
  
  # Check if pet is old enough for a specific dose
  def can_administer_dose?(dose_number)
    protocol = VaccinationProtocol.find_protocol(
      species: @pet.species,
      vaccine_type: @vaccine_type,
      dose_number: dose_number
    )
    
    return true unless protocol # If no protocol, allow (will use defaults)
    
    pet_age_weeks = @pet.age_in_months * 4.33 # Approximate weeks
    pet_age_weeks >= protocol.minimum_age_weeks
  end
  
  # Get the next dose number for a vaccine series
  def next_dose_number
    last_vaccination = @pet.vaccinations
      .for_vaccine_type(@vaccine_type)
      .order(administered_at: :desc)
      .first
    
    return 1 unless last_vaccination
    
    last_vaccination.dose_number + 1
  end
  
  # Get all upcoming vaccinations for a pet
  def self.upcoming_for_pet(pet)
    pet.vaccinations
      .where('next_due_date >= ?', Date.today)
      .order(:next_due_date)
      .includes(:veterinarian)
  end
  
  # Get overdue vaccinations for a pet
  def self.overdue_for_pet(pet)
    pet.vaccinations
      .where('next_due_date < ?', Date.today)
      .order(:next_due_date)
      .includes(:veterinarian)
  end
  
  private
  
  def find_next_protocol
    VaccinationProtocol.find_protocol(
      species: @pet.species,
      vaccine_type: @vaccine_type,
      dose_number: @current_dose_number + 1
    )
  end
  
  def default_interval_for_vaccine_type
    case @vaccine_type
    when 'rabies'
      52 # 1 year
    when 'dhpp', 'feline_distemper'
      3 # 3 weeks for multi-dose series
    when 'bordetella', 'leptospirosis', 'feline_leukemia'
      52 # 1 year
    else
      52 # Default to 1 year
    end
  end
end
