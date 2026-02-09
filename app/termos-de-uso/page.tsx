import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Termos de Uso",
  description: "Termos e condicoes de uso da plataforma AdegaExpress.",
};

export default function TermosDeUsoPage() {
  return (
    <div className="mx-auto max-w-4xl px-4 py-16 lg:px-8">
      <header className="mb-12">
        <h1 className="text-3xl font-bold text-foreground sm:text-4xl text-balance">
          Termos de Uso
        </h1>
        <p className="mt-3 text-sm text-muted-foreground">
          Ultima atualizacao: 09 de fevereiro de 2026
        </p>
      </header>

      <div className="space-y-10 text-base leading-relaxed text-muted-foreground">
        {/* 1 */}
        <section>
          <h2 className="mb-3 text-xl font-semibold text-foreground">1. Aceitacao dos Termos</h2>
          <p>
            Ao acessar ou utilizar a plataforma AdegaExpress, voce concorda integralmente com estes
            Termos de Uso. Caso nao concorde com qualquer disposicao, voce nao devera utilizar
            nossos servicos. O uso continuado da plataforma apos alteracoes nos termos constitui
            aceitacao das mudancas.
          </p>
        </section>

        {/* 2 */}
        <section>
          <h2 className="mb-3 text-xl font-semibold text-foreground">2. Descricao da Plataforma</h2>
          <p>
            A AdegaExpress e uma plataforma digital que conecta adegas (estabelecimentos comerciais
            de bebidas) a consumidores finais, oferecendo recursos de catalogo online, gestao de
            estoque, ponto de venda (PDV), promocoes, cupons e logistica de entrega via motoboys
            cadastrados.
          </p>
        </section>

        {/* 3 */}
        <section>
          <h2 className="mb-3 text-xl font-semibold text-foreground">3. Tipos de Usuario</h2>
          <p className="mb-3">A plataforma possui tres perfis de cadastro:</p>
          <ul className="list-inside list-disc space-y-2 pl-2">
            <li>
              <strong className="text-foreground">Cliente:</strong> pessoa fisica maior de 18 anos
              que utiliza a plataforma para pesquisar e adquirir bebidas das adegas cadastradas.
            </li>
            <li>
              <strong className="text-foreground">Dono de Adega:</strong> pessoa fisica ou juridica
              responsavel por um estabelecimento comercial de bebidas, que utiliza a plataforma para
              vender produtos e gerenciar seu negocio.
            </li>
            <li>
              <strong className="text-foreground">Motoboy:</strong> prestador de servico de entrega
              que pode atuar como freelancer (disponivel para todas as adegas) ou vinculado a uma
              adega especifica.
            </li>
          </ul>
        </section>

        {/* 4 */}
        <section>
          <h2 className="mb-3 text-xl font-semibold text-foreground">4. Cadastro e Conta</h2>
          <ul className="list-inside list-disc space-y-2 pl-2">
            <li>O cadastro e gratuito e exige informacoes veridicas e atualizadas.</li>
            <li>Cada usuario e responsavel pela seguranca de sua senha e PIN numerico.</li>
            <li>E proibido criar contas falsas, duplicadas ou em nome de terceiros sem autorizacao.</li>
            <li>
              A plataforma reserva-se o direito de suspender ou encerrar contas que violem estes
              termos ou apresentem atividades suspeitas.
            </li>
            <li>
              Donos de adega devem fornecer CNPJ ou CPF valido e informacoes comerciais corretas.
            </li>
            <li>
              Motoboys devem fornecer CNH valida, dados do veiculo e placa para cadastro.
            </li>
          </ul>
        </section>

        {/* 5 */}
        <section>
          <h2 className="mb-3 text-xl font-semibold text-foreground">5. Restricao de Idade</h2>
          <p>
            Em conformidade com a legislacao brasileira (Lei n. 13.106/2015), e estritamente
            proibida a venda e o consumo de bebidas alcoolicas por menores de 18 anos. Ao se
            cadastrar, o usuario declara ter 18 anos ou mais. A plataforma podera solicitar
            comprovacao de idade a qualquer momento.
          </p>
        </section>

        {/* 6 */}
        <section>
          <h2 className="mb-3 text-xl font-semibold text-foreground">6. Responsabilidades do Cliente</h2>
          <ul className="list-inside list-disc space-y-2 pl-2">
            <li>Fornecer endereco correto e completo para entrega.</li>
            <li>Estar disponivel para receber o pedido no endereco informado.</li>
            <li>Realizar o pagamento conforme a forma escolhida.</li>
            <li>Consumir bebidas alcoolicas com moderacao e responsabilidade.</li>
          </ul>
        </section>

        {/* 7 */}
        <section>
          <h2 className="mb-3 text-xl font-semibold text-foreground">7. Responsabilidades do Dono de Adega</h2>
          <ul className="list-inside list-disc space-y-2 pl-2">
            <li>Manter catalogo de produtos atualizado com precos, descricoes e fotos reais.</li>
            <li>Cumprir com todas as legislacoes aplicaveis ao comercio de bebidas.</li>
            <li>Garantir a qualidade, procedencia e conservacao dos produtos vendidos.</li>
            <li>Processar pedidos em tempo habil e informar indisponibilidades.</li>
            <li>Possuir todas as licencas e alvaras necessarios para operacao.</li>
          </ul>
        </section>

        {/* 8 */}
        <section>
          <h2 className="mb-3 text-xl font-semibold text-foreground">8. Responsabilidades do Motoboy</h2>
          <ul className="list-inside list-disc space-y-2 pl-2">
            <li>Manter CNH e documentacao do veiculo em dia.</li>
            <li>Realizar as entregas com cuidado, no tempo estimado.</li>
            <li>Nao consumir bebidas alcoolicas durante o periodo de trabalho.</li>
            <li>Confirmar a entrega com foto ou comprovante quando solicitado.</li>
            <li>Manter comunicacao adequada com clientes e adegas pelo chat da plataforma.</li>
          </ul>
        </section>

        {/* 9 */}
        <section>
          <h2 className="mb-3 text-xl font-semibold text-foreground">9. Gratuidade da Plataforma</h2>
          <p>
            A utilizacao da plataforma AdegaExpress e <strong className="text-foreground">100% gratuita</strong> para
            todos os perfis de usuario (clientes, donos de adega e motoboys). Nao cobramos taxa de
            administracao, mensalidade, planos pagos, comissao sobre vendas ou qualquer outro tipo de
            tarifa pelo uso da plataforma. Os unicos custos envolvidos nas transacoes sao os relativos
            ao proprio produto adquirido e eventual taxa de entrega, negociados diretamente entre as
            partes. A AdegaExpress reserva-se o direito de alterar esta politica de gratuidade mediante
            aviso previo de 90 dias aos usuarios cadastrados.
          </p>
        </section>

        {/* 10 */}
        <section>
          <h2 className="mb-3 text-xl font-semibold text-foreground">10. Pagamentos e Cancelamentos</h2>
          <ul className="list-inside list-disc space-y-2 pl-2">
            <li>
              Os pagamentos sao processados diretamente entre cliente e adega, podendo utilizar
              dinheiro, cartao de debito/credito ou PIX. A AdegaExpress nao cobra nenhuma taxa,
              comissao ou porcentagem sobre as vendas realizadas na plataforma.
            </li>
            <li>
              Cancelamentos devem ser solicitados antes do envio do pedido. Apos o envio, fica
              a criterio da adega aceitar ou nao a devolucao.
            </li>
            <li>
              A plataforma nao se responsabiliza por transacoes financeiras realizadas fora do
              ambiente da AdegaExpress.
            </li>
          </ul>
        </section>

        {/* 11 */}
        <section>
          <h2 className="mb-3 text-xl font-semibold text-foreground">11. Propriedade Intelectual</h2>
          <p>
            Todo o conteudo da plataforma -- incluindo marca, logotipo, layout, textos, codigo-fonte
            e funcionalidades -- e de propriedade exclusiva da AdegaExpress ou de seus
            licenciadores. E proibida a reproducao, distribuicao ou modificacao sem autorizacao
            previa por escrito.
          </p>
        </section>

        {/* 12 */}
        <section>
          <h2 className="mb-3 text-xl font-semibold text-foreground">12. Limitacao de Responsabilidade</h2>
          <p>
            A AdegaExpress atua como intermediaria, conectando adegas, clientes e motoboys. Nao nos
            responsabilizamos por: qualidade dos produtos vendidos pelas adegas, atrasos na entrega
            causados por fatores externos, danos decorrentes do uso indevido da plataforma, ou
            prejuizos resultantes de informacoes incorretas fornecidas pelos usuarios.
          </p>
        </section>

        {/* 13 */}
        <section>
          <h2 className="mb-3 text-xl font-semibold text-foreground">13. Alteracoes nos Termos</h2>
          <p>
            A AdegaExpress reserva-se o direito de modificar estes Termos de Uso a qualquer
            momento, mediante publicacao da versao atualizada nesta pagina. Recomendamos a revisao
            periodica deste documento.
          </p>
        </section>

        {/* 14 */}
        <section>
          <h2 className="mb-3 text-xl font-semibold text-foreground">14. Legislacao Aplicavel</h2>
          <p>
            Estes Termos de Uso sao regidos pelas leis da Republica Federativa do Brasil. Qualquer
            disputa sera resolvida no foro da Comarca de Sao Paulo, Estado de Sao Paulo, com
            exclusao de qualquer outro.
          </p>
        </section>

        {/* 15 */}
        <section>
          <h2 className="mb-3 text-xl font-semibold text-foreground">15. Contato</h2>
          <p>
            Em caso de duvidas sobre estes Termos de Uso, entre em contato pelo e-mail{" "}
            <a href="mailto:contato@adegaexpress.com.br" className="text-primary hover:underline">
              contato@adegaexpress.com.br
            </a>{" "}
            ou pelo telefone (11) 99999-9999.
          </p>
        </section>
      </div>

      <div className="mt-16 rounded-xl border border-border bg-card p-6 text-center">
        <p className="text-sm text-muted-foreground">
          Veja tambem nossa{" "}
          <Link href="/politica-de-privacidade" className="text-primary hover:underline">
            Politica de Privacidade
          </Link>
        </p>
      </div>
    </div>
  );
}
