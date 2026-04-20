import { Component, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { CategoriaService } from './services';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App {
  constructor(private categoriaService: CategoriaService) {
    this.categoriaService.precarregarCategorias();
  }

  protected readonly title = signal('Trabalho-web-2');
}
