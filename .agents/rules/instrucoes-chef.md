---
trigger: always_on
---

# Instruções de Desenvolvimento: Perfil do Chef

Este documento contém o guia completo de comportamento, regras de negócio, rotas, componentes e mapeamento de APIs para o fluxo do **Chef** na plataforma **Take Your Time (TYT)**. Ele serve como instrução detalhada de contexto para qualquer IA que venha a trabalhar neste projeto.

---

## 1. Mapeamento de Rotas e Telas do Chef

Todas as páginas do chef estão localizadas sob `src/pages/` e configuradas no roteador principal (`src/App.tsx`).

### 1.1 Telas de Cadastro e Acesso (Não Autenticadas)
* **`/chef/entrar` ([LoginChef.tsx](file:///Users/viniciussantiago/Matilha/tyt-users/src/pages/LoginChef.tsx))**: Autenticação de chefs.
  * Validações: Formato de e-mail e senha (mínimo de 6 caracteres).
  * Redireciona para `/chef/inicio` em caso de sucesso.
* **`/chef/cadastro` ([CadastroChef.tsx](file:///Users/viniciussantiago/Matilha/tyt-users/src/pages/CadastroChef.tsx))**: Cadastro profissional completo.
  * Requer dados pessoais (Nome, CPF, Data de Nascimento, WhatsApp, E-mail, CEP e Endereço completo) e profissionais (Especialidades, Idiomas, Formação escolar, Biografia/Sobre, Tipo de Transporte, Disponibilidade semanal e Upload de foto).
  * Validações (Zod): CPF e CEP válidos, WhatsApp no formato `+55 (XX) XXXXX-XXXX`, data de nascimento no formato `DD/MM/AAAA`, biografia contendo de 10 a 500 caracteres, foto de perfil obrigatória. Se marcar deslocamento como ativo (`canTravel`), o preenchimento do tipo de transporte torna-se obrigatório.
  * Em caso de sucesso, o cadastro é criado no status `Pendente` e o usuário é redirecionado para `/chef/cadastro/status`.
* **`/chef/cadastro/status` ([CadastroChefSucesso.tsx](file:///Users/viniciussantiago/Matilha/tyt-users/src/pages/CadastroChefSucesso.tsx))**: Tela informativa avisando que o cadastro está em auditoria (prazo de 48h a 72h). Bloqueia o login direto até aprovação.

### 1.2 Telas Autenticadas do Chef
* **`/chef/inicio` ([DashboardChef.tsx](file:///Users/viniciussantiago/Matilha/tyt-users/src/pages/DashboardChef.tsx))**: Painel principal do Chef logado. Exibe receita mensal líquida acumulada, total de serviços realizados, calendário resumido de serviços da semana, avaliações dos clientes e atalhos de gerenciamento.
* **`/chef/agenda` ([AgendaChef.tsx](file:///Users/viniciussantiago/Matilha/tyt-users/src/pages/AgendaChef.tsx))**: Agenda visual do chef em formato de calendário (mensal/semanal/diário) que integra todos os seus compromissos e permite a verificação rápida de datas bloqueadas ou ativas.
* **`/chef/servicos` ([ServicosAtivos.tsx](file:///Users/viniciussantiago/Matilha/tyt-users/src/pages/ServicosAtivos.tsx))**: Lista de serviços de cozinha semanal e eventos atualmente designados ao chef, organizados por proximidade de data.
* **`/chef/servicos/:id` ([ServicoDetalhes.tsx](file:///Users/viniciussantiago/Matilha/tyt-users/src/pages/ServicoDetalhes.tsx))**: Detalhamento do serviço. Exibe dados do cliente, endereço exato de entrega/atendimento, horário combinado, cardápio solicitado e observações/restrições. Permite o contato direto com o cliente (após o aceite do serviço).
* **`/chef/ordem/:id` ([OrdemDeCozinha.tsx](file:///Users/viniciussantiago/Matilha/tyt-users/src/pages/OrdemDeCozinha.tsx))**: Ficha técnica e instruções de preparo do menu contratado. Contém a lista de compras consolidada dos ingredientes que o chef pode marcar como adquiridos/em mãos, facilitando a organização logística.
* **`/chef/ordem/:id/pendente` ([OrdemPendente.tsx](file:///Users/viniciussantiago/Matilha/tyt-users/src/pages/OrdemPendente.tsx))**: Interface de controle para ordens de cozinha geradas automaticamente que ainda aguardam validação ou conclusão por parte do chef.
* **`/chef/pagamentos` ([MeusPagamentos.tsx](file:///Users/viniciussantiago/Matilha/tyt-users/src/pages/MeusPagamentos.tsx))**: Extrato financeiro contendo valores brutos, percentual da comissão da plataforma deduzido, valor líquido e a data prevista de depósito bancário para cada serviço finalizado.
* **`/chef/meu-perfil` ([EditarCadastroChef.tsx](file:///Users/viniciussantiago/Matilha/tyt-users/src/pages/EditarCadastroChef.tsx))**: Área de atualização do perfil do chef. Permite modificar a biografia, especialidades, idiomas falados, tipos de transporte, foto de perfil, e a grade semanal de horários de disponibilidade (Manhã, Tarde e Noite para cada dia da semana). Possui formulário para alteração de senha de acesso.

---

## 2. APIs e Integrações (Serviços Usados pelo Chef)

O frontend interage com a API RESTful através dos seguintes serviços:

### 2.1 Autenticação e Alteração de Credenciais ([authService.ts](file:///Users/viniciussantiago/Matilha/tyt-users/src/services/authService.ts))
* `login({ email, password })` -> `POST /api/auth/login`.
* `changePassword({ token, email, senhaAtual, novaSenha })` -> `POST /api/auth/change-password`.

### 2.2 Dados Profissionais e Cadastro ([chefService.ts](file:///Users/viniciussantiago/Matilha/tyt-users/src/services/chefService.ts))
* `createChefUser(input: FormData | Record)` -> `POST /api/users`. Cria cadastro com `tipo_usuario: "chef"`.
* `updateChefUser({ token, userId, input })` -> `PUT /api/users/${userId}`. Atualiza dados profissionais e pessoais. Envia como `FormData` para processar arquivos enviados de foto ou certificados.
* `listChefs({ token, status })` -> `GET /api/chefs`.
* `updateChefStatus({ token, userId, approved, status })` -> `PUT /api/chefs/update-status`.

### 2.3 Ordens e Cronograma de Preparo ([kitchenOrderService.ts](file:///Users/viniciussantiago/Matilha/tyt-users/src/services/kitchenOrderService.ts))
* `listKitchenOrders({ token, code })` -> `GET /api/kitchen-orders`.
* `getKitchenOrderByCode({ token, code })` -> `GET /api/kitchen-orders/${code}`.
* `updateKitchenOrderStatus({ token, id, status })` -> `PUT /api/kitchen-orders/${id}/status`.
  * Estados possíveis (`status`): `"pendente"` (atribuído, aguardando aceite), `"confirmado"` (aceito pelo chef), `"em_preparacao"` (chef iniciou a execução), `"concluido"` (finalizado).
* `submitSpecialServiceProposal({ token, id, items })` -> `PUT /api/kitchen-orders/${id}/special-service-proposal`.
  * Utilizado para enviar o detalhamento de custos e proposta de itens para Serviços Especiais sob consulta. Envia `{ items: Array<{ description: string, price: number }> }`.
* `cancelKitchenOrder({ token, code })` -> `PUT /api/kitchen-orders/${code}/cancel`.

### 2.4 Dados do Usuário ([userService.ts](file:///Users/viniciussantiago/Matilha/tyt-users/src/services/userService.ts))
* `getUserById({ token, userId })` -> `GET /api/users/${userId}`. Retorna os dados agregados do perfil e do relacionamento do Chef (`usuario_chef`).

---

## 3. Regras de Negócio Importantes (Chefs)

* **RN-CH01 (Auditoria e Análise)**: O chef recém-cadastrado entra em estado `"Pendente"`. Seus dados de acesso e certificações passam pelo backoffice administrativo. O login só é permitido após aprovação no backoffice (mudança para status `"Ativo"` / `"Concluído"` e `cadastro_aprovado = true`). Tentativas de login antes disso retornam erro `403` com o código `CHEF_REGISTRATION_PENDING` e a etapa atual do processo, redirecionando o usuário para a página `/cadastro-chef-sucesso` que exibe de forma dinâmica as etapas concluídas e pendentes.
* **RN-CH02 (Grade de Disponibilidade)**: A grade semanal configurada na tela de edição (`/editar-cadastro-chef`) determina as opções exibidas para os clientes no momento da contratação semanal de refeições. Se o chef desmarcar um dia/período, novos contratos de clientes para aquele horário não serão designados a ele.
* **RN-CH03 (Aceite de Ordem)**: Ao receber uma notificação de serviço, o chef tem a opção de Aceitar ou Recusar a ordem de cozinha. Caso recuse, deve preencher uma justificativa que retorna para revisão do administrador do backoffice para redistribuição.
* **RN-CH04 (Restrição de Informações)**: Em respeito à LGPD e segurança de dados, o número completo de WhatsApp/Telefone e o endereço detalhado do cliente ficam ocultos na listagem até que o chef clique em "Aceitar Ordem".
* **RN-CH05 (Geração Automática de Ordens)**: Para a modalidade de *Cozinha Semanal*, as ordens de cozinha (`kitchen_orders`) são geradas de forma automatizada pelo sistema com 48 horas de antecedência da data agendada de atendimento, alertando o chef para a necessidade de compras e preparação.
* **RN-CH06 (Lista de Compras Digital)**: O chef é instruído a acompanhar e validar os ingredientes diretamente na tela de `/ordem-de-cozinha/:id`, dando checklist à medida que os obtém para certificar o cumprimento das especificações de porções e restrições.
* **RN-CH07 (Prazo de Recebimento/Repasse)**: Após o chef alterar o status da ordem para `"concluido"`, o sistema calcula e agenda o repasse líquido (`chef_payouts`) com base na porcentagem de comissão estabelecida em `system_settings` (geralmente compensado em até 48h após a conclusão do serviço).

---

## 4. Instruções e Boas Práticas para o Desenvolvimento

1. **Uso de FormData**: No cadastro (`CadastroChef.tsx`) e na edição de dados (`EditarCadastroChef.tsx`), muitos dados são enviados como arrays (ex.: `idiomas[]`, `especialidades[]`, `disponivel_para[]`). Lembre-se de anexá-los usando o método `append` de maneira correta no `FormData` para garantir que o array seja enviado serializado em vez de sobrescrever a chave.
2. **Máscaras e Limpeza**: As inputs de CPF, CEP, WhatsApp e Data de Nascimento devem possuir máscaras visuais no frontend (`react-input-mask`), mas seus caracteres não numéricos devem ser limpos (`replace(/\D/g, "")`) antes de alimentar os parâmetros que trafegam nas APIs (exceto onde o backend aceitar o padrão formatado).
3. **Controle de Câmera**: Na captura de fotos profissionais diretamente pela câmera do dispositivo em `CadastroChef.tsx` e `EditarCadastroChef.tsx`, certifique-se de fechar todos os tracks de mídia (`stream.getTracks().forEach(track => track.stop())`) ao desativar ou salvar a foto para evitar vazamentos de memória e manter o indicador de gravação do browser ativo indevidamente.
4. **Paleta de Cores do Chef**: Por consistência de marca, componentes do fluxo de chef e atalhos de ações profissionais utilizam cores puxadas para tons de amarelo/laranja e cinza escuro (baseado em tons de amarelo TYT: `bg-tyt-yellow-500` / `#F5A623`), diferenciando visualmente as telas do painel do chef em relação ao cliente (que puxa tons azuis).
