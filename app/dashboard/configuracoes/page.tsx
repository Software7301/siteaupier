'use client'

import { useState } from 'react'
import { Settings, Building, Phone, Mail, MapPin, Save, CheckCircle } from 'lucide-react'
import { motion } from 'framer-motion'

export default function ConfiguracoesPage() {
  const [saved, setSaved] = useState(false)
  const [config, setConfig] = useState({
    nomeEmpresa: 'AutoPier',
    slogan: 'Concessionária Premium',
    telefone: '(69) 9 9371-6918',
    email: 'maxwanber@gmail.com',
    endereco: 'Av. Brasil, 1234 - Porto Velho, RO',
    horarioFuncionamento: 'Seg-Sex: 8h às 18h | Sáb: 8h às 12h',
  })

  function handleSave() {
    // Em produção, salvar no banco
    setSaved(true)
    setTimeout(() => setSaved(false), 3000)
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-display font-bold text-white flex items-center gap-3">
          <Settings className="w-8 h-8 text-primary" />
          Configurações
        </h1>
        <p className="text-text-secondary mt-1">
          Configurações gerais da concessionária
        </p>
      </div>

      {/* Formulário */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="card-static p-6"
      >
        <h2 className="text-lg font-semibold text-white flex items-center gap-2 mb-6">
          <Building className="w-5 h-5 text-primary" />
          Informações da Empresa
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Nome da Empresa */}
          <div>
            <label className="block text-sm font-medium text-text-secondary mb-2">
              Nome da Empresa
            </label>
            <input
              type="text"
              value={config.nomeEmpresa}
              onChange={(e) => setConfig({ ...config, nomeEmpresa: e.target.value })}
              className="input-field w-full"
            />
          </div>

          {/* Slogan */}
          <div>
            <label className="block text-sm font-medium text-text-secondary mb-2">
              Slogan
            </label>
            <input
              type="text"
              value={config.slogan}
              onChange={(e) => setConfig({ ...config, slogan: e.target.value })}
              className="input-field w-full"
            />
          </div>

          {/* Telefone */}
          <div>
            <label className="block text-sm font-medium text-text-secondary mb-2">
              <Phone className="w-4 h-4 inline mr-1" />
              Telefone
            </label>
            <input
              type="tel"
              value={config.telefone}
              onChange={(e) => setConfig({ ...config, telefone: e.target.value })}
              className="input-field w-full"
            />
          </div>

          {/* Email */}
          <div>
            <label className="block text-sm font-medium text-text-secondary mb-2">
              <Mail className="w-4 h-4 inline mr-1" />
              Email
            </label>
            <input
              type="email"
              value={config.email}
              onChange={(e) => setConfig({ ...config, email: e.target.value })}
              className="input-field w-full"
            />
          </div>

          {/* Endereço */}
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-text-secondary mb-2">
              <MapPin className="w-4 h-4 inline mr-1" />
              Endereço
            </label>
            <input
              type="text"
              value={config.endereco}
              onChange={(e) => setConfig({ ...config, endereco: e.target.value })}
              className="input-field w-full"
            />
          </div>

          {/* Horário de Funcionamento */}
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-text-secondary mb-2">
              Horário de Funcionamento
            </label>
            <input
              type="text"
              value={config.horarioFuncionamento}
              onChange={(e) => setConfig({ ...config, horarioFuncionamento: e.target.value })}
              className="input-field w-full"
            />
          </div>
        </div>

        {/* Botão Salvar */}
        <div className="mt-8 flex items-center gap-4">
          <button
            onClick={handleSave}
            className="btn-primary flex items-center gap-2"
          >
            <Save className="w-5 h-5" />
            Salvar Configurações
          </button>

          {saved && (
            <motion.span
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              className="text-accent flex items-center gap-2"
            >
              <CheckCircle className="w-5 h-5" />
              Configurações salvas!
            </motion.span>
          )}
        </div>
      </motion.div>

      {/* Informações do Sistema */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="card-static p-6"
      >
        <h2 className="text-lg font-semibold text-white mb-6">
          Informações do Sistema
        </h2>

        <div className="space-y-4 text-sm">
          <div className="flex justify-between py-3 border-b border-surface-border">
            <span className="text-text-muted">Versão do Sistema</span>
            <span className="text-white">1.0.0</span>
          </div>
          <div className="flex justify-between py-3 border-b border-surface-border">
            <span className="text-text-muted">Framework</span>
            <span className="text-white">Next.js 14</span>
          </div>
          <div className="flex justify-between py-3 border-b border-surface-border">
            <span className="text-text-muted">Banco de Dados</span>
            <span className="text-white">PostgreSQL + Prisma</span>
          </div>
          <div className="flex justify-between py-3">
            <span className="text-text-muted">Ambiente</span>
            <span className="text-accent">Desenvolvimento</span>
          </div>
        </div>
      </motion.div>
    </div>
  )
}

