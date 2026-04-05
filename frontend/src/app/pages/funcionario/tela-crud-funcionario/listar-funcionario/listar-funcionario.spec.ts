import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ListarFuncionario } from './listar-funcionario';

describe('ListarFuncionario', () => {
  let component: ListarFuncionario;
  let fixture: ComponentFixture<ListarFuncionario>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ListarFuncionario],
    }).compileComponents();

    fixture = TestBed.createComponent(ListarFuncionario);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
