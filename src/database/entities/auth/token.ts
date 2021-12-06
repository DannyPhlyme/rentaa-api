import { Entity, Column, ManyToOne, JoinColumn } from 'typeorm';
import { TokenReason } from '../enum';
import { User } from './user';
import { BaseEntity } from '../base';

@Entity({
  name: 'tokens',
})
export class Token extends BaseEntity {
  @ManyToOne(() => User)
  @JoinColumn({ name: 'userId', referencedColumnName: 'id' })
  user: User;

  @Column({
    type: 'varchar',
    length: 255,
    unique: true,
  })
  token: string;

  @Column({
    type: 'enum',
    enum: TokenReason,
  })
  reason: TokenReason;

  @Column({
    type: 'timestamp',
    nullable: true,
  })
  expiry_date: Date;

  @Column({
    type: 'boolean',
    default: false,
  })
  is_revoked: boolean;
}
