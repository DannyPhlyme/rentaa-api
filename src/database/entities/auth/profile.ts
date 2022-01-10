import { Entity, Column, JoinColumn, OneToOne } from 'typeorm';
import { Avatar } from './avatar';
import { BaseEntity } from '../base';

@Entity({
  name: 'profiles',
})
export class Profile extends BaseEntity {
  // @OneToOne(() => Avatar)
  // @JoinColumn({ name: 'avatarId', referencedColumnName: 'id' })
  // avatar: Avatar;

  // @Column({ nullable: true })
  // avatarId?: string; // id of the avatar. this increases performance

  @Column({
    type: 'varchar',
    length: 255,
  })
  phone_number: string;

  @Column({
    type: 'varchar',
    length: 255,
    nullable: true,
  })
  state: string;

  @Column({
    type: 'varchar',
    length: 255,
    nullable: true,
  })
  lga: string;

  @Column({
    type: 'varchar',
    length: 255,
    nullable: true,
  })
  description: string; // describe yourself

  @Column({
    type: 'varchar',
    length: 255,
    nullable: true,
  })
  twitter: string;

  @Column({
    type: 'varchar',
    length: 255,
    nullable: true,
  })
  instagram: string;
}
