import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { ArrowLeft, Camera, User, MapPin, FileImage, Edit2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { AppHeader } from "@/components/AppHeader";
import mariaProfile from "@/assets/maria-profile.jpg";
const EditarDadosPessoais = () => {
  const navigate = useNavigate();
  const {
    toast
  } = useToast();
  const [formData, setFormData] = useState({
    foto: "",
    nome: "Maria Santos",
    dataNascimento: "1985-03-15",
    email: "maria@email.com",
    whatsapp: "(11) 99999-9999",
    cep: "01234-567",
    endereco: "Rua das Flores",
    numero: "123",
    complemento: "Apto 45",
    bairro: "Centro",
    cidade: "São Paulo",
    estado: "SP",
    comprovanteEndereco: null as File | null
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: ""
      }));
    }
  };
  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    if (!formData.nome.trim()) newErrors.nome = "Nome é obrigatório";
    if (!formData.email.trim()) newErrors.email = "E-mail é obrigatório";
    if (!formData.whatsapp.trim()) newErrors.whatsapp = "WhatsApp é obrigatório";
    if (!formData.endereco.trim()) newErrors.endereco = "Endereço é obrigatório";
    if (!formData.cep.trim()) newErrors.cep = "CEP é obrigatório";
    if (formData.email && !formData.email.includes("@")) {
      newErrors.email = "E-mail inválido";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  const handleSave = () => {
    if (validateForm()) {
      toast({
        title: "Dados salvos com sucesso!",
        description: "Suas informações pessoais foram atualizadas."
      });
      navigate("/dashboard-cliente");
    }
  };
  const handleCancel = () => {
    navigate("/dashboard-cliente");
  };
  return <div className="min-h-screen bg-white pt-20">
      <AppHeader />
      
      <div className="container mx-auto px-4 py-6">
        {/* Título da página */}
        <div className="flex items-center gap-4 mb-6">
          <Button variant="ghost" size="icon" onClick={() => navigate("/dashboard-cliente")}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-2xl font-bold">Minha Conta</h1>
        </div>

        <div className="max-w-2xl mx-auto space-y-6">
          {/* Foto de Perfil */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                Foto do Perfil
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col items-center gap-4">
                <Avatar className="h-32 w-32">
                  <AvatarImage src={mariaProfile} />
                  <AvatarFallback>MS</AvatarFallback>
                </Avatar>
                <Button variant="outline" size="sm">
                  <Camera className="h-4 w-4 mr-2" />
                  Alterar Foto
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Dados Pessoais */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                Dados Pessoais
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="nome">Nome Completo *</Label>
                  <Input id="nome" value={formData.nome} onChange={e => handleInputChange("nome", e.target.value)} className={errors.nome ? "border-red-500" : ""} />
                  {errors.nome && <p className="text-sm text-red-500">{errors.nome}</p>}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="dataNascimento">Data de Nascimento</Label>
                  <Input id="dataNascimento" type="date" value={formData.dataNascimento} onChange={e => handleInputChange("dataNascimento", e.target.value)} />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">E-mail *</Label>
                  <Input id="email" type="email" value={formData.email} onChange={e => handleInputChange("email", e.target.value)} className={errors.email ? "border-red-500" : ""} />
                  {errors.email && <p className="text-sm text-red-500">{errors.email}</p>}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="whatsapp">WhatsApp *</Label>
                  <Input id="whatsapp" value={formData.whatsapp} onChange={e => handleInputChange("whatsapp", e.target.value)} className={errors.whatsapp ? "border-red-500" : ""} inputMode="tel" />
                  {errors.whatsapp && <p className="text-sm text-red-500">{errors.whatsapp}</p>}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Endereço */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MapPin className="h-5 w-5" />
                Endereço
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="cep">CEP *</Label>
                  <Input id="cep" value={formData.cep} onChange={e => handleInputChange("cep", e.target.value)} className={errors.cep ? "border-red-500" : ""} />
                  {errors.cep && <p className="text-sm text-red-500">{errors.cep}</p>}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="endereco">Endereço *</Label>
                  <Input id="endereco" value={formData.endereco} onChange={e => handleInputChange("endereco", e.target.value)} className={errors.endereco ? "border-red-500" : ""} />
                  {errors.endereco && <p className="text-sm text-red-500">{errors.endereco}</p>}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="numero">Número</Label>
                  <Input id="numero" value={formData.numero} onChange={e => handleInputChange("numero", e.target.value)} />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="complemento">Complemento</Label>
                  <Input id="complemento" value={formData.complemento} onChange={e => handleInputChange("complemento", e.target.value)} />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="bairro">Bairro</Label>
                  <Input id="bairro" value={formData.bairro} onChange={e => handleInputChange("bairro", e.target.value)} />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="cidade">Cidade</Label>
                  <Input id="cidade" value={formData.cidade} onChange={e => handleInputChange("cidade", e.target.value)} />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="estado">Estado</Label>
                  <Input id="estado" value={formData.estado} onChange={e => handleInputChange("estado", e.target.value)} />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Comprovante de Endereço */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileImage className="h-5 w-5" />
                Comprovante de Endereço
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Comprovante Atual */}
              <div className="bg-gray-50 p-4 rounded-lg border">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                      <FileImage className="h-6 w-6 text-blue-600" />
                    </div>
                    <div>
                      <p className="font-medium">conta_luz_atual.pdf</p>
                      <p className="text-sm text-gray-500">Enviado em 15/01/2024</p>
                    </div>
                  </div>
                  <Button variant="outline" size="sm">
                    <Edit2 className="h-4 w-4 mr-2" />
                    Trocar
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Botões de Ação */}
          <div className="flex flex-col sm:flex-row gap-3 pt-6">
            <Button variant="outline" onClick={handleCancel} className="flex-1">
              Cancelar
            </Button>
            <Button onClick={handleSave} className="flex-1">
              Salvar Alterações
            </Button>
          </div>
        </div>
      </div>
    </div>;
};
export default EditarDadosPessoais;