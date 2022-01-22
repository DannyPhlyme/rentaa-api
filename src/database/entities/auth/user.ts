import { Entity, Column, OneToMany, JoinColumn, OneToOne } from 'typeorm';
import { LoginHistory } from './login-history';
import { Status } from '../enum';
import { Password } from './password';
import { Token } from './token';
import { ActivityLog } from './activity-logs';
import { BaseEntity } from '../base';
import { Gadget } from '../gadgets/gadget';
import { Profile } from './profile';

@Entity({
  name: 'users',
})
export class User extends BaseEntity {
  @OneToOne(() => Profile)
  @JoinColumn({ name: 'profileId', referencedColumnName: 'id' })
  profile: Profile;

  @OneToMany(() => LoginHistory, (history) => history.user, {
    cascade: ['insert'],
  })
  histories: LoginHistory[];

  @OneToMany(() => Password, (password) => password.user)
  passwords: Password[];

  @OneToMany(() => Token, (token) => token.user)
  tokens: Token[];

  @OneToMany(() => ActivityLog, (activity) => activity.user)
  activities: ActivityLog[];

  @OneToMany(() => Gadget, (gadget) => gadget.user, {
    onDelete: 'SET NULL',
  })
  gadgets: Gadget[];

  @Column({
    type: 'varchar',
    length: 255,
  })
  first_name: string;

  @Column({
    type: 'varchar',
    length: 255,
  })
  last_name: string;

  @Column({
    type: 'varchar',
    length: 255,
    unique: true,
  })
  email: string;

  @Column({
    type: 'enum',
    enum: Status,
    default: Status.INACTIVE,
  })
  status: string;

  @Column({
    type: 'boolean',
    default: false,
  })
  email_verified: boolean;
}
