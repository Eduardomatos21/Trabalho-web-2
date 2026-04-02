import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TelaManutencaoFuncionario } from './tela-manutencao-funcionario';

describe('TelaManutencaoFuncionario', () => {
  let component: TelaManutencaoFuncionario;
  let fixture: ComponentFixture<TelaManutencaoFuncionario>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TelaManutencaoFuncionario],
    }).compileComponents();

    fixture = TestBed.createComponent(TelaManutencaoFuncionario);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
