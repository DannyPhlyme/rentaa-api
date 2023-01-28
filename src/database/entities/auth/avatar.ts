import { Entity, Column } from 'typeorm';
import { BaseEntity } from '../base';
@Entity({
  name: 'avatars',
})
export class Avatar extends BaseEntity {
  // @OneToOne(() => Profile, (profile) => profile.avatar)
  // profile: Profile;

  @Column({
    type: 'varchar',
    nullable: true,
  })
  originalname: string;

  @Column({
    nullable: true,
  })
  bucketname: string;

  @Column({
    nullable: true,
  })
  key: string;

  // @Column({
  //   type: 'bytea',
  //   nullable: true,
  // })
  // data: Uint8Array;
}
