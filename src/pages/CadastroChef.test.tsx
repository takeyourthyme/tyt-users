import { afterEach, describe, expect, it, vi } from "vitest";
import { cleanup, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";
import CadastroChef from "./CadastroChef";

vi.mock("@/hooks/useConfiguracaoGeral", () => ({ useConfiguracaoGeral: () => ({ data: null }) }));
vi.mock("@/services/chefService", () => ({ createChefUser: vi.fn() }));

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
});

const reachAddressStep = async () => {
  const user = userEvent.setup();
  render(<MemoryRouter><CadastroChef /></MemoryRouter>);
  await user.type(screen.getByLabelText("Nome completo"), "Chef Teste");
  await user.type(screen.getByLabelText("CPF"), "52998224725");
  await user.type(screen.getByLabelText("Data de nascimento"), "15051990");
  await user.type(screen.getByLabelText("WhatsApp"), "11999999999");
  await user.type(screen.getByLabelText("E-mail"), "chef@example.test");
  await user.type(screen.getByLabelText("Senha"), "senha-segura");
  await user.click(screen.getByRole("button", { name: "Continuar" }));
  await screen.findByText("Sua localização");
  return user;
};

describe("CadastroChef: CEP e transporte", () => {
  it("sincroniza ViaCEP com os valores exibidos e remove erros antigos", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ logradouro: "Praça da Sé", bairro: "Sé", localidade: "São Paulo", uf: "SP" }),
    }));
    const user = await reachAddressStep();
    await user.type(screen.getByLabelText("CEP"), "01001000");
    await waitFor(() => expect(screen.getByLabelText("Endereço")).toHaveValue("Praça da Sé"));
    expect(screen.getByLabelText("Bairro")).toHaveValue("Sé");
    expect(screen.getByLabelText("Cidade")).toHaveValue("São Paulo");
    expect(screen.getByLabelText("UF")).toHaveValue("SP");
    expect(screen.queryByText("Cidade é obrigatória")).not.toBeInTheDocument();
  });

  it("informa CEP inexistente e mantém endereço editável", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue({ ok: true, json: async () => ({ erro: true }) }));
    const user = await reachAddressStep();
    await user.type(screen.getByLabelText("CEP"), "99999999");
    expect(await screen.findByText(/CEP não encontrado/)).toBeInTheDocument();
    await user.type(screen.getByLabelText("Endereço"), "Rua manual");
    expect(screen.getByLabelText("Endereço")).toHaveValue("Rua manual");
  });

  it("mantém o select de transporte controlado pelo form", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue({ ok: true, json: async () => ({ erro: true }) }));
    const user = await reachAddressStep();
    await user.click(screen.getByRole("combobox", { name: "Tipo de transporte" }));
    await user.click(await screen.findByRole("option", { name: "Público" }));
    expect(screen.getByRole("combobox", { name: "Tipo de transporte" })).toHaveTextContent("Público");
  });
});
