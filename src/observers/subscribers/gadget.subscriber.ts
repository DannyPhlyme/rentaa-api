import { Injectable } from '@nestjs/common';
import {
  Connection,
  EntitySubscriberInterface,
  InsertEvent,
  UpdateEvent,
} from 'typeorm';
import { Gadget } from 'src/database/entities/gadgets/gadget';
import { InjectConnection } from '@nestjs/typeorm';
import { GadgetElasticIndex } from '../../modules/search/constant/gadget.elastic';

@Injectable()
export class GadgetSubscriber implements EntitySubscriberInterface<Gadget> {
  constructor(
    @InjectConnection() readonly connection: Connection,
    private readonly gadgetElasticIndex: GadgetElasticIndex,
  ) {
    connection.subscribers.push(this);
  }

  public listenTo(): any {
    return Gadget;
  }

  public async afterInsert(event: InsertEvent<Gadget>): Promise<any> {
    return await this.gadgetElasticIndex.insertGadgetDocument(event.entity);
  }

  public async afterUpdate(event: UpdateEvent<Gadget>): Promise<any> {
    const { entity, queryRunner: { data: { action } } } = event;

    if(action == 'soft-remove')
      return await this.gadgetElasticIndex.deleteGadgetDocument((<Gadget>entity).id);
    else if(action == 'recover')
      return await this.gadgetElasticIndex.insertGadgetDocument(<Gadget>entity);

    return await this.gadgetElasticIndex.updateGadgetDocument(<Gadget>entity);
  }
}
