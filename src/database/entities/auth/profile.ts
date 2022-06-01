import { Entity, Column, JoinColumn, OneToOne, OneToMany } from 'typeorm';
import { Avatar } from './avatar';
import { BaseEntity } from '../base';
import { Review } from '../reviews/review';

@Entity({
  name: 'profiles',
})
export class Profile extends BaseEntity {
  @OneToOne(() => Avatar)
  @JoinColumn({ name: 'avatarId', referencedColumnName: 'id' })
  avatar: Avatar;

  @OneToMany(() => Review, (review) => review.profile, {
    onDelete: 'SET NULL', // fallback for delete
    eager: true,
  })
  reviews: Review[];

  @Column({ nullable: false })
  avatarId?: string; // id of the avatar. this increases performance

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
    length: 400,
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
