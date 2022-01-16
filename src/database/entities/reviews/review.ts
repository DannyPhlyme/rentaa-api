import { Column, Entity, ManyToOne } from 'typeorm';
import { BaseEntity } from '../base';
import { Profile } from '../auth/profile';

@Entity({
  name: 'reviews',
})
export class Review extends BaseEntity {
  @ManyToOne(() => Profile, (profile) => profile.reviews)
  profile: Profile;

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
