import { Entity, Column, ManyToOne } from 'typeorm';
import { ImageType, Status } from '../enum';
import { Profile } from './profile';
import { BaseEntity } from '../base';

@Entity({
  name: 'profile_galleries',
})
export class ProfileGallery extends BaseEntity {
  @ManyToOne(() => Profile, (profile) => profile.galleries)
  profile: Profile;

  @Column({
    type: 'varchar',
    length: 255,
  })
  name: string;

  @Column({
    type: 'varchar',
    length: 1000,
  })
  image: string;

  @Column({
    type: 'enum',
    enum: ImageType,
    default: ImageType.PNG,
  })
  type: ImageType;

  @Column({
    type: 'enum',
    enum: Status,
    default: Status.ACTIVE,
  })
  status: Status;
}
