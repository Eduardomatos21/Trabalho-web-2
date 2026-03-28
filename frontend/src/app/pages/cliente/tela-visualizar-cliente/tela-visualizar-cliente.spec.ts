import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TelaVisualizarCliente } from './tela-visualizar-cliente';

describe('TelaVisualizarCliente', () => {
  let component: TelaVisualizarCliente;
  let fixture: ComponentFixture<TelaVisualizarCliente>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [TelaVisualizarCliente],
    }).compileComponents();

    fixture = TestBed.createComponent(TelaVisualizarCliente);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
