import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Politica de Privacidade",
  description: "Politica de privacidade e protecao de dados da plataforma AdegaExpress.",
};

export default function PoliticaDePrivacidadePage() {
  return (
    <div className="mx-auto max-w-4xl px-4 py-16 lg:px-8">
      <header className="mb-12">
        <h1 className="text-3xl font-bold text-foreground sm:text-4xl text-balance">
          Politica de Privacidade
        </h1>
        <p className="mt-3 text-sm text-muted-foreground">
          Ultima atualizacao: 09 de fevereiro de 2026
        </p>
      </header>

      <div className="space-y-10 text-base leading-relaxed text-muted-foreground">
        {/* 1 */}
        <section>
          <h2 className="mb-3 text-xl font-semibold text-foreground">1. Introducao</h2>
          <p>
            A AdegaExpress valoriza a privacidade e a protecao dos dados pessoais de seus usuarios.
            Esta Politica de Privacidade descreve como coletamos, utilizamos, armazenamos e
            protegemos as informacoes fornecidas por voce ao utilizar nossa plataforma, em
            conformidade com a Lei Geral de Protecao de Dados Pessoais (LGPD -- Lei n. 13.709/2018).
          </p>
        </section>

        {/* 2 */}
        <section>
          <h2 className="mb-3 text-xl font-semibold text-foreground">2. Dados que Coletamos</h2>
          <p className="mb-3">Coletamos diferentes dados conforme o perfil do usuario:</p>

          <div className="space-y-4">
            <div className="rounded-lg border border-border bg-card/50 p-4">
              <h3 className="mb-2 text-sm font-semibold text-foreground">Clientes</h3>
              <p className="text-sm">
                Nome completo, e-mail, telefone, CPF (opcional), endereco de entrega, senha
                (armazenada com criptografia), PIN numerico e historico de pedidos.
              </p>
            </div>
            <div className="rounded-lg border border-border bg-card/50 p-4">
              <h3 className="mb-2 text-sm font-semibold text-foreground">Donos de Adega</h3>
              <p className="text-sm">
                Nome do responsavel, e-mail, telefone, CPF, CNPJ, nome e descricao da adega,
                endereco do estabelecimento, dados financeiros relativos a vendas e catalogo de
                produtos.
              </p>
            </div>
            <div className="rounded-lg border border-border bg-card/50 p-4">
              <h3 className="mb-2 text-sm font-semibold text-foreground">Motoboys</h3>
              <p className="text-sm">
                Nome completo, e-mail, telefone, CPF, CNH, tipo e placa do veiculo, modo de
                trabalho (freelancer ou vinculado), endereco-base de operacao e historico de
                entregas.
              </p>
            </div>
          </div>
        </section>

        {/* 3 */}
        <section>
          <h2 className="mb-3 text-xl font-semibold text-foreground">3. Dados Coletados Automaticamente</h2>
          <p>
            Ao utilizar a plataforma, podemos coletar automaticamente: endereco IP, tipo de
            navegador, sistema operacional, paginas visitadas, tempo de permanencia, dados de
            cookies e informacoes de desempenho do site para fins de analise e melhoria da
            experiencia do usuario.
          </p>
        </section>

        {/* 4 */}
        <section>
          <h2 className="mb-3 text-xl font-semibold text-foreground">4. Como Utilizamos seus Dados</h2>
          <ul className="list-inside list-disc space-y-2 pl-2">
            <li>Criar e gerenciar sua conta na plataforma.</li>
            <li>Processar pedidos, pagamentos e entregas.</li>
            <li>Permitir comunicacao entre clientes, adegas e motoboys via chat.</li>
            <li>Enviar notificacoes sobre pedidos, entregas e atualizacoes da plataforma.</li>
            <li>Personalizar sua experiencia e recomendar produtos relevantes.</li>
            <li>Gerar relatorios e estatisticas para adegas (dados anonimizados).</li>
            <li>Prevenir fraudes e garantir a seguranca da plataforma.</li>
            <li>Cumprir obrigacoes legais e regulatorias.</li>
          </ul>
        </section>

        {/* 5 */}
        <section>
          <h2 className="mb-3 text-xl font-semibold text-foreground">5. Compartilhamento de Dados</h2>
          <p className="mb-3">Seus dados podem ser compartilhados nas seguintes situacoes:</p>
          <ul className="list-inside list-disc space-y-2 pl-2">
            <li>
              <strong className="text-foreground">Entre usuarios da plataforma:</strong> dados de
              endereco e nome sao compartilhados com a adega e o motoboy para viabilizar a entrega.
            </li>
            <li>
              <strong className="text-foreground">Prestadores de servico:</strong> utilizamos
              servicos de terceiros para hospedagem, analise de dados e processamento de pagamentos,
              que possuem suas proprias politicas de privacidade.
            </li>
            <li>
              <strong className="text-foreground">Obrigacao legal:</strong> quando exigido por lei,
              decisao judicial ou autoridade competente.
            </li>
          </ul>
          <p className="mt-3">
            Nao vendemos, alugamos ou comercializamos seus dados pessoais com terceiros para fins
            publicitarios.
          </p>
        </section>

        {/* 6 */}
        <section>
          <h2 className="mb-3 text-xl font-semibold text-foreground">6. Armazenamento e Seguranca</h2>
          <ul className="list-inside list-disc space-y-2 pl-2">
            <li>
              Senhas sao armazenadas com criptografia forte (bcrypt) e nunca em texto puro.
            </li>
            <li>
              Dados sao armazenados em servidores seguros com criptografia em transito (HTTPS/TLS).
            </li>
            <li>
              O acesso a dados pessoais e restrito a funcionalidades necessarias para a operacao da
              plataforma.
            </li>
            <li>
              Realizamos backups periodicos e monitoramento contra acessos nao autorizados.
            </li>
          </ul>
        </section>

        {/* 7 */}
        <section>
          <h2 className="mb-3 text-xl font-semibold text-foreground">7. Cookies</h2>
          <p>
            Utilizamos cookies de sessao para manter voce autenticado na plataforma e cookies de
            analise (Vercel Analytics) para compreender o uso do site. Voce pode configurar seu
            navegador para recusar cookies, mas isso podera afetar a funcionalidade da plataforma.
          </p>
        </section>

        {/* 8 */}
        <section>
          <h2 className="mb-3 text-xl font-semibold text-foreground">8. Seus Direitos (LGPD)</h2>
          <p className="mb-3">
            Em conformidade com a LGPD, voce tem os seguintes direitos sobre seus dados pessoais:
          </p>
          <ul className="list-inside list-disc space-y-2 pl-2">
            <li>
              <strong className="text-foreground">Acesso:</strong> solicitar quais dados pessoais
              seus temos armazenados.
            </li>
            <li>
              <strong className="text-foreground">Correcao:</strong> solicitar a correcao de dados
              incompletos, inexatos ou desatualizados.
            </li>
            <li>
              <strong className="text-foreground">Anonimizacao ou eliminacao:</strong> solicitar a
              anonimizacao, bloqueio ou eliminacao de dados desnecessarios ou excessivos.
            </li>
            <li>
              <strong className="text-foreground">Portabilidade:</strong> solicitar a transferencia
              dos seus dados a outro fornecedor de servico.
            </li>
            <li>
              <strong className="text-foreground">Revogacao:</strong> revogar o consentimento dado
              para tratamento de dados a qualquer momento.
            </li>
            <li>
              <strong className="text-foreground">Exclusao de conta:</strong> solicitar a exclusao
              completa da sua conta e dados associados.
            </li>
          </ul>
          <p className="mt-3">
            Para exercer qualquer desses direitos, entre em contato pelo e-mail{" "}
            <a href="mailto:privacidade@adegaexpress.com.br" className="text-primary hover:underline">
              privacidade@adegaexpress.com.br
            </a>.
          </p>
        </section>

        {/* 9 */}
        <section>
          <h2 className="mb-3 text-xl font-semibold text-foreground">9. Retencao de Dados</h2>
          <p>
            Mantemos seus dados pessoais pelo tempo necessario para cumprir as finalidades descritas
            nesta politica, salvo quando um periodo de retencao maior for exigido ou permitido por
            lei. Dados de transacoes financeiras sao mantidos pelo prazo legal minimo de 5 anos.
            Apos a exclusao da conta, dados sao anonimizados ou removidos em ate 30 dias.
          </p>
        </section>

        {/* 10 */}
        <section>
          <h2 className="mb-3 text-xl font-semibold text-foreground">10. Menores de Idade</h2>
          <p>
            A plataforma AdegaExpress e destinada exclusivamente a maiores de 18 anos. Nao
            coletamos intencionalmente dados de menores de idade. Caso identifiquemos que um menor
            se cadastrou na plataforma, a conta sera imediatamente suspensa e os dados excluidos.
          </p>
        </section>

        {/* 11 */}
        <section>
          <h2 className="mb-3 text-xl font-semibold text-foreground">11. Alteracoes nesta Politica</h2>
          <p>
            Reservamo-nos o direito de atualizar esta Politica de Privacidade periodicamente. A
            versao mais recente estara sempre disponivel nesta pagina, com a data da ultima
            atualizacao. Recomendamos a consulta frequente deste documento.
          </p>
        </section>

        {/* 12 */}
        <section>
          <h2 className="mb-3 text-xl font-semibold text-foreground">12. Contato e Encarregado de Dados (DPO)</h2>
          <p>
            Para questoes relacionadas a privacidade e protecao de dados, entre em contato com nosso
            Encarregado de Dados (DPO):
          </p>
          <div className="mt-4 rounded-lg border border-border bg-card/50 p-4">
            <p className="text-sm">
              <strong className="text-foreground">E-mail:</strong>{" "}
              <a href="mailto:privacidade@adegaexpress.com.br" className="text-primary hover:underline">
                privacidade@adegaexpress.com.br
              </a>
            </p>
            <p className="mt-1 text-sm">
              <strong className="text-foreground">Telefone:</strong> (11) 99999-9999
            </p>
            <p className="mt-1 text-sm">
              <strong className="text-foreground">Endereco:</strong> Sao Paulo, SP - Brasil
            </p>
          </div>
        </section>
      </div>

      <div className="mt-16 rounded-xl border border-border bg-card p-6 text-center">
        <p className="text-sm text-muted-foreground">
          Veja tambem nossos{" "}
          <Link href="/termos-de-uso" className="text-primary hover:underline">
            Termos de Uso
          </Link>
        </p>
      </div>
    </div>
  );
}
