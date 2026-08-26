import { expect, test, type Page } from "@playwright/test";

const fillRegistration = async (page: Page) => {
  await page.goto("/chef/cadastro");
  await page.getByLabel("Nome completo").fill("Chef E2E");
  await page.getByLabel("CPF").fill("529.982.247-25");
  await page.getByLabel("Data de nascimento").fill("15/05/1990");
  await page.getByLabel("WhatsApp").fill("+55 (11) 99999-9999");
  await page.getByLabel("E-mail").fill("chef-e2e@example.test");
  await page.getByLabel("Senha").fill("senha-segura");
  await page.getByRole("button", { name: "Continuar" }).click();

  await page.getByLabel("CEP").fill("01001-000");
  await expect(page.getByLabel("Endereço")).toHaveValue("Praça da Sé");
  await page.getByLabel("Número").fill("1");
  await page.getByLabel("Tipo de transporte").click();
  await page.getByRole("option", { name: "Público" }).click();
  await page.getByRole("button", { name: "Continuar" }).click();

  await page.getByText("Brasileira", { exact: true }).click();
  await page.getByLabel("Escola de Formação / Origem de conhecimento").fill("Autodidata");
  await page.getByLabel(/Nos fale um pouco/).fill("Experiência profissional em cozinha brasileira.");
  const monday = page.locator("tr").filter({ hasText: "Segunda-feira" });
  await monday.getByRole("checkbox").nth(0).click();
  await monday.getByRole("checkbox").nth(1).click();
  await page.getByText("Meal Prep", { exact: true }).click();
  await page.getByRole("checkbox", { name: /Li e aceito os/ }).click();
};

test.beforeEach(async ({ page }) => {
  await page.route("https://viacep.com.br/**", (route) => route.fulfill({
    contentType: "application/json",
    body: JSON.stringify({ logradouro: "Praça da Sé", bairro: "Sé", localidade: "São Paulo", uf: "SP" }),
  }));
  await page.route("**/api/configuracao-geral", (route) => route.fulfill({ contentType: "application/json", body: "{}" }));
});

test("envia todas as coleções e só redireciona após 201", async ({ page }) => {
  let requestBody = "";
  await page.route("**/api/users/chef", async (route) => {
    requestBody = route.request().postData() || "";
    await route.fulfill({ status: 201, contentType: "application/json", body: JSON.stringify({ success: true }) });
  });
  await fillRegistration(page);
  await page.getByRole("button", { name: "Finalizar cadastro" }).click();
  await expect(page).toHaveURL(/\/chef\/cadastro\/status$/);
  expect(requestBody).toContain('name="idiomas[]"');
  expect(requestBody).toContain('name="especialidades[]"');
  expect(requestBody).toContain('name="disponivel_para[]"');
  expect(requestBody).toContain('name="disponibilidade[0][dia_semana]"');
});

test("preserva dados após falha, permite retry e não cria overflow horizontal", async ({ page }) => {
  let attempts = 0;
  await page.route("**/api/users/chef", (route) => {
    attempts += 1;
    return attempts === 1
      ? route.fulfill({ status: 500, contentType: "application/json", body: JSON.stringify({ code: "CHEF_REGISTRATION_INTERNAL_ERROR", message: "Falha temporária" }) })
      : route.fulfill({ status: 201, contentType: "application/json", body: JSON.stringify({ success: true }) });
  });
  await fillRegistration(page);
  await page.getByRole("button", { name: "Finalizar cadastro" }).click();
  await expect(page).toHaveURL(/\/chef\/cadastro$/);
  await expect(page.getByLabel(/Nos fale um pouco/)).toHaveValue("Experiência profissional em cozinha brasileira.");
  const overflowing = await page.evaluate(() => [...document.querySelectorAll<HTMLElement>("body *")]
    .filter((element) => element.getBoundingClientRect().right > document.documentElement.clientWidth + 1)
    .map((element) => `${element.tagName}.${element.className}`)
    .slice(0, 10));
  expect(overflowing).toEqual([]);
  await page.getByRole("button", { name: "Finalizar cadastro" }).click();
  await expect(page).toHaveURL(/\/chef\/cadastro\/status$/);
  expect(attempts).toBe(2);
});

test("remove o erro de disponibilidade assim que um dia válido é selecionado", async ({ page }) => {
  await page.route("**/api/users/chef", (route) => route.fulfill({
    status: 201,
    contentType: "application/json",
    body: JSON.stringify({ success: true }),
  }));
  await fillRegistration(page);
  const mondayEnabled = page.getByRole("checkbox", { name: "Segunda-feira" });
  await mondayEnabled.click();
  await page.getByRole("button", { name: "Finalizar cadastro" }).click();
  await expect(page.getByText("Selecione pelo menos um dia de disponibilidade")).toBeVisible();
  await mondayEnabled.click();
  await expect(page.getByText("Selecione pelo menos um dia de disponibilidade")).toBeHidden();
  await page.getByRole("button", { name: "Finalizar cadastro" }).click();
  await expect(page).toHaveURL(/\/chef\/cadastro\/status$/);
});
