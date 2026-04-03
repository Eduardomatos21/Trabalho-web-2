import { ComponentFixture, TestBed } from '@angular/core/testing';

import { InserirCategoria } from './inserir-categoria';

describe('InserirCategoria', () => {
  let component: InserirCategoria;
  let fixture: ComponentFixture<InserirCategoria>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [InserirCategoria],
    }).compileComponents();

    fixture = TestBed.createComponent(InserirCategoria);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
