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

  function handleFile(campoId, file) {
    if (!file) return
    const reader = new FileReader()
    reader.onload = (e) => {
      handleChange(campoId, `${file.name}||${e.target.result}`)
    }
    reader.readAsDataURL(file)
  }

  return (
    <div className="space-y-5">
      {campos.map((campo) => (
        <div key={campo.id ?? campo.ordem}>
          <label className="mb-1.5 flex items-center gap-1.5 text-sm font-medium text-slate-700">
            {campo.label}
            {campo.obrigatorio && <span className="text-red-500">*</span>}
            {campo.fixo && (
              <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs font-normal text-slate-400">
                automático
              </span>
            )}
          </label>

          {campo.tipo === 'TEXTO' && (
            <input
              type="text"
              readOnly={campo.fixo || readOnly}
              value={valores[String(campo.id)] ?? ''}
              placeholder={campo.placeholder}
              onChange={campo.fixo || readOnly ? undefined : (e) => handleChange(campo.id, e.target.value)}
              className={`${inputClass} ${campo.fixo ? 'cursor-default bg-slate-50 text-slate-600 focus:border-slate-300 focus:ring-0' : ''}`}
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

          {campo.tipo === 'ANEXO' && (() => {
            const stored = valores[String(campo.id)] ?? ''
            const sepIdx = stored.indexOf('||')
            const filename = sepIdx >= 0 ? stored.slice(0, sepIdx) : ''
            const dataUrl = sepIdx >= 0 ? stored.slice(sepIdx + 2) : ''
            return readOnly ? (
              dataUrl ? (
                <a
                  href={dataUrl}
                  download={filename}
                  className="inline-flex items-center gap-2 rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
                >
                  <svg className="h-4 w-4 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v2a2 2 0 002 2h12a2 2 0 002-2v-2M7 10l5 5 5-5M12 15V3" />
                  </svg>
                  {filename || 'Baixar anexo'}
                </a>
              ) : (
                <span className="text-sm text-slate-400">Nenhum arquivo anexado</span>
              )
            ) : (
              <div className="space-y-2">
                <input
                  type="file"
                  onChange={(e) => handleFile(campo.id, e.target.files?.[0])}
                  className="block w-full text-sm text-slate-500 file:mr-4 file:rounded-lg file:border-0 file:bg-primary-50 file:px-4 file:py-2 file:text-sm file:font-medium file:text-primary-700 hover:file:bg-primary-100"
                />
                {filename && (
                  <p className="text-xs text-slate-500">Arquivo selecionado: <span className="font-medium">{filename}</span></p>
                )}
              </div>
            )
          })()}
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
  if (campo.tipo === 'ANEXO') {
    const sepIdx = valor.indexOf('||')
    return sepIdx >= 0 ? valor.slice(0, sepIdx) : valor
  }
  return valor
}
