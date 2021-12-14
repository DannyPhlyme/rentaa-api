import { Column, Entity, OneToMany, ManyToOne } from 'typeorm';
import { BaseEntity } from '../base';
import { Category } from './category';
import { GadgetPhoto } from './gadget-photo';
import { User } from '../auth/user';
import { GadgetCondition, GadgetStatus } from '../enum';

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
    onDelete: 'SET NULL',
  })
  photos: GadgetPhoto[];

  @Column({
    type: 'varchar',
    length: 255,
  })
  name: string;

  @Column({
    type: 'varchar',
    length: 255,
  })
  description: string;

  @Column({
    type: 'enum',
    enum: GadgetStatus,
    default: GadgetStatus.UNAVAILABLE,
  })
  status: string;

  @Column({
    type: 'numeric',
    precision: 8,
    scale: 2,
  })
  price: number;

  @Column({
    type: 'enum',
    enum: GadgetCondition,
    default: GadgetCondition.UNVERIFIED,
  })
  condition: string;

  @Column({
    type: 'varchar',
    length: 255,
  })
  address: string;

  @Column({
    type: 'timestamp',
  })
  pickup_date: Date;
}
