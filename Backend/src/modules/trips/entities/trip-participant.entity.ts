import { Entity, Column, ManyToOne, JoinColumn, Index, Unique } from 'typeorm';
import { BaseEntity } from '../../../common/entities/base.entity';
import { Trip } from './trip.entity';
import { User } from '../../users/entities/user.entity';
import { ParticipantRole } from '../enums/participant-role.enum';

/**
 * Entidad TripParticipant que representa la relación entre un usuario y un viaje.
 * Extiende BaseEntity para heredar id, timestamps y soft delete.
 *
 * Esta entidad implementa roles contextuales: un usuario puede ser CREATOR
 * en un viaje y MEMBER en otro. No existe un campo isAdmin global en User.
 */
@Entity('trip_participants')
@Unique(['trip', 'user'])
export class TripParticipant extends BaseEntity {
  /**
   * Relación muchos a uno con Trip.
   * Un participante pertenece a un viaje.
   */
  @ManyToOne(() => Trip, (trip) => trip.participants, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'trip_id' })
  trip!: Trip;

  @Column({ name: 'trip_id', type: 'uuid' })
  @Index()
  tripId!: string;

  /**
   * Relación muchos a uno con User.
   * Un participante es un usuario del sistema.
   */
  @ManyToOne(() => User, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'user_id' })
  user!: User;

  @Column({ name: 'user_id', type: 'uuid' })
  @Index()
  userId!: string;

  @Column({
    name: 'role',
    type: 'varchar',
    length: 20,
    default: ParticipantRole.MEMBER,
  })
  role!: ParticipantRole;
}
