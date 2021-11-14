import { Column, Entity, ManyToOne } from 'typeorm';
import { User } from './user';
import { BaseEntity } from '../base';

@Entity({
  name: 'login_histories',
})
export class LoginHistory extends BaseEntity {
  @ManyToOne(() => User, (user) => user.histories)
  user: User;

  @Column({
    type: 'varchar',
    length: 20,
    nullable: true,
  })
  ip: string;

  @Column({
    type: 'timestamp',
    nullable: true,
  })
  login_date: Date;

  @Column({
    type: 'timestamp',
    nullable: true,
  })
  logout_date: Date;
}
