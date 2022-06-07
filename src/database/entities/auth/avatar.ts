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

  /**
   * @todo change type to bytea for postgres
   */
  @Column({
    // type: 'longblob',
    type: 'bytea',
    nullable: true,
  })
  data: Uint8Array;
}
