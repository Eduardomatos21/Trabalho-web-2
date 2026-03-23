import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface HistoricoRepository extends JpaRepository<Historico, Integer> {

    List<Historico> findBySolicitacaoId(Integer idSolicitacao);

}