import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TelaRelatoriosFuncionario } from './tela-relatorios-funcionario';

describe('TelaRelatoriosFuncionario', () => {
  let component: TelaRelatoriosFuncionario;
  let fixture: ComponentFixture<TelaRelatoriosFuncionario>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TelaRelatoriosFuncionario],
    }).compileComponents();

    fixture = TestBed.createComponent(TelaRelatoriosFuncionario);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
