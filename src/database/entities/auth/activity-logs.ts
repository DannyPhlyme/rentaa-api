import { Entity, Column, ManyToOne } from 'typeorm';
import { BaseEntity } from '../base';
import { User } from './user';

@Entity({
  name: 'activity_logs',
})
export class ActivityLog extends BaseEntity {
  @ManyToOne(() => User, (user) => user.activities)
  user: User;

  @Column({
    type: 'text',
  })
  action: string;

  @Column({
    type: 'varchar',
    length: 255,
  })
  module: string;

  @Column({
    type: 'varchar',
    length: 20,
  })
  ip: string;
}
