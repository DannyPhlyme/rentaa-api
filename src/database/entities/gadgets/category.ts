import { Column, Entity, OneToMany } from 'typeorm';
import { BaseEntity } from '../base';
import { Gadget } from './gadget';

/**
 * Declares the Category entity class
 */
@Entity({
  name: 'categories',
})
export class Category extends BaseEntity {
  @OneToMany(() => Gadget, (gadget) => gadget.category)
  gadgets: Gadget[];

  @Column({
    type: 'varchar',
    length: 255,
    unique: true,
  })
  name: string;

  @Column({
    type: 'varchar',
    length: 255,
    nullable: true,
  })
  description: string;
}
