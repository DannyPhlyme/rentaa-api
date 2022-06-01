import { Column, Entity, OneToMany, ManyToOne } from 'typeorm';
import { BaseEntity } from '../base';
import { Category } from './category';
import { GadgetPhoto } from './gadget-photo';
import { User } from '../auth/user';
import { GadgetCondition } from '../enum';

/**
 * Declares the Gadget entity class
 */
@Entity({
  name: 'gadgets',
})
export class Gadget extends BaseEntity {
  @ManyToOne(() => User, (user) => user.gadgets)
  user: User;

  @ManyToOne(() => Category, (category) => category.gadgets)
  category: Category;

  @OneToMany(() => GadgetPhoto, (photo) => photo.gadget, {
    onDelete: 'SET NULL', // fallback for delete
    eager: true,
  })
  photos: GadgetPhoto[];

  @Column({
    type: 'varchar',
    length: 255,
  })
  name: string;

  @Column({
    type: 'varchar',
    length: 400,
    nullable: true,
  })
  description: string;

  @Column({
    type: 'varchar',
    length: 255,
    nullable: true,
  })
  price: string;

  @Column({
    type: 'enum',
    enum: GadgetCondition,
  })
  condition: string;

  @Column({
    type: 'varchar',
    length: 255,
  })
  state: string;

  @Column({
    type: 'varchar',
    length: 255,
  })
  lga: string;

  @Column({
    type: 'varchar',
    length: 255,
  })
  contact_info: string;
}
