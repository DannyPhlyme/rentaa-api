import { Column, Entity, JoinColumn, OneToOne } from 'typeorm';
import { BaseEntity } from '../base';
import { Profile } from './profile';

@Entity({
  name: 'social_handles',
})
export class SocialHandle extends BaseEntity {
  @OneToOne(() => Profile)
  @JoinColumn({ name: 'profileId', referencedColumnName: 'id' })
  profile: Profile;

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
