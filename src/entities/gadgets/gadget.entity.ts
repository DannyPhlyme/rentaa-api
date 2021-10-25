import { Column, Entity, OneToMany, ManyToOne } from 'typeorm';
import { BaseEntity } from '../base.entity';
import { Category } from './category.entity';
import { GadgetPhoto } from './gadget-photo.entity';

/**
 * Declares the Gadget entity class
 */
@Entity({
  name: 'gadgets',
})
export class Gadget extends BaseEntity {
  @ManyToOne(() => Gadget, (gadget) => gadget.photos)
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
    type: 'numeric',
    precision: 8,
    scale: 2,
  })
  price: number;

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
