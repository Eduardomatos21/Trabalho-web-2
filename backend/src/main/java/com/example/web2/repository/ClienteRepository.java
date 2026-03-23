import org.springframework.data.jpa.repository.JpaRepository;

import com.example.web2.entity.Cliente;

public interface ClienteRepository extends JpaRepository<Cliente, String> {
}

