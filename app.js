import React from 'react';

function FormularioAgendamento({ onNovaConsulta }) {
  const [formData, setFormData] = React.useState({
    nome: '',
    email: '',
    telefone: '',
    especialidade: '',
    data: '',
    hora: '',
    sintomas: '',
  });
  const [erros, setErros] = React.useState({});
  const [avisoTelefone, setAvisoTelefone] = React.useState('');
  const nomeInputRef = React.useRef(null);

  /* -------- Limpar telefone -------- */
  function limparTelefone(telefone) {
    return telefone.replace(/\D/g, '');
  }

  /* -------- Máscara de telefone -------- */
  function aplicarMascaraTelefone(value) {
    value = limparTelefone(value).slice(0, 11);
    if (!value) return '';
    if (value.length <= 2) return `(${value}`;
    if (value.length <= 6) return value.replace(/^(\d{2})(\d{0,4})/, '($1) $2');
    return value.replace(/^(\d{2})(\d{5})(\d{0,4})/, '($1) $2-$3');
  }

  /* -------- Validações -------- */
  function validarEmail(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  }

  function validarTelefone(telefone) {
    const numeros = limparTelefone(telefone);
    if (!(numeros.length === 10 || numeros.length === 11)) return false;

    if (numeros.length === 11 && numeros[2] !== '9') {
      setAvisoTelefone(
        'Atenção: número de celular com 11 dígitos geralmente deve ter 9 na posição indicada.'
      );
    } else {
      setAvisoTelefone('');
    }

    return true;
  }

  function validarData(data) {
    if (!data) return false;
    const [ano, mes, dia] = data.split('-').map(Number);
    const dataSelecionada = new Date(ano, mes - 1, dia);
    const hoje = new Date();
    hoje.setHours(0, 0, 0, 0);
    return dataSelecionada >= hoje;
  }

  function validarHora(hora) {
    if (!hora) return false;
    const [h, m] = hora.split(':').map(Number);
    if (isNaN(h) || isNaN(m)) return false;
    return h >= 8 && (h < 18 || (h === 18 && m === 0));
  }

  function validarFormulario() {
    const newErros = {};

    if (!formData.nome.trim()) {
      newErros.nome = 'Nome é obrigatório.';
    }

    if (!validarEmail(formData.email)) {
      newErros.email = 'E-mail inválido.';
    }

    if (!validarTelefone(formData.telefone)) {
      newErros.telefone = 'Telefone inválido. Ex: (99) 99999-9999';
    }

    if (!formData.especialidade) {
      newErros.especialidade = 'Selecione uma especialidade.';
    }

    if (!validarData(formData.data)) {
      newErros.data = 'Data inválida ou passada.';
    }

    if (!validarHora(formData.hora)) {
      newErros.hora = 'Hora fora do expediente (08:00 - 18:00).';
    }

    if (!formData.sintomas.trim()) {
      newErros.sintomas = 'Descrição dos sintomas é obrigatória.';
    }

    setErros(newErros);

    return Object.keys(newErros).length === 0;
  }

  /* -------- Handlers -------- */
  function handleChange(e) {
    let { name, value } = e.target;
    if (name === 'telefone') value = aplicarMascaraTelefone(value);
    setFormData({ ...formData, [name]: value });

    setErros((prev) => ({ ...prev, [name]: undefined }));
    if (name === 'telefone') setAvisoTelefone('');
  }

  function handleSubmit(e) {
    e.preventDefault();

    if (!validarFormulario()) return;

    onNovaConsulta(formData);
    alert('Consulta agendada com sucesso!');

    setFormData({
      nome: '',
      email: '',
      telefone: '',
      especialidade: '',
      data: '',
      hora: '',
      sintomas: '',
    });
    setErros({});
    setAvisoTelefone('');
    nomeInputRef.current?.focus();
  }

  return (
    <section id="agendamento" style={{ maxWidth: 800, margin: '2rem auto' }}>
      <h2>Agende sua Consulta</h2>
      <form onSubmit={handleSubmit} noValidate>
        {[
          { label: 'Nome completo', type: 'text', name: 'nome', placeholder: 'Seu nome completo' },
          { label: 'E-mail', type: 'email', name: 'email', placeholder: 'Seu e-mail' },
          { label: 'Telefone', type: 'text', name: 'telefone', placeholder: '(99) 99999-9999', maxLength: 15 },
          { label: 'Data da consulta', type: 'date', name: 'data' },
          { label: 'Hora da consulta', type: 'time', name: 'hora', min: '08:00', max: '18:00' },
        ].map(({ label, ...inputProps }) => (
          <div key={inputProps.name} style={{ marginBottom: '1rem' }}>
            <label htmlFor={inputProps.name}>{label}</label>
            <input
              {...inputProps}
              id={inputProps.name}
              value={formData[inputProps.name]}
              onChange={handleChange}
              required
              aria-label={label}
              aria-invalid={!!erros[inputProps.name]}
              ref={inputProps.name === 'nome' ? nomeInputRef : undefined}
            />
            {erros[inputProps.name] && (
              <small style={{ color: 'red', display: 'block' }}>{erros[inputProps.name]}</small>
            )}
            {inputProps.name === 'telefone' && avisoTelefone && !erros.telefone && (
              <small style={{ color: 'orange', display: 'block' }}>{avisoTelefone}</small>
            )}
          </div>
        ))}

        <label htmlFor="especialidade">Especialidade médica</label>
        <select
          id="especialidade"
          name="especialidade"
          value={formData.especialidade}
          onChange={handleChange}
          required
          aria-label="Especialidade médica"
          aria-invalid={!!erros.especialidade}
          style={{ marginBottom: '1rem', display: 'block' }}
        >
          <option value="">Selecione a especialidade</option>
          {['Cardiologia', 'Dermatologia', 'Neurologia', 'Ginecologia', 'Pediatria', 'Psiquiatria'].map((esp) => (
            <option key={esp} value={esp}>
              {esp}
            </option>
          ))}
        </select>
        {erros.especialidade && <small style={{ color: 'red' }}>{erros.especialidade}</small>}

        <label htmlFor="sintomas">Descrição dos sintomas</label>
        <textarea
          id="sintomas"
          name="sintomas"
          placeholder="Descreva os sintomas ou motivo da consulta"
          rows={4}
          value={formData.sintomas}
          onChange={handleChange}
          required
          aria-label="Descrição dos sintomas"
          aria-invalid={!!erros.sintomas}
          style={{ display: 'block', marginBottom: '1rem' }}
        />
        {erros.sintomas && <small style={{ color: 'red' }}>{erros.sintomas}</small>}

        <button type="submit">Agendar Consulta</button>
      </form>
    </section>
  );
}

export default FormularioAgendamento;

/* Mudança de cor no scroll */
window.addEventListener('scroll', () => {
  const header = document.querySelector('header');
  if (window.scrollY > 50) {
    header.classList.add('scrolled');
  } else {
    header.classList.remove('scrolled');
  }
});

