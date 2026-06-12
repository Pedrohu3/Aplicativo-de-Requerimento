const inputClass =
  'w-full rounded-lg border border-slate-300 px-4 py-2.5 text-sm outline-none transition focus:border-primary-500 focus:ring-2 focus:ring-primary-100'

export default function DynamicForm({ campos, valores, onChange, readOnly = false }) {
  function handleChange(campoId, value) {
    onChange({ ...valores, [String(campoId)]: value })
  }

  function handleCheckbox(campoId, option, checked) {
    const key = String(campoId)
    const current = valores[key] ? valores[key].split('||') : []
    const next = checked
      ? [...new Set([...current, option])]
      : current.filter((item) => item !== option)
    handleChange(campoId, next.join('||'))
  }

  return (
    <div className="space-y-5">
      {campos.map((campo) => (
        <div key={campo.id ?? campo.ordem}>
          <label className="mb-1.5 block text-sm font-medium text-slate-700">
            {campo.label}
            {campo.obrigatorio && <span className="text-red-500"> *</span>}
          </label>

          {campo.tipo === 'TEXTO' && (
            <input
              type="text"
              disabled={readOnly}
              value={valores[String(campo.id)] ?? ''}
              placeholder={campo.placeholder}
              onChange={(e) => handleChange(campo.id, e.target.value)}
              className={inputClass}
            />
          )}

          {campo.tipo === 'TEXTO_LONGO' && (
            <textarea
              rows={4}
              disabled={readOnly}
              value={valores[String(campo.id)] ?? ''}
              placeholder={campo.placeholder}
              onChange={(e) => handleChange(campo.id, e.target.value)}
              className={inputClass}
            />
          )}

          {campo.tipo === 'NUMERO' && (
            <input
              type="number"
              disabled={readOnly}
              value={valores[String(campo.id)] ?? ''}
              onChange={(e) => handleChange(campo.id, e.target.value)}
              className={inputClass}
            />
          )}

          {campo.tipo === 'DATA' && (
            <input
              type="date"
              disabled={readOnly}
              value={valores[String(campo.id)] ?? ''}
              onChange={(e) => handleChange(campo.id, e.target.value)}
              className={inputClass}
            />
          )}

          {campo.tipo === 'SELECAO' && (
            <select
              disabled={readOnly}
              value={valores[String(campo.id)] ?? ''}
              onChange={(e) => handleChange(campo.id, e.target.value)}
              className={inputClass}
            >
              <option value="">Selecione...</option>
              {campo.opcoes?.map((opcao) => (
                <option key={opcao} value={opcao}>
                  {opcao}
                </option>
              ))}
            </select>
          )}

          {campo.tipo === 'OPCAO_UNICA' && (
            <div className="space-y-2">
              {campo.opcoes?.map((opcao) => (
                <label key={opcao} className="flex items-center gap-2 text-sm text-slate-700">
                  <input
                    type="radio"
                    disabled={readOnly}
                    name={`campo-${campo.id}`}
                    checked={valores[String(campo.id)] === opcao}
                    onChange={() => handleChange(campo.id, opcao)}
                    className="text-primary-600"
                  />
                  {opcao}
                </label>
              ))}
            </div>
          )}

          {campo.tipo === 'CHECKBOX' && (
            <div className="space-y-2">
              {campo.opcoes?.map((opcao) => {
                const selected = (valores[String(campo.id)] ?? '').split('||').filter(Boolean)
                return (
                  <label key={opcao} className="flex items-center gap-2 text-sm text-slate-700">
                    <input
                      type="checkbox"
                      disabled={readOnly}
                      checked={selected.includes(opcao)}
                      onChange={(e) => handleCheckbox(campo.id, opcao, e.target.checked)}
                      className="rounded text-primary-600"
                    />
                    {opcao}
                  </label>
                )
              })}
            </div>
          )}
        </div>
      ))}
    </div>
  )
}

export function formatValor(campo, valor) {
  if (!valor) return '-'
  if (campo.tipo === 'CHECKBOX') {
    return valor.split('||').filter(Boolean).join(', ')
  }
  return valor
}
