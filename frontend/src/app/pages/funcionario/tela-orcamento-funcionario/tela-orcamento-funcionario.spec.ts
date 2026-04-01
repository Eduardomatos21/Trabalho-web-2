import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TelaOrcamentoFuncionario } from './tela-orcamento-funcionario';

describe('TelaOrcamentoFuncionario', () => {
  let component: TelaOrcamentoFuncionario;
  let fixture: ComponentFixture<TelaOrcamentoFuncionario>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TelaOrcamentoFuncionario],
    }).compileComponents();

    fixture = TestBed.createComponent(TelaOrcamentoFuncionario);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
