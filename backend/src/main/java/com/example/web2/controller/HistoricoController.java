import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/historico")
public class HistoricoController {

    private final HistoricoService service;

    public HistoricoController(HistoricoService service) {
        this.service = service;
    }

    @GetMapping("/{idSolicitacao}")
    public List<Historico> buscar(@PathVariable Integer idSolicitacao) {
        return service.listarPorSolicitacao(idSolicitacao);
    }
}