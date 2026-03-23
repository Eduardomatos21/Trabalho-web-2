import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/clientes")
public class ClienteController {

    private final ClienteService service;

    public ClienteController(ClienteService service) {
        this.service = service;
    }

    @GetMapping
    public List<Cliente> listar() {
        return service.listar();
    }

    @PostMapping
    public Cliente criar(@RequestBody Cliente cliente) {
        return service.salvar(cliente);
    }

    @DeleteMapping("/{cpf}")
    public void deletar(@PathVariable String cpf) {
        service.deletar(cpf);
    }

    @GetMapping("/{cpf}")
    public Cliente buscar(@PathVariable String cpf) {
        return service.buscar(cpf);
    }
}