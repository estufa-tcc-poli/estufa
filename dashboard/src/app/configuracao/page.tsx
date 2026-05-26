import { WireFormField, WirePageHeader } from "@/components/wireframe";

export default function ConfiguracaoPage() {
  return (
    <>
      <WirePageHeader
        title="Configuração"
        subtitle="Parâmetros do sistema e limites dos sensores"
      />

      <form className="space-y-6" aria-label="Formulário de parâmetros">
        <fieldset className="space-y-4 border-2 border-neutral-800 p-4">
          <legend className="px-2 text-sm font-bold">
            Limites de alerta
          </legend>
          <WireFormField label="Temp. mínima (°C)" placeholder="18" />
          <WireFormField label="Temp. máxima (°C)" placeholder="30" />
          <WireFormField label="Umidade máxima (%)" placeholder="80" />
        </fieldset>

        <fieldset className="space-y-4 border-2 border-neutral-800 p-4">
          <legend className="px-2 text-sm font-bold">Comunicação</legend>
          <WireFormField
            label="Broker MQTT"
            placeholder="mqtt://192.168.1.10:1883"
          />
          <WireFormField label="Tópico base" placeholder="estufa/sensor/" />
          <WireFormField
            label="Intervalo de leitura (s)"
            placeholder="60"
            type="number"
          />
        </fieldset>

        <fieldset className="space-y-4 border-2 border-neutral-800 p-4">
          <legend className="px-2 text-sm font-bold">Geral</legend>
          <WireFormField
            label="Nome do dispositivo"
            placeholder="Estufa-01"
          />
          <WireFormField
            label="Fuso horário"
            placeholder="America/Sao_Paulo"
            type="select"
          />
        </fieldset>

        <div className="flex gap-3 pt-2">
          <div className="border-2 border-neutral-800 bg-neutral-800 px-6 py-2 text-sm font-medium text-white">
            Salvar
          </div>
          <div className="border-2 border-neutral-800 px-6 py-2 text-sm">
            Cancelar
          </div>
        </div>
      </form>
    </>
  );
}
