import { Entity, Column, OneToOne, JoinColumn, OneToMany } from 'typeorm';
import { ProfileGallery } from './profile-gallery';
import { BaseEntity } from '../base';
import { User } from './user';

@Entity({
  name: 'profiles',
})
export class Profile extends BaseEntity {
  @OneToMany(() => ProfileGallery, (gallery) => gallery.profile)
  galleries: ProfileGallery[];

  @OneToOne(() => User)
  @JoinColumn({ name: 'userId', referencedColumnName: 'id' })
  user: User;

  @Column({
    type: 'varchar',
    length: 255,
    nullable: true,
  })
  address: string;

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
}
