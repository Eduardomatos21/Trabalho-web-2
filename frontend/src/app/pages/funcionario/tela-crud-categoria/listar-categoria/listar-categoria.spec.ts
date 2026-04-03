import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ListarCategoria } from './listar-categoria';

describe('ListarCategoria', () => {
  let component: ListarCategoria;
  let fixture: ComponentFixture<ListarCategoria>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ListarCategoria],
    }).compileComponents();

    fixture = TestBed.createComponent(ListarCategoria);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
