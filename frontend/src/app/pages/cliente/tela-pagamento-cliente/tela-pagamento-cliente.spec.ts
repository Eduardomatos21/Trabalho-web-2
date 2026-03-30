import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TelaPagamentoCliente } from './tela-pagamento-cliente';

describe('TelaPagamentoCliente', () => {
  let component: TelaPagamentoCliente;
  let fixture: ComponentFixture<TelaPagamentoCliente>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [TelaPagamentoCliente],
    }).compileComponents();

    fixture = TestBed.createComponent(TelaPagamentoCliente);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
