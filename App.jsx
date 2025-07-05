import { useState, useEffect } from 'react'
import './App.css'

function App() {
  const [events, setEvents] = useState([])
  const [showForm, setShowForm] = useState(false)
  const [showAutoOrganize, setShowAutoOrganize] = useState(false)
  const [showLogs, setShowLogs] = useState(false)
  const [showCalendar, setShowCalendar] = useState(true)
  const [editingEvent, setEditingEvent] = useState(null)
  const [selectedSector, setSelectedSector] = useState('all')
  const [selectedDate, setSelectedDate] = useState(null)
  const [currentDate, setCurrentDate] = useState(new Date())
  const [logs, setLogs] = useState([])
  const [autoOrganizeText, setAutoOrganizeText] = useState('')
  const [detectedEvents, setDetectedEvents] = useState([])
  const [showDetectedEvents, setShowDetectedEvents] = useState(false)

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    date: '',
    startTime: '',
    endTime: '',
    sector: ''
  })

  const sectors = [
    { id: 'presidencia', name: 'PRESIDÊNCIA', color: '#DC2626' },
    { id: 'comissoes', name: 'COMISSÕES', color: '#2563EB' },
    { id: 'esa', name: 'ESA PIAUÍ', color: '#16A34A' },
    { id: 'dce', name: 'DCE', color: '#EA580C' },
    { id: 'ceja', name: 'CEJA', color: '#7C3AED' },
    { id: 'podcast', name: 'PODCAST', color: '#DC2626' },
    { id: 'conselho', name: 'CONSELHO SECCIONAL', color: '#06B6D4' },
    { id: 'ted', name: 'TED', color: '#F97316' },
    { id: 'prerrogativas', name: 'PRERROGATIVAS', color: '#84CC16' },
    { id: 'particulares', name: 'EVENTOS PARTICULARES', color: '#6B7280' }
  ]

  // Carregar dados do localStorage
  useEffect(() => {
    const savedEvents = localStorage.getItem('agenda-events')
    const savedLogs = localStorage.getItem('agenda-logs')
    if (savedEvents) {
      setEvents(JSON.parse(savedEvents))
    }
    if (savedLogs) {
      setLogs(JSON.parse(savedLogs))
    }
  }, [])

  // Salvar no localStorage
  useEffect(() => {
    localStorage.setItem('agenda-events', JSON.stringify(events))
  }, [events])

  useEffect(() => {
    localStorage.setItem('agenda-logs', JSON.stringify(logs))
  }, [logs])

  // Sistema de notificações
  useEffect(() => {
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission()
    }

    const checkNotifications = () => {
      const now = new Date()
      events.forEach(event => {
        const eventDateTime = new Date(`${event.date}T${event.startTime}`)
        const timeDiff = eventDateTime.getTime() - now.getTime()
        const fourHours = 4 * 60 * 60 * 1000

        if (timeDiff > 0 && timeDiff <= fourHours && !event.notified) {
          if (Notification.permission === 'granted') {
            new Notification(`Evento em 4 horas: ${event.title}`, {
              body: `${event.startTime}${event.endTime ? ' - ' + event.endTime : ''} - ${getSectorName(event.sector)}`,
              icon: '⚖️'
            })
          }
          
          // Marcar como notificado
          setEvents(prev => prev.map(e => 
            e.id === event.id ? { ...e, notified: true } : e
          ))
        }
      })
    }

    const interval = setInterval(checkNotifications, 60000) // Verificar a cada minuto
    return () => clearInterval(interval)
  }, [events])

  const addLog = (action, eventTitle, details = '') => {
    const newLog = {
      id: Date.now(),
      timestamp: new Date().toLocaleString('pt-BR'),
      action,
      eventTitle,
      details
    }
    setLogs(prev => [newLog, ...prev])
  }

  const getSectorName = (sectorId) => {
    const sector = sectors.find(s => s.id === sectorId)
    return sector ? sector.name : sectorId
  }

  const getSectorColor = (sectorId) => {
    const sector = sectors.find(s => s.id === sectorId)
    return sector ? sector.color : '#6B7280'
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    
    if (!formData.title || !formData.date || !formData.startTime || !formData.sector) {
      alert('Por favor, preencha todos os campos obrigatórios.')
      return
    }

    // Validar horários
    if (formData.endTime && formData.startTime >= formData.endTime) {
      alert('O horário de fim deve ser posterior ao horário de início.')
      return
    }

    const eventData = {
      ...formData,
      id: editingEvent ? editingEvent.id : Date.now(),
      createdAt: editingEvent ? editingEvent.createdAt : new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      isUpdated: !!editingEvent
    }

    if (editingEvent) {
      setEvents(prev => prev.map(event => 
        event.id === editingEvent.id ? eventData : event
      ))
      addLog('EDIÇÃO', formData.title, `Evento atualizado`)
    } else {
      setEvents(prev => [...prev, eventData])
      addLog('CRIAÇÃO', formData.title, `Novo evento criado`)
    }

    resetForm()
  }

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      date: '',
      startTime: '',
      endTime: '',
      sector: ''
    })
    setShowForm(false)
    setEditingEvent(null)
  }

  const handleEdit = (event) => {
    setFormData(event)
    setEditingEvent(event)
    setShowForm(true)
  }

  const handleDelete = (eventId) => {
    const event = events.find(e => e.id === eventId)
    if (event && confirm('Tem certeza que deseja excluir este evento?')) {
      setEvents(prev => prev.filter(e => e.id !== eventId))
      addLog('EXCLUSÃO', event.title, `Evento removido`)
    }
  }

  // Função para categorizar eventos automaticamente
  const categorizeEvent = (text) => {
    const lowerText = text.toLowerCase()
    
    // Ordem de prioridade para evitar conflitos
    if (lowerText.includes('presidência') || lowerText.includes('presidente') || lowerText.includes('diretoria')) {
      return 'presidencia'
    }
    if (lowerText.includes('conselho seccional') || lowerText.includes('seccional') || lowerText.includes('plenário') || lowerText.includes('assembleia')) {
      return 'conselho'
    }
    if (lowerText.includes('comissão') || lowerText.includes('comitê') || lowerText.includes('reunião comissão')) {
      return 'comissoes'
    }
    if (lowerText.includes('esa') || lowerText.includes('escola superior') || lowerText.includes('palestra') || lowerText.includes('curso') || lowerText.includes('capacitação')) {
      return 'esa'
    }
    if (lowerText.includes('dce') || lowerText.includes('cultura') || lowerText.includes('evento cultural') || lowerText.includes('exposição')) {
      return 'dce'
    }
    if (lowerText.includes('ceja') || lowerText.includes('jovem advocacia') || lowerText.includes('networking jovem')) {
      return 'ceja'
    }
    if (lowerText.includes('ted') || lowerText.includes('tecnologia') || lowerText.includes('inovação') || lowerText.includes('digital') || lowerText.includes('transformação digital')) {
      return 'ted'
    }
    if (lowerText.includes('prerrogativas') || lowerText.includes('direitos') || lowerText.includes('defesa') || lowerText.includes('prerrogativa') || lowerText.includes('violação')) {
      return 'prerrogativas'
    }
    if (lowerText.includes('podcast') || lowerText.includes('gravação') || lowerText.includes('entrevista') || lowerText.includes('programa')) {
      return 'podcast'
    }
    if (lowerText.includes('aniversário') || lowerText.includes('festa') || lowerText.includes('família') || lowerText.includes('particular')) {
      return 'particulares'
    }
    
    return 'particulares' // Default
  }

  // Função para extrair eventos do texto
  const extractEventsFromText = (text) => {
    const lines = text.split('\n').filter(line => line.trim())
    const extractedEvents = []

    lines.forEach(line => {
      const trimmedLine = line.trim()
      if (!trimmedLine) return

      // Regex para extrair data e horários
      const dateRegex = /(\d{1,2}\/\d{1,2}\/\d{4}|\d{4}-\d{1,2}-\d{1,2})/
      const timeRegex = /(\d{1,2}:\d{2})/g

      const dateMatch = trimmedLine.match(dateRegex)
      const timeMatches = trimmedLine.match(timeRegex)

      let title = trimmedLine
      let date = ''
      let startTime = ''
      let endTime = ''

      if (dateMatch) {
        let extractedDate = dateMatch[0]
        if (extractedDate.includes('/')) {
          const [day, month, year] = extractedDate.split('/')
          extractedDate = `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`
        }
        date = extractedDate
        title = title.replace(dateMatch[0], '').trim()
      }

      if (timeMatches) {
        startTime = timeMatches[0]
        if (timeMatches.length > 1) {
          endTime = timeMatches[1]
        }
        timeMatches.forEach(time => {
          title = title.replace(time, '').trim()
        })
      }

      // Limpar título
      title = title.replace(/[-–—]/g, '').trim()

      const sector = categorizeEvent(title)

      extractedEvents.push({
        title: title || 'Evento sem título',
        date: date || new Date().toISOString().split('T')[0],
        startTime: startTime || '09:00',
        endTime: endTime || '',
        sector,
        description: ''
      })
    })

    return extractedEvents
  }

  const handleAutoOrganize = () => {
    if (!autoOrganizeText.trim()) {
      alert('Por favor, cole o texto com os eventos.')
      return
    }

    const extracted = extractEventsFromText(autoOrganizeText)
    if (extracted.length === 0) {
      alert('Nenhum evento válido encontrado no texto.')
      return
    }

    setDetectedEvents(extracted)
    setShowDetectedEvents(true)
  }

  const confirmDetectedEvents = () => {
    const newEvents = detectedEvents.map(event => ({
      ...event,
      id: Date.now() + Math.random(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      isUpdated: false
    }))

    setEvents(prev => [...prev, ...newEvents])
    newEvents.forEach(event => {
      addLog('CRIAÇÃO', event.title, 'Evento criado via auto-organização')
    })

    setAutoOrganizeText('')
    setDetectedEvents([])
    setShowDetectedEvents(false)
    setShowAutoOrganize(false)
  }

  // Filtrar eventos
  const filteredEvents = events.filter(event => {
    const sectorMatch = selectedSector === 'all' || event.sector === selectedSector
    const dateMatch = !selectedDate || event.date === selectedDate
    return sectorMatch && dateMatch
  })

  // Ordenar eventos (atualizados primeiro, depois por data/hora)
  const sortedEvents = [...filteredEvents].sort((a, b) => {
    if (a.isUpdated && !b.isUpdated) return -1
    if (!a.isUpdated && b.isUpdated) return 1
    
    const dateA = new Date(`${a.date}T${a.startTime}`)
    const dateB = new Date(`${b.date}T${b.startTime}`)
    return dateA - dateB
  })

  // Funções do calendário
  const getDaysInMonth = (date) => {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate()
  }

  const getFirstDayOfMonth = (date) => {
    return new Date(date.getFullYear(), date.getMonth(), 1).getDay()
  }

  const formatDate = (date) => {
    return date.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' })
  }

  const isToday = (day) => {
    const today = new Date()
    return today.getDate() === day && 
           today.getMonth() === currentDate.getMonth() && 
           today.getFullYear() === currentDate.getFullYear()
  }

  const hasEvents = (day) => {
    const dateStr = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`
    return events.some(event => event.date === dateStr)
  }

  const isSelected = (day) => {
    if (!selectedDate) return false
    const dateStr = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`
    return selectedDate === dateStr
  }

  const handleDateClick = (day) => {
    const dateStr = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`
    setSelectedDate(selectedDate === dateStr ? null : dateStr)
  }

  const renderCalendar = () => {
    const daysInMonth = getDaysInMonth(currentDate)
    const firstDay = getFirstDayOfMonth(currentDate)
    const days = []

    // Dias vazios no início
    for (let i = 0; i < firstDay; i++) {
      days.push(<div key={`empty-${i}`} className="calendar-day empty"></div>)
    }

    // Dias do mês
    for (let day = 1; day <= daysInMonth; day++) {
      const dayClasses = [
        'calendar-day',
        isToday(day) ? 'today' : '',
        hasEvents(day) ? 'has-events' : '',
        isSelected(day) ? 'selected' : ''
      ].filter(Boolean).join(' ')

      days.push(
        <div 
          key={day} 
          className={dayClasses}
          onClick={() => handleDateClick(day)}
        >
          {day}
        </div>
      )
    }

    return days
  }

  const navigateMonth = (direction) => {
    setCurrentDate(prev => {
      const newDate = new Date(prev)
      newDate.setMonth(prev.getMonth() + direction)
      return newDate
    })
  }

  return (
    <div className="app">
      <header className="app-header">
        <h1>⚖️ AGENDA OAB PIAUÍ</h1>
        <p>Sistema de gerenciamento de agenda da Ordem dos Advogados do Brasil - Seção Piauí</p>
        <div className="header-badges">
          <span className="badge">🌐 Compatível com rede local</span>
          <span className="badge">📊 Sistema de logs integrado</span>
        </div>
      </header>

      {showCalendar && (
        <div className="calendar-container">
          <div className="calendar-header">
            <h2>📅 Calendário de Eventos</h2>
            <div className="calendar-navigation">
              <button onClick={() => navigateMonth(-1)} className="nav-btn">◀</button>
              <span className="current-month">{formatDate(currentDate)}</span>
              <button onClick={() => navigateMonth(1)} className="nav-btn">▶</button>
            </div>
          </div>
          
          <div className="calendar">
            <div className="calendar-weekdays">
              <div>Dom</div>
              <div>Seg</div>
              <div>Ter</div>
              <div>Qua</div>
              <div>Qui</div>
              <div>Sex</div>
              <div>Sáb</div>
            </div>
            <div className="calendar-days">
              {renderCalendar()}
            </div>
          </div>
          
          <div className="calendar-legend">
            <span className="legend-item"><span className="legend-color today"></span> Hoje</span>
            <span className="legend-item"><span className="legend-color has-events"></span> Com eventos</span>
            <span className="legend-item"><span className="legend-color selected"></span> Selecionado</span>
          </div>
        </div>
      )}

      <div className="controls">
        <div className="filter-controls">
          <select 
            value={selectedSector} 
            onChange={(e) => setSelectedSector(e.target.value)}
            className="sector-filter"
          >
            <option value="all">Todos os Setores</option>
            {sectors.map(sector => (
              <option key={sector.id} value={sector.id}>
                {sector.name}
              </option>
            ))}
          </select>
          
          {selectedDate && (
            <button 
              onClick={() => setSelectedDate(null)}
              className="clear-filter-btn"
            >
              Limpar filtro de data
            </button>
          )}
        </div>

        <div className="action-controls">
          <button 
            onClick={() => setShowAutoOrganize(!showAutoOrganize)} 
            className="auto-organize-btn"
          >
            ✨ Auto-Organizar
          </button>
          <button 
            onClick={() => setShowForm(!showForm)} 
            className="new-event-btn"
          >
            ➕ Novo Evento
          </button>
          <button 
            onClick={() => setShowCalendar(!showCalendar)} 
            className="toggle-calendar-btn"
          >
            📅 {showCalendar ? 'Ocultar' : 'Mostrar'} Calendário
          </button>
          <button 
            onClick={() => setShowLogs(!showLogs)} 
            className="logs-btn"
          >
            📊 Logs ({logs.length})
          </button>
        </div>
      </div>

      {showAutoOrganize && (
        <div className="auto-organize-container">
          <h3>🤖 Auto-Organização de Eventos</h3>
          <textarea
            value={autoOrganizeText}
            onChange={(e) => setAutoOrganizeText(e.target.value)}
            placeholder="Cole o texto com seus eventos..."
            className="auto-organize-textarea"
            rows="6"
          />
          <div className="auto-organize-actions">
            <button onClick={handleAutoOrganize} className="process-btn">
              🔄 Processar Eventos
            </button>
            <button onClick={() => setShowAutoOrganize(false)} className="cancel-btn">
              ❌ Cancelar
            </button>
          </div>
        </div>
      )}

      {showDetectedEvents && (
        <div className="detected-events-container">
          <h3>📋 Eventos Detectados</h3>
          <div className="detected-events-list">
            {detectedEvents.map((event, index) => (
              <div key={index} className="detected-event">
                <h4>{event.title}</h4>
                <p>📅 {event.date} | ⏰ {event.startTime}{event.endTime ? ` - ${event.endTime}` : ''}</p>
                <p>🏢 {getSectorName(event.sector)}</p>
              </div>
            ))}
          </div>
          <div className="detected-events-actions">
            <button onClick={confirmDetectedEvents} className="confirm-btn">
              ✅ Confirmar e Adicionar
            </button>
            <button onClick={() => setShowDetectedEvents(false)} className="cancel-btn">
              ❌ Cancelar
            </button>
          </div>
        </div>
      )}

      {showForm && (
        <div className="form-container">
          <h3>{editingEvent ? '✏️ Editar Evento' : '➕ Novo Evento'}</h3>
          <form onSubmit={handleSubmit} className="event-form">
            <div className="form-group">
              <label>Título *</label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => setFormData({...formData, title: e.target.value})}
                placeholder="Digite o título do evento"
                required
              />
            </div>

            <div className="form-group">
              <label>Descrição</label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({...formData, description: e.target.value})}
                placeholder="Descrição opcional do evento"
                rows="3"
              />
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Data *</label>
                <input
                  type="date"
                  value={formData.date}
                  onChange={(e) => setFormData({...formData, date: e.target.value})}
                  required
                />
              </div>

              <div className="form-group">
                <label>Horário de Início *</label>
                <input
                  type="time"
                  value={formData.startTime}
                  onChange={(e) => setFormData({...formData, startTime: e.target.value})}
                  required
                />
              </div>

              <div className="form-group">
                <label>Horário de Fim</label>
                <input
                  type="time"
                  value={formData.endTime}
                  onChange={(e) => setFormData({...formData, endTime: e.target.value})}
                />
              </div>
            </div>

            <div className="form-group">
              <label>Setor *</label>
              <select
                value={formData.sector}
                onChange={(e) => setFormData({...formData, sector: e.target.value})}
                required
              >
                <option value="">Selecione o setor</option>
                {sectors.map(sector => (
                  <option key={sector.id} value={sector.id}>
                    {sector.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-actions">
              <button type="submit" className="submit-btn">
                {editingEvent ? '💾 Salvar Alterações' : '➕ Adicionar Evento'}
              </button>
              <button type="button" onClick={resetForm} className="cancel-btn">
                ❌ Cancelar
              </button>
            </div>
          </form>
        </div>
      )}

      {showLogs && (
        <div className="logs-container">
          <h3>📊 Logs do Sistema</h3>
          <div className="logs-list">
            {logs.length === 0 ? (
              <p>Nenhum log registrado ainda.</p>
            ) : (
              logs.map(log => (
                <div key={log.id} className="log-item">
                  <div className="log-header">
                    <span className={`log-action ${log.action.toLowerCase()}`}>
                      {log.action}
                    </span>
                    <span className="log-timestamp">{log.timestamp}</span>
                  </div>
                  <div className="log-content">
                    <strong>{log.eventTitle}</strong>
                    {log.details && <span> - {log.details}</span>}
                  </div>
                </div>
              ))
            )}
          </div>
          <button onClick={() => setShowLogs(false)} className="close-logs-btn">
            ❌ Fechar Logs
          </button>
        </div>
      )}

      <div className="events-container">
        <h3>📋 Eventos Agendados</h3>
        
        {selectedSector !== 'all' && (
          <div className="filter-info">
            <span style={{ color: getSectorColor(selectedSector) }}>
              ● Filtrando por: {getSectorName(selectedSector)}
            </span>
          </div>
        )}

        {selectedDate && (
          <div className="filter-info">
            📅 Eventos do dia: {new Date(selectedDate + 'T00:00:00').toLocaleDateString('pt-BR')}
          </div>
        )}

        {sortedEvents.length === 0 ? (
          <div className="no-events">
            <div className="no-events-icon">📅</div>
            <p>
              {selectedSector !== 'all' 
                ? `Nenhum evento encontrado para ${getSectorName(selectedSector)}`
                : selectedDate 
                  ? 'Nenhum evento encontrado para esta data'
                  : 'Nenhum evento cadastrado'
              }
            </p>
          </div>
        ) : (
          <div className="events-list">
            {sortedEvents.map(event => (
              <div 
                key={event.id} 
                className={`event-card ${event.isUpdated ? 'updated' : ''}`}
                style={{ borderLeftColor: getSectorColor(event.sector) }}
              >
                <div className="event-header">
                  <h4>{event.title}</h4>
                  <div className="event-actions">
                    <button 
                      onClick={() => handleEdit(event)}
                      className="edit-btn"
                      title="Editar evento"
                    >
                      ✏️
                    </button>
                    <button 
                      onClick={() => handleDelete(event.id)}
                      className="delete-btn"
                      title="Excluir evento"
                    >
                      🗑️
                    </button>
                  </div>
                </div>
                
                <div className="event-details">
                  <p>📅 {new Date(event.date + 'T00:00:00').toLocaleDateString('pt-BR')}</p>
                  <p>⏰ {event.startTime}{event.endTime ? ` - ${event.endTime}` : ''}</p>
                  <p style={{ color: getSectorColor(event.sector) }}>
                    🏢 {getSectorName(event.sector)}
                  </p>
                  {event.description && <p>📝 {event.description}</p>}
                </div>

                {event.isUpdated && (
                  <div className="updated-badge">
                    ✨ Atualizado
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default App

