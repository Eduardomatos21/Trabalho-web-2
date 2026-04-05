import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EditarFuncionario } from './editar-funcionario';

describe('EditarFuncionario', () => {
  let component: EditarFuncionario;
  let fixture: ComponentFixture<EditarFuncionario>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EditarFuncionario],
    }).compileComponents();

    fixture = TestBed.createComponent(EditarFuncionario);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
