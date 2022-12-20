import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { AppService } from './app.service';
import {
  Category,
  CategoryRepositoryFake,
} from './database/entities/gadgets/category';
import {
  Gadget,
  GadgetRepositoryFake,
} from './database/entities/gadgets/gadget';
import { CategoriesService } from './modules/categories/categories.service';

describe('AppService', () => {
  let appService: AppService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AppService,
        CategoriesService,
        {
          provide: getRepositoryToken(Category),
          useClass: CategoryRepositoryFake,
        },
        {
          provide: getRepositoryToken(Gadget),
          useClass: GadgetRepositoryFake,
        },
      ],
    }).compile();

    appService = module.get<AppService>(AppService);
  });

  describe('getHello', () => {
    it('should return "Hello World!"', () => {
      expect(appService.getHello()).toBe('Hello World!');
    });
  });
});
