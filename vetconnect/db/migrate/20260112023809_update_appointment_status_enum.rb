class UpdateAppointmentStatusEnum < ActiveRecord::Migration[7.1]
  def up
    # Update existing appointments with status 'in_progress' (2) to 'confirmed' (1)
    # This is because we're removing in_progress status
    execute "UPDATE appointments SET status = 1 WHERE status = 2"
    
    # Now we can safely change the status values
    # Old: scheduled:0, confirmed:1, in_progress:2, completed:3, cancelled:4
    # New: scheduled:0, confirmed:1, completed:2, cancelled:3, no_show:4
    
    # Update completed from 3 to 2
    execute "UPDATE appointments SET status = 2 WHERE status = 3"
    
    # Update cancelled from 4 to 3
    execute "UPDATE appointments SET status = 3 WHERE status = 4"
  end

  def down
    # Reverse the changes
    execute "UPDATE appointments SET status = 4 WHERE status = 3"
    execute "UPDATE appointments SET status = 3 WHERE status = 2"
    # Note: can't fully reverse in_progress removal
  end
end
