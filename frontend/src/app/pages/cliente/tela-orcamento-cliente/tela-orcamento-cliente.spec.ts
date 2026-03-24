import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TelaOrcamentoCliente } from './tela-orcamento-cliente';

describe('TelaOrcamentoCliente', () => {
  let component: TelaOrcamentoCliente;
  let fixture: ComponentFixture<TelaOrcamentoCliente>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [TelaOrcamentoCliente],
    }).compileComponents();

    fixture = TestBed.createComponent(TelaOrcamentoCliente);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
