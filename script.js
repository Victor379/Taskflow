// ============================================
//  TASKFLOW — Lógica Principal
//  Gerenciamento de tarefas com LocalStorage
// ============================================

// --- Referências aos elementos do DOM ---
const taskInput   = document.getElementById('taskInput');
const addBtn      = document.getElementById('addBtn');
const taskList    = document.getElementById('taskList');
const emptyState  = document.getElementById('emptyState');
const pendingCount = document.getElementById('pendingCount');
const dateBadge   = document.getElementById('dateBadge');
const filterBtns  = document.querySelectorAll('.filter-btn');

// --- Estado da aplicação ---
let tasks         = [];          // Array de objetos de tarefa
let currentFilter = 'all';       // Filtro ativo: 'all' | 'pending' | 'done'

// --- Estrutura de uma tarefa ---
// { id: number, text: string, done: boolean, createdAt: string }


// ============================================
//  INICIALIZAÇÃO
// ============================================

/**
 * Roda ao carregar a página.
 * Carrega tarefas salvas e exibe a data atual.
 */
function init() {
  loadFromStorage();
  renderDateBadge();
  render();
}


// ============================================
//  LOCALSTORAGE
// ============================================

/** Carrega as tarefas do LocalStorage para a variável `tasks`. */
function loadFromStorage() {
  const saved = localStorage.getItem('taskflow_tasks');
  tasks = saved ? JSON.parse(saved) : [];
}

/** Salva o estado atual de `tasks` no LocalStorage. */
function saveToStorage() {
  localStorage.setItem('taskflow_tasks', JSON.stringify(tasks));
}


// ============================================
//  CRUD DE TAREFAS
// ============================================

/**
 * Adiciona uma nova tarefa à lista.
 * Lê o valor do input, valida, cria o objeto e salva.
 */
function addTask() {
  const text = taskInput.value.trim();

  // Validação: ignora inputs vazios
  if (!text) {
    taskInput.focus();
    taskInput.classList.add('shake');
    setTimeout(() => taskInput.classList.remove('shake'), 400);
    return;
  }

  // Cria objeto da tarefa
  const newTask = {
    id: Date.now(),
    text,
    done: false,
    createdAt: new Date().toISOString()
  };

  tasks.unshift(newTask); // Adiciona no início da lista
  saveToStorage();
  render();

  // Limpa o input e mantém foco
  taskInput.value = '';
  taskInput.focus();
}

/**
 * Alterna o estado de conclusão de uma tarefa.
 * @param {number} id - ID único da tarefa
 */
function toggleTask(id) {
  tasks = tasks.map(task =>
    task.id === id ? { ...task, done: !task.done } : task
  );
  saveToStorage();
  render();
}

/**
 * Remove uma tarefa pelo ID.
 * @param {number} id - ID único da tarefa
 */
function deleteTask(id) {
  tasks = tasks.filter(task => task.id !== id);
  saveToStorage();
  render();
}


// ============================================
//  FILTROS
// ============================================

/**
 * Retorna as tarefas filtradas conforme o filtro ativo.
 * @returns {Array} Lista de tarefas filtradas
 */
function getFilteredTasks() {
  switch (currentFilter) {
    case 'pending': return tasks.filter(t => !t.done);
    case 'done':    return tasks.filter(t => t.done);
    default:        return tasks;  // 'all'
  }
}

/**
 * Define o filtro ativo e re-renderiza a lista.
 * @param {string} filter - 'all' | 'pending' | 'done'
 */
function setFilter(filter) {
  currentFilter = filter;
  // Atualiza visual dos botões de filtro
  filterBtns.forEach(btn => {
    btn.classList.toggle('active', btn.dataset.filter === filter);
  });
  render();
}


// ============================================
//  RENDERIZAÇÃO
// ============================================

/**
 * Renderiza toda a UI: contador, lista de tarefas, estado vazio.
 * Chamada sempre que os dados mudam.
 */
function render() {
  const filtered = getFilteredTasks();
  const pending  = tasks.filter(t => !t.done).length;

  // Atualiza o contador de pendentes
  pendingCount.textContent = pending;

  // Limpa a lista atual
  taskList.innerHTML = '';

  if (filtered.length === 0) {
    // Exibe estado vazio
    emptyState.hidden = false;
  } else {
    emptyState.hidden = true;
    // Cria e insere cada item da lista
    filtered.forEach(task => {
      const li = createTaskElement(task);
      taskList.appendChild(li);
    });
  }
}

/**
 * Cria e retorna um elemento <li> para uma tarefa.
 * @param {Object} task - Objeto da tarefa
 * @returns {HTMLElement} Elemento <li> da tarefa
 */
function createTaskElement(task) {
  const li = document.createElement('li');
  li.className = `task-item${task.done ? ' done' : ''}`;
  li.dataset.id = task.id;

  // Botão de conclusão (checkbox visual)
  const checkBtn = document.createElement('button');
  checkBtn.className = 'task-check';
  checkBtn.setAttribute('aria-label', task.done ? 'Marcar como pendente' : 'Marcar como concluída');
  checkBtn.title = task.done ? 'Desfazer conclusão' : 'Concluir tarefa';
  checkBtn.addEventListener('click', () => toggleTask(task.id));

  // Texto da tarefa
  const textSpan = document.createElement('span');
  textSpan.className = 'task-text';
  textSpan.textContent = task.text;

  // Botão de exclusão
  const deleteBtn = document.createElement('button');
  deleteBtn.className = 'task-delete';
  deleteBtn.setAttribute('aria-label', 'Excluir tarefa');
  deleteBtn.title = 'Excluir';
  deleteBtn.innerHTML = `
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
         stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
      <polyline points="3 6 5 6 21 6"></polyline>
      <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"></path>
      <path d="M10 11v6"></path>
      <path d="M14 11v6"></path>
      <path d="M9 6V4h6v2"></path>
    </svg>`;
  deleteBtn.addEventListener('click', () => deleteTask(task.id));

  // Monta o item
  li.appendChild(checkBtn);
  li.appendChild(textSpan);
  li.appendChild(deleteBtn);

  return li;
}

/**
 * Exibe a data atual no badge do cabeçalho.
 * Formato: "seg., 24 de mar."
 */
function renderDateBadge() {
  const now = new Date();
  const options = { weekday: 'short', day: 'numeric', month: 'short' };
  dateBadge.textContent = now.toLocaleDateString('pt-BR', options);
}


// ============================================
//  EVENTOS
// ============================================

// Clique no botão "Adicionar"
addBtn.addEventListener('click', addTask);

// Enter no campo de input
taskInput.addEventListener('keydown', (e) => {
  if (e.key === 'Enter') addTask();
});

// Cliques nos botões de filtro
filterBtns.forEach(btn => {
  btn.addEventListener('click', () => setFilter(btn.dataset.filter));
});


// ============================================
//  ANIMAÇÃO DE SHAKE (input vazio)
// ============================================
const shakeStyle = document.createElement('style');
shakeStyle.textContent = `
  @keyframes shake {
    0%, 100% { transform: translateX(0); }
    20%       { transform: translateX(-6px); }
    40%       { transform: translateX(6px); }
    60%       { transform: translateX(-4px); }
    80%       { transform: translateX(4px); }
  }
  .task-input.shake {
    animation: shake 0.35s ease;
  }
`;
document.head.appendChild(shakeStyle);


// ============================================
//  INICIALIZA O APP
// ============================================
init();
