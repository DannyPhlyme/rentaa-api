import { Column, Entity, ManyToOne, BeforeUpdate, BeforeInsert } from 'typeorm';
import { Status } from '../enum';
import { User } from './user';
import * as bcrypt from 'bcrypt';
import { BaseEntity } from '../base';

@Entity({
  name: 'passwords',
})
export class Password extends BaseEntity {
  @ManyToOne(() => User, (user) => user.passwords)
  user: User;

  @Column({
    type: 'varchar',
    length: 255,
  })
  salt: number;

  @Column({
    type: 'varchar',
    length: 255,
  })
  hash: string;

  @Column({
    type: 'enum',
    enum: Status,
    default: Status.ACTIVE,
  })
  status: string;

  @BeforeInsert()
  async hashPassword() {
    this.hash = await bcrypt.hash(this.hash, 10);
  }

  async comparePassword(data: string) {
    return await bcrypt.compare(data, this.hash);
  }

  @BeforeUpdate()
  updateTimestamp() {
    this.updated_at = new Date();
  }
}
