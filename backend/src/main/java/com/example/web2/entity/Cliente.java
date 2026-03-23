@Entity
@Table(name = "Cliente")
public class Cliente {

    @Id
    @Column(length = 11)
    private String cpf;

    @Column(length = 50)
    private String nome;

    @Column(length = 50, unique = true)
    private String email;

    @Column(length = 11)
    private String telefone;

    @ManyToOne
    @JoinColumn(name = "id_endereco")
    private Endereco endereco;

}