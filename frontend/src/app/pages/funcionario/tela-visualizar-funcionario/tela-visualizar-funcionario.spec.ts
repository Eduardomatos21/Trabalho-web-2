import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TelaVisualizarFuncionario } from './tela-visualizar-funcionario';

describe('TelaVisualizarFuncionario', () => {
  let component: TelaVisualizarFuncionario;
  let fixture: ComponentFixture<TelaVisualizarFuncionario>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TelaVisualizarFuncionario],
    }).compileComponents();

    fixture = TestBed.createComponent(TelaVisualizarFuncionario);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
