import { Column, Entity, OneToMany } from 'typeorm';
import { BaseEntity } from '../base.entity';
// import { ICategory } from '../../interfaces/category.interface';
import { Gadget } from './gadget.entity';

/**
 * Declares the Category entity class
 */
@Entity({
  name: 'categories',
})
export class Category extends BaseEntity {
  @OneToMany(() => Gadget, (gadget) => gadget.category, {
    onDelete: 'SET NULL',
  })
  gadget: Gadget;

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
}
