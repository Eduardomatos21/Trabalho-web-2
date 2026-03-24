import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TelaSolicitacaoCliente } from './tela-solicitacao-cliente';

describe('TelaSolicitacaoCliente', () => {
  let component: TelaSolicitacaoCliente;
  let fixture: ComponentFixture<TelaSolicitacaoCliente>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TelaSolicitacaoCliente],
    }).compileComponents();

    fixture = TestBed.createComponent(TelaSolicitacaoCliente);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
