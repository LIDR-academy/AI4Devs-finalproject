import { IsArray, IsEmail, ArrayMinSize } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

/**
 * Data Transfer Object for adding participants to an existing trip by email.
 *
 * @class AddParticipantsDto
 * @description Used to validate the list of member emails when adding participants to a trip.
 */
export class AddParticipantsDto {
  /**
   * Array of email addresses to add as members.
   * Users must already be registered in the system.
   *
   * @type {string[]}
   * @example ["maria@example.com", "pedro@example.com"]
   */
  @ApiProperty({
    description: 'List of user emails to add as trip members',
    example: ['maria@example.com', 'pedro@example.com'],
    type: [String],
    minItems: 1,
  })
  @IsArray({ message: 'memberEmails must be an array' })
  @ArrayMinSize(1, { message: 'At least one email is required' })
  @IsEmail({}, { each: true, message: 'Each email must be valid' })
  memberEmails!: string[];
}
