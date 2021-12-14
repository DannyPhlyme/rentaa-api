import { Entity, Column, ManyToOne } from 'typeorm';
import { BaseEntity } from '../base';
// import { ImageType } from '../enum';
import { Gadget } from './gadget';

/**
 * Declares the GadgetPhoto entity class
 */
@Entity({
  name: 'gadget_photos',
})
export class GadgetPhoto extends BaseEntity {
  @ManyToOne(() => Gadget, (gadget) => gadget.photos)
  gadget: Gadget;

  @Column({
    type: 'varchar',
    length: 255,
  })
  originalname: string;

  @Column({
    type: 'varchar',
    length: 255,
  })
  encoding: string;

  @Column({
    type: 'varchar',
    length: 255,
  })
  mimetype: string;

  @Column({
    type: 'numeric',
    precision: 65, // pending for change
  })
  size: number;

  @Column({
    type: 'bool',
    default: false,
  })
  cover: boolean;

  @Column()
  url: string;

  @Column()
  key: string;
}
