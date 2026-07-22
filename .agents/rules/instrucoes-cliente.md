---
trigger: always_on
---

# Instruções de Desenvolvimento: Perfil do Cliente

Este documento contém o guia completo de comportamento, regras de negócio, rotas, componentes e mapeamento de APIs para o fluxo do **Cliente** na plataforma **Take Your Time (TYT)**. Ele serve como instrução detalhada de contexto para qualquer IA que venha a trabalhar neste projeto.

---

## 1. Mapeamento de Rotas e Telas do Cliente.

Todas as páginas do cliente estão sob `src/pages/` e configuradas no roteador principal (`src/App.tsx`).

### 1.1 Telas Públicas (Fluxo de Entrada)
* **`/` ([Index.tsx](file:///Users/viniciussantiago/Matilha/tyt-users/src/pages/Index.tsx))**: Landing Page com cards direcionando o cliente para login ou contratação de serviços.
* **`/login` ([Login.tsx](file:///Users/viniciussantiago/Matilha/tyt-users/src/pages/Login.tsx))**: Autenticação de clientes.
  * Validações: Formato de e-mail e senha (mínimo de 6 caracteres).
  * Redireciona para `/dashboard-cliente` em caso de sucesso.
* **`/cadastro` ([Cadastro.tsx](file:///Users/viniciussantiago/Matilha/tyt-users/src/pages/Cadastro.tsx))**: Criação de novas contas de cliente.
  * Requer: Nome, E-mail, Telefone/WhatsApp, CPF, Senha e Confirmação.
  * Validações: CPF válido e único, formato de e-mail único, senha com mínimo de 8 caracteres contendo letras e números, aceite dos Termos de Uso.
  * Redireciona para `/login` em caso de sucesso.
* **`/esqueci-senha` ([EsqueciSenha.tsx](file:///Users/viniciussantiago/Matilha/tyt-users/src/pages/EsqueciSenha.tsx))**: Recuperação de senha do cliente via e-mail.

### 1.2 Telas Autenticadas do Cliente
* **`/dashboard-cliente` ([DashboardCliente.tsx](file:///Users/viniciussantiago/Matilha/tyt-users/src/pages/DashboardCliente.tsx))**: Painel inicial do cliente logado. Exibe resumo de serviços ativos, próximas entregas/eventos, atalhos para nova contratação e notificações.
* **`/meus-contratos` ([MeusContratos.tsx](file:///Users/viniciussantiago/Matilha/tyt-users/src/pages/MeusContratos.tsx))**: Histórico de todos os contratos/pedidos solicitados pelo cliente.
  * Status dos contratos: `Pendente`, `Confirmado` (atribuído ao Chef), `Concluido`, `Cancelado`.
* **`/detalhes-contrato/:id` ([DetalheContrato.tsx](file:///Users/viniciussantiago/Matilha/tyt-users/src/pages/DetalheContrato.tsx))**: Detalhes completos do contrato, incluindo dados do Chef atribuído, cronograma, cardápio selecionado e formulário de avaliação do serviço (disponível apenas após a conclusão do serviço).
* **`/historico-pagamento` ([HistoricoPagamento.tsx](file:///Users/viniciussantiago/Matilha/tyt-users/src/pages/HistoricoPagamento.tsx))**: Extrato financeiro de todas as cobranças do cliente, mostrando os últimos 4 dígitos do cartão, status do pagamento e links para download de comprovantes.
* **`/gerenciar-cartoes` ([GerenciarCartoes.tsx](file:///Users/viniciussantiago/Matilha/tyt-users/src/pages/GerenciarCartoes.tsx))**: Cadastro e exclusão de cartões de crédito. Máximo de 5 cartões salvos. Permite definir um cartão padrão.
* **`/editar-dados` ([EditarDadosPessoais.tsx](file:///Users/viniciussantiago/Matilha/tyt-users/src/pages/EditarDadosPessoais.tsx))**: Atualização cadastral (Nome, E-mail, WhatsApp, Endereço, Foto de Perfil) e alteração de senha (Senha Atual, Nova Senha, Confirmar Nova Senha).
* **`/cardapio` ([Cardapio.tsx](file:///Users/viniciussantiago/Matilha/tyt-users/src/pages/Cardapio.tsx))**: Catálogo de pratos disponíveis para filtragem por preferência culinária, categoria, restrições e ingredientes.
* **`/prato/:id` ([PratoDetalhes.tsx](file:///Users/viniciussantiago/Matilha/tyt-users/src/pages/PratoDetalhes.tsx))**: Página de detalhes nutricionais, ingredientes e fotos de um prato específico.

### 1.3 O Fluxo de Contratação
* **`/contratacao` / `/contratacao-logado` ([Contratacao.tsx](file:///Users/viniciussantiago/Matilha/tyt-users/src/pages/Contratacao.tsx))**: Fluxo multi-etapas.
  * **Etapa 1: Escolha do Serviço**: Seleção de cidade (obrigatório) e modalidade:
    * *Cozinha Semanal*: Refeições recorrentes pré-preparadas.
    * *Eventos*: Jantares e celebrações presenciais.
    * *Serviços Especiais*: Demandas customizadas fora do catálogo.
  * **Etapa 2: Configuração**:
    * *Cozinha Semanal*: Seleção do tamanho da porção (P, M, G), restrições, ingredientes a evitar, preferências, dias e períodos (Manhã/Tarde/Noite) de entrega.
    * *Eventos*: Quantidade de pessoas (5 a 500), data do evento (mínimo de 7 dias de antecedência), horários de início/fim e tema do evento.
    * *Serviços Especiais*: Essa modalidade **pula** a Etapa 2 de configuração direta e vai para a Etapa 3.
  * **Etapa 3: Escolha de Pratos/Detalhamento**:
    * *Cozinha Semanal*: Seleção de pratos sugeridos baseados nas preferências (mínimo de 1 prato).
    * *Eventos*: Escolha do nível de serviço (*Clássico*: mín. 1 entrada, 1 prato principal, 1 sobremesa; *Banquete*: mín. 2 entradas, 2 pratos principais, 2 sobremesas) e seleção dos itens.
    * *Serviços Especiais*: Campo de texto aberto para descrever a necessidade (mínimo de 100 caracteres).
  * **Etapa 4: Identificação**: Solicitado apenas se o cliente não estiver logado. Permite fazer login ou efetuar cadastro rápido (se logado, esta etapa é ignorada automaticamente).
  * **Etapa 5: Resumo e Pagamento**:
    * *Cozinha Semanal / Eventos*: Exibe o valor total do serviço, permite cadastrar/selecionar cartão e endereço e efetuar a compra.
    * *Serviços Especiais*: **Não passa por esta etapa**. Após a Etapa 3, o pedido é registrado como `aguardando_orcamento`, pois o Backoffice enviará uma proposta personalizada em até 48h.

---

## 2. APIs e Integrações (Serviços Usados pelo Cliente)

O frontend interage com a API RESTful configurada em [apiClient.ts](file:///Users/viniciussantiago/Matilha/tyt-users/src/services/apiClient.ts). Os serviços de dados relevantes para o cliente são:

### 2.1 Autenticação e Sessão ([authService.ts](file:///Users/viniciussantiago/Matilha/tyt-users/src/services/authService.ts))
* `login({ email, password })` -> `POST /api/auth/login`. Envia `{ email, senha }`.
* `forgotPassword({ email })` -> `POST /api/auth/forgot-password`.
* `resetPassword({ token, novaSenha })` -> `POST /api/auth/reset-password`.
* `changePassword({ token, email, senhaAtual, novaSenha })` -> `POST /api/auth/change-password`.
* `loadSession()`, `saveSession()`, `clearSession()`: Funções de manipulação síncrona de sessão salvas no `localStorage` sob a chave `"auth"`. O objeto de sessão contém `{ token, userId, user }`.

### 2.2 Dados do Cliente ([clientService.ts](file:///Users/viniciussantiago/Matilha/tyt-users/src/services/clientService.ts))
* `createClientUser(input: FormData | Record)` -> `POST /api/users`. Cria cadastro com `tipo_usuario: "cliente"`.
* `updateClientUser({ token, userId, input })` -> `PUT /api/users/:userId`. Atualiza os dados do cliente. Deve-se enviar o payload como `FormData` (com multipart/form-data) se houver uploads de imagens (como foto ou comprovante).
* `listClients({ token, status })` -> `GET /api/clientes`.

### 2.3 Listagem de Pratos ([dishService.ts](file:///Users/viniciussantiago/Matilha/tyt-users/src/services/dishService.ts))
* `listDishes({ token })` -> `GET /api/pratos`.
* `getDishById({ token, id })` -> `GET /api/pratos/:id`.
* `listHighlightedDishes()` -> `GET /api/public/dishes/highlighted`.
* `normalizeDish(dish)`: Helper para normalizar respostas que possuam chaves variadas vindas da API (ex.: mapeia chaves em português/inglês como `nome_prato` / `nome` / `name`).

### 2.4 Pedidos e Agendamentos ([kitchenOrderService.ts](file:///Users/viniciussantiago/Matilha/tyt-users/src/services/kitchenOrderService.ts))
* `listKitchenOrders({ token, code })` -> `GET /api/kitchen-orders`.
* `getKitchenOrderByCode({ token, code })` -> `GET /api/kitchen-orders/:code`.
* `createKitchenOrder(input)` -> `POST /api/kitchen-orders`.
  * `input` esperado:
    ```typescript
    type CreateKitchenOrderInput = {
      token: string;
      type: string; // 'cozinha_semanal' | 'eventos' | 'servico_especial'
      id_pagamento?: string;
      event_date: string; // ISO date
      event_time: string; // HH:MM
      people_quantity: number;
      city: string;
      address: string;
      number: string;
      complement?: string;
      district: string;
      observations?: string;
      client_request?: string; // Usado em Serviços Especiais (descrição detalhada)
      dishes: Array<{ dish_id: number; quantity: number }>;
    };
    ```
* `cancelKitchenOrder({ token, code })` -> `PUT /api/kitchen-orders/:code/cancel`.

### 2.5 Dicionários de Dados ([lookupService.ts](file:///Users/viniciussantiago/Matilha/tyt-users/src/services/lookupService.ts))
Obtenção de termos normalizados para filtros e cadastros:
* `listDishCategories()` -> `GET /api/pratos-categorias`
* `listCuisineTypes()` -> `GET /api/tipos-cozinha`
* `listCulinaryPreferences()` -> `GET /api/pref-culinarias`
* `listMainIngredients()` -> `GET /api/ingredientes-principais`
* `listThemes()` -> `GET /api/temas`

---

## 3. Regras de Negócio Importantes (Clientes)

* **RN-C01 (Cidade Obrigatória)**: O fluxo de contratação exige a validação prévia de atendimento da cidade informada na Etapa 1.
* **RN-C02 (Antecedência de Evento)**: Ao agendar um serviço na categoria *Eventos*, a data no calendário deve ser selecionada com o mínimo de 7 dias de antecedência a partir da data atual.
* **RN-C03 (Tamanho de Eventos)**: O formulário de eventos só permite agendamento para capacidades entre 5 e 500 pessoas.
* **RN-C04 (Mínimo de Pratos)**: O cliente deve selecionar pelo menos 1 prato na categoria *Cozinha Semanal* e compor o menu correspondente ao nível de serviço em *Eventos* (Clássico ou Banquete).
* **RN-C05 (Serviços Especiais s/ Pagamento Inicial)**: Pedidos de Serviços Especiais são gravados diretamente no status `aguardando_orcamento`. O cliente só efetuará o pagamento na tela `/historico-pagamento` ou `/detalhes-contrato` após um administrador lançar a proposta de orçamento.
* **RN-C06 (Limite de Cartões)**: Cada cliente pode ter no máximo 5 cartões salvos para evitar riscos operacionais de processamento.
* **RN-C07 (Campos Imutáveis)**: O CPF do cliente, uma vez gravado no cadastro, não pode ser alterado através da interface de edição de dados pessoais.
* **RN-C08 (Avaliação Pós-Conclusão)**: A interface de avaliações (dar notas de 1 a 5 e tecer comentários) no detalhe do contrato só fica ativa quando a ordem estiver marcada como `concluido` e liberada pelo fluxo do Chef.
* **RN-C09 (Cancelamento Dinâmico de Pedidos)**: Se o cliente tentar cancelar um pedido que já teve o pagamento processado (status `CONFIRMED`, `COMPLETED` ou com chave `id_pagamento` preenchida), o botão "Cancelar Pedido" redirecionará o cliente para o WhatsApp oficial de suporte (`5511999999999`) com uma mensagem automática contendo o código do serviço e o nome do cliente. Se o pedido não estiver pago, o cancelamento é realizado diretamente pela interface após confirmação.

---

## 4. Instruções e Boas Práticas para o Desenvolvimento

1. **Persistência de Dados**: Sempre que atualizar os dados do cliente na tela de edição pessoal (`/editar-dados`), use o método `saveSession` para atualizar os dados em cache no `localStorage` de forma que o cabeçalho (`AppHeader`) reflita a nova foto de perfil ou nome imediatamente.
2. **Normalização de Atributos**: Devido a possíveis discrepâncias no backend, sempre utilize os helpers de normalização (`normalizeDish`, `getUserPhotoUrl`, `normalizeKitchenOrderStatusLabel`) ao ler atributos de pratos, ordens de serviço e perfil de usuário.
3. **Formulários Dinâmicos**: O componente `Contratacao.tsx` manipula um estado complexo de progresso e validações. Garanta que transições entre etapas não resetem o estado das escolhas anteriores.
4. **Design System**: Use a paleta definida no CSS: `bg-primary` para botões principais do cliente, links e barra superior do cabeçalho em verde TYT (`#004B2A`) e tons secundários limpos. O layout deve respeitar os componentes Shadcn instalados em `src/components/ui`.
5. **Rodapé Unificado em Todas as Telas**: Todas as páginas do aplicativo devem conter o componente `<Footer />` fixado ao final da página utilizando a estrutura de layout flexível (`min-h-screen flex flex-col` com o conteúdo principal em `flex-1`).
