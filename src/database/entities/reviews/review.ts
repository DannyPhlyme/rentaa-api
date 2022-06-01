import { Column, Entity, ManyToOne } from 'typeorm';
import { BaseEntity } from '../base';
import { Profile } from '../auth/profile';
import { IsUUID } from 'class-validator';

@Entity({
  name: 'reviews',
})
export class Review extends BaseEntity {
  @ManyToOne(() => Profile, (profile) => profile.reviews)
  profile: Profile;

  @Column({ nullable: false })
  avatarId?: string; // id of the avatar. this increases performance

  @Column({
    type: 'varchar',
    length: 255,
  })
  reviewer: string;

  @Column({
    type: 'text',
  })
  review: string;
}
