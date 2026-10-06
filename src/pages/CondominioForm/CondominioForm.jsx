import './CondominioForm.css'
import { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'

const vazio = {
  razao_social: '',
  nome_fantasia: '',
  cnpj: '',
  email: '',
  telefone: '',
  celular: '',
  cep: '',
  logradouro: '',
  numero: '',
  complemento: '',
  bairro: '',
  cidade: '',
  uf: '',
  codigo_ibge: '',
  observacoes: '',
  ativo: true,
}

function somenteNumeros(valor = '') {
  return valor.replace(/\D/g, '')
}

function formatarCnpj(valor = '') {
  const numeros = somenteNumeros(valor).slice(0, 14)
  return numeros
    .replace(/^(\d{2})(\d)/, '$1.$2')
    .replace(/^(\d{2})\.(\d{3})(\d)/, '$1.$2.$3')
    .replace(/\.(\d{3})(\d)/, '.$1/$2')
    .replace(/(\d{4})(\d)/, '$1-$2')
}

function formatarCep(valor = '') {
  const numeros = somenteNumeros(valor).slice(0, 8)
  return numeros.replace(/^(\d{5})(\d)/, '$1-$2')
}

function CondominioForm() {
  const { id } = useParams()
  const editando = Boolean(id)
  const navigate = useNavigate()

  const [form, setForm] = useState(vazio)
  const [carregando, setCarregando] = useState(editando)
  const [salvando, setSalvando] = useState(false)
  const [consultandoCnpj, setConsultandoCnpj] = useState(false)
  const [erro, setErro] = useState('')
  const [cnpjStatus, setCnpjStatus] = useState('')
  const [cepStatus, setCepStatus] = useState('')

  useEffect(() => {
    if (!editando) return

    fetch(`https://api.sossecurity.com.br/api/condominios.php?id=${id}`)
      .then((r) => {
        if (!r.ok) throw new Error()
        return r.json()
      })
      .then((r) =>
        setForm({
          ...vazio,
          ...r.dados,
          cnpj: formatarCnpj(r.dados.cnpj || ''),
          cep: formatarCep(r.dados.cep || ''),
          ativo: Number(r.dados.ativo) === 1,
        }),
      )
      .catch(() => setErro('Não foi possível carregar o condomínio.'))
      .finally(() => setCarregando(false))
  }, [editando, id])

  function alterar(e) {
    const { name, value, type, checked } = e.target

    let novoValor = type === 'checkbox' ? checked : value

    if (name === 'cnpj') {
      novoValor = formatarCnpj(value)
      setCnpjStatus('')
    }

    if (name === 'cep') {
      novoValor = formatarCep(value)
      setCepStatus('')
    }

    setForm((f) => ({ ...f, [name]: novoValor }))
  }

  async function buscarCnpj() {
    const cnpj = somenteNumeros(form.cnpj)

    if (cnpj.length !== 14) {
      setCnpjStatus('Informe um CNPJ com 14 dígitos.')
      return
    }

    setConsultandoCnpj(true)
    setCnpjStatus('Consultando CNPJ...')

    try {
      const resposta = await fetch(`https://brasilapi.com.br/api/cnpj/v1/${cnpj}`)

      if (!resposta.ok) {
        throw new Error('CNPJ não encontrado.')
      }

      const dados = await resposta.json()

      const cep = formatarCep(dados.cep || '')

      setForm((atual) => ({
        ...atual,
        cnpj: formatarCnpj(dados.cnpj || cnpj),
        razao_social:
          dados.razao_social ||
          dados.nome_fantasia ||
          atual.razao_social ||
          atual.nome_fantasia,
        nome_fantasia:
          dados.nome_fantasia ||
          dados.razao_social ||
          atual.nome_fantasia,
        email: dados.email || atual.email,
        telefone:
          dados.ddd_telefone_1 ||
          dados.ddd_telefone_2 ||
          atual.telefone,
        cep: cep || atual.cep,
        logradouro: dados.logradouro || atual.logradouro,
        numero: dados.numero || atual.numero,
        complemento: dados.complemento || atual.complemento,
        bairro: dados.bairro || atual.bairro,
        cidade: dados.municipio || atual.cidade,
        uf: dados.uf || atual.uf,
      }))

      setCnpjStatus('Dados preenchidos pela BrasilAPI.')

      if (somenteNumeros(cep).length === 8) {
        await buscarCep(cep, true)
      }
    } catch {
      setCnpjStatus('CNPJ não encontrado ou serviço indisponível.')
    } finally {
      setConsultandoCnpj(false)
    }
  }

  async function buscarCep(cepInformado = form.cep, silencioso = false) {
    const cep = somenteNumeros(cepInformado)

    if (cep.length !== 8) {
      if (!silencioso) setCepStatus('Informe um CEP com 8 dígitos.')
      return
    }

    if (!silencioso) setCepStatus('Consultando CEP...')

    try {
      const resposta = await fetch(`https://viacep.com.br/ws/${cep}/json/`)
      const dados = await resposta.json()

      if (!resposta.ok || dados.erro) {
        throw new Error()
      }

      setForm((atual) => ({
        ...atual,
        cep: formatarCep(cep),
        logradouro: dados.logradouro || atual.logradouro,
        complemento: atual.complemento || dados.complemento || '',
        bairro: dados.bairro || atual.bairro,
        cidade: dados.localidade || atual.cidade,
        uf: dados.uf || atual.uf,
        codigo_ibge: dados.ibge || atual.codigo_ibge,
      }))

      setCepStatus(
        silencioso
          ? 'Endereço confirmado pelo ViaCEP.'
          : 'Endereço preenchido pelo ViaCEP.',
      )
    } catch {
      setCepStatus('CEP não encontrado.')
    }
  }

  async function salvar(e) {
    e.preventDefault()
    setErro('')
    setSalvando(true)

    try {
      const url = `https://api.sossecurity.com.br/api/condominios.php${
        editando ? `?id=${id}` : ''
      }`

      const resposta = await fetch(url, {
        method: editando ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...form,
          razao_social: form.razao_social || form.nome_fantasia,
        }),
      })

      const dados = await resposta.json()

      if (!resposta.ok) {
        throw new Error(dados.erro || 'Erro ao salvar.')
      }

      navigate('/condominios')
    } catch (error) {
      setErro(error.message)
    } finally {
      setSalvando(false)
    }
  }

  if (carregando) return <main className="condominio-form-page"><p>Carregando...</p></main>

  return (
    <main className="condominio-form-page">
      <div className="page-header">
        <div>
          <h2>{editando ? 'Editar condomínio' : 'Novo condomínio'}</h2>
          <p>{editando ? 'Atualize os dados do condomínio.' : 'Cadastre um novo condomínio no sistema.'}</p>
        </div>
      </div>

      {erro && <div className="alert error">{erro}</div>}

      <form className="condominio-form-card" onSubmit={salvar}>
        <section className="condominio-form-block">
          <h3>Dados principais</h3>
          <div className="condominio-grid">
            <div className="condominio-field nome">
              <span>Nome do condomínio *</span>
              <input name="nome_fantasia" value={form.nome_fantasia || ''} onChange={alterar} required />
            </div>
            <div className="condominio-field cnpj">
              <span>CNPJ</span>
              <div className="compact-input-action">
                <input name="cnpj" value={form.cnpj || ''} onChange={alterar} onBlur={buscarCnpj} placeholder="00.000.000/0000-00" inputMode="numeric" maxLength="18" />
                <button type="button" className="compact-search-btn" onClick={buscarCnpj} disabled={consultandoCnpj} title="Buscar CNPJ"><i className="fa-solid fa-magnifying-glass"></i></button>
              </div>
              {cnpjStatus && <small className="field-status">{cnpjStatus}</small>}
            </div>
          </div>
        </section>

        <section className="condominio-form-block">
          <h3>Endereço</h3>
          <div className="condominio-grid">
            <div className="condominio-field cep">
              <span>CEP</span>
              <div className="compact-input-action">
                <input name="cep" value={form.cep || ''} onChange={alterar} onBlur={() => buscarCep()} placeholder="00000-000" inputMode="numeric" maxLength="9" />
                <button type="button" className="compact-search-btn" onClick={() => buscarCep()} title="Buscar CEP"><i className="fa-solid fa-magnifying-glass"></i></button>
              </div>
              {cepStatus && <small className="field-status">{cepStatus}</small>}
            </div>
            <div className="condominio-field logradouro"><span>Logradouro</span><input name="logradouro" value={form.logradouro || ''} onChange={alterar} /></div>
            <div className="condominio-field numero"><span>Número</span><input name="numero" value={form.numero || ''} onChange={alterar} /></div>
            <div className="condominio-field complemento"><span>Complemento</span><input name="complemento" value={form.complemento || ''} onChange={alterar} /></div>
            <div className="condominio-field bairro"><span>Bairro</span><input name="bairro" value={form.bairro || ''} onChange={alterar} /></div>
            <div className="condominio-field cidade"><span>Cidade</span><input name="cidade" value={form.cidade || ''} onChange={alterar} /></div>
            <div className="condominio-field uf"><span>UF</span><input name="uf" maxLength="2" value={form.uf || ''} onChange={alterar} /></div>
          </div>
        </section>

        <section className="condominio-form-block">
          <h3>Status</h3>
          <label className="condominio-status-row"><input type="checkbox" name="ativo" checked={Boolean(form.ativo)} onChange={alterar} /> Condomínio ativo</label>
        </section>

        <div className="condominio-form-footer">
          <Link className="btn-secondary" to="/condominios">Cancelar</Link>
          <button className="btn-primary" disabled={salvando}>{salvando ? 'Salvando...' : 'Salvar'}</button>
        </div>
      </form>
    </main>
  )
}

export default CondominioForm
