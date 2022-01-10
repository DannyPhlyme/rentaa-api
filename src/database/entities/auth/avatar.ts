import { Entity, Column, OneToOne } from 'typeorm';
import { BaseEntity } from '../base';
import { Profile } from './profile';

@Entity({
  name: 'avatars',
})
export class Avatar extends BaseEntity {
  // @OneToOne(() => Profile, (profile) => profile.avatar)
  // profile: Profile;

  @Column({
    type: 'longblob',
    nullable: true,
  })
  data: Uint8Array;
}
