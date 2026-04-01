import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TelaSolicitacaoFuncionario } from './tela-solicitacao-funcionario';

describe('TelaSolicitacaoFuncionario', () => {
  let component: TelaSolicitacaoFuncionario;
  let fixture: ComponentFixture<TelaSolicitacaoFuncionario>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TelaSolicitacaoFuncionario],
    }).compileComponents();

    fixture = TestBed.createComponent(TelaSolicitacaoFuncionario);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
