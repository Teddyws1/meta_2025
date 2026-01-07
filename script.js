
// ============================================================
// VARIÁVEIS GLOBAIS E ESTADO
// ============================================================

let currentGoal = 0;
let currentDescription = "";
let currentDeadline = "";
let currentStartDate = "";
let deposits = [];

// ============================================================
// REFERÊNCIAS DOM
// ============================================================

// Meta
const goalAmountInput = document.getElementById("goal-amount");
const goalDescriptionInput = document.getElementById("goal-description");
const goalDeadlineInput = document.getElementById("goal-deadline");
const goalStartDateInput = document.getElementById("goal-start-date");
const saveGoalBtn = document.getElementById("save-goal-btn");
const goalInputSection = document.getElementById("goal-input-section");
const goalDisplaySection = document.getElementById("goal-display-section");
const displayGoalAmount = document.getElementById("display-goal-amount");
const displayGoalDescription = document.getElementById(
  "display-goal-description"
);
const displayGoalDeadline = document.getElementById("display-goal-deadline");
const goalSectionTitle = document.getElementById("goal-section-title");

// Progresso
const progressPercentDisplay = document.getElementById(
  "progress-percent-display"
);
const savedAmountDisplayTop = document.getElementById(
  "saved-amount-display-top"
);
const progressBarFill = document.getElementById("progress-bar-fill");
const endLabel = document.getElementById("end-label");

// Cards
const metaTotalCard = document.getElementById("meta-total-card");
const valorArrecadadoCard = document.getElementById("valor-arrecadado-card");
const percentCompleteCard = document.getElementById("percent-complete-card");
const valorRestanteCard = document.getElementById("valor-restante-card");
const diasRestantesCard = document.getElementById("dias-restantes-card");
const duracaoTotalCard = document.getElementById("duracao-total-card");

// Depósitos
const depositsList = document.getElementById("deposits-list");
const depositForm = document.getElementById("deposit-form");


// Abas
const tabButtonsContainer = document.getElementById("tab-buttons-container");

// Modais
const editModal = document.getElementById("edit-modal");
const editForm = document.getElementById("edit-form");

// Beta Modal
const openBtn = document.getElementById("openCard");
const closeBtn = document.getElementById("closeCard");
const card = document.getElementById("card");
const overlay = document.getElementById("overlay");

// ============================================================
// FUNÇÕES UTILITÁRIAS
// ============================================================

/**
 * Formata valor para moeda brasileira
 * @param {number} amount - Valor a ser formatado
 * @returns {string} Valor formatado em R$
 */
const formatCurrency = (amount) =>
  `R$ ${parseFloat(amount).toFixed(2).replace(".", ",")}`;

/**
 * Formata data para formato brasileiro
 * @param {string} dateString - Data em formato ISO
 * @returns {string} Data formatada DD/MM/AAAA
 */
const formatDate = (dateString) => {
  if (!dateString) return "--/--/----";
  const date = new Date(dateString);
  const offsetDate = new Date(
    date.getTime() + date.getTimezoneOffset() * 60000
  );
  return new Intl.DateTimeFormat("pt-BR").format(offsetDate);
};

/**
 * Retorna a hora atual formatada
 * @returns {string} Hora no formato HH:MM
 */
const getCurrentTime = () => {
  const now = new Date();
  const hours = String(now.getHours()).padStart(2, "0");
  const minutes = String(now.getMinutes()).padStart(2, "0");
  return `${hours}:${minutes}`;
};

/**
 * Exibe mensagem de sucesso
 * @param {string} message - Mensagem a ser exibida
 */
const showSuccessMessage = (message) => {
  const messageElement = document.getElementById("success-message");

  messageElement.querySelector("p").innerHTML = `
    <svg class="w-6 h-6 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
    </svg>
    ${message}
  `;

  messageElement.classList.remove("opacity-0", "pointer-events-none");
  messageElement.classList.add("opacity-100");

  setTimeout(() => {
    messageElement.classList.remove("opacity-100");
    messageElement.classList.add("opacity-0");

    setTimeout(() => {
      messageElement.classList.add("pointer-events-none");
    }, 500);
  }, 3000);
};

// ============================================================
// FUNÇÕES DE META
// ============================================================

/**
 * Alterna entre modo de edição e visualização da meta
 * @param {boolean} isEditing - Se está editando ou visualizando
 */
const toggleGoalEdit = (isEditing) => {
  if (isEditing) {
    goalDisplaySection.classList.add("hidden");
    goalInputSection.classList.remove("hidden");

    goalAmountInput.value = currentGoal > 0 ? currentGoal.toFixed(2) : "";
    goalDescriptionInput.value = currentDescription;
    goalDeadlineInput.value = currentDeadline;
    goalStartDateInput.value = currentStartDate;

    goalSectionTitle.textContent = "Editar Meta Atual";
  } else {
    goalInputSection.classList.add("hidden");
    goalDisplaySection.classList.remove("hidden");

    if (currentGoal === 0) {
      goalSectionTitle.textContent = "Definir Nova Meta";
    } else {
      goalSectionTitle.textContent = "Meta Atual Definida";
    }

    displayGoalAmount.textContent = formatCurrency(currentGoal);
    displayGoalDescription.textContent =
      currentDescription || "Sem descrição definida.";

    let deadlineText = "";
    if (currentStartDate) {
      deadlineText = `Início: ${formatDate(currentStartDate)}`;
    }
    if (currentDeadline) {
      deadlineText +=
        (deadlineText ? " | " : "") +
        `Data de fim: ${formatDate(currentDeadline)}`;
    } else {
      deadlineText += (deadlineText ? " | " : "") + "Prazo não definido";
    }

    displayGoalDeadline.textContent = deadlineText;
  }
};

/**
 * Salva a meta definida pelo usuário
 */
const saveGoal = () => {
  const newGoalAmount = parseFloat(goalAmountInput.value);
  const newGoalDescription = goalDescriptionInput.value.trim();
  const newGoalDeadline = goalDeadlineInput.value;
  const newGoalStartDate = goalStartDateInput.value;

  if (isNaN(newGoalAmount) || newGoalAmount <= 0) {
    alert("Por favor, insira um valor de meta válido (maior que zero).");
    return;
  }
  if (
    newGoalStartDate &&
    newGoalDeadline &&
    new Date(newGoalStartDate) >= new Date(newGoalDeadline)
  ) {
    alert("A Data de Início deve ser anterior à Data Limite.");
    return;
  }

  currentGoal = newGoalAmount;
  currentDescription = newGoalDescription;
  currentDeadline = newGoalDeadline;
  currentStartDate = newGoalStartDate;

  saveData();
  updateGoalUI();
  toggleGoalEdit(false);

  alert(`Meta atualizada para ${formatCurrency(newGoalAmount)} com sucesso!`);
};

// ============================================================
// FUNÇÕES DE CÁLCULO DE PRAZO
// ============================================================

/**
 * Calcula e exibe dias restantes e duração total
 * @param {number} remainingAmount - Valor restante da meta
 */
const calculateDeadline = (remainingAmount) => {
  const ONE_DAY = 1000 * 60 * 60 * 24;

  // Calcula duração total
  let totalDuration = "--";
  if (currentStartDate && currentDeadline) {
    const start = new Date(currentStartDate).getTime();
    const deadline = new Date(currentDeadline).getTime();
    totalDuration = Math.ceil((deadline - start) / ONE_DAY);
    if (totalDuration < 0) totalDuration = "Inválida";
  }
  duracaoTotalCard.textContent = totalDuration;

  // Calcula dias restantes
  if (!currentDeadline || currentGoal === 0) {
    diasRestantesCard.textContent = "--";
    return;
  }

  const deadlineDate = new Date(currentDeadline);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  deadlineDate.setHours(0, 0, 0, 0);

  let diffDays = Math.ceil(
    (deadlineDate.getTime() - today.getTime()) / ONE_DAY
  );

  if (diffDays <= 0) {
    diffDays = deadlineDate.getTime() < today.getTime() ? "Expirado" : "Hoje";
  }

  diasRestantesCard.textContent = diffDays;

  // Estilização baseada nos dias restantes
  diasRestantesCard.classList.remove(
    "text-red-600",
    "text-yellow-400",
    "text-red-400"
  );
  if (diffDays === "Expirado") {
    diasRestantesCard.classList.add("text-red-600");
  } else if (diffDays !== "Hoje" && diffDays <= 7 && diffDays > 0) {
    diasRestantesCard.classList.add("text-yellow-400");
  } else {
    diasRestantesCard.classList.add("text-red-400");
  }
};

// ============================================================
// FUNÇÕES DE ATUALIZAÇÃO DA INTERFACE
// ============================================================

/**
 * Atualiza toda a interface com base nos dados atuais
 */
const updateGoalUI = () => {
  const savedTotal = deposits.reduce((sum, dep) => sum + dep.amount, 0);
  const remaining = Math.max(0, currentGoal - savedTotal);
  let percentage = currentGoal > 0 ? (savedTotal / currentGoal) * 100 : 0;
  const visualPercentage = Math.min(100, percentage);

  // Atualiza labels
  endLabel.textContent = formatCurrency(currentGoal);
  toggleGoalEdit(currentGoal === 0);

  // Atualiza barra de progresso
  progressBarFill.style.width = `${visualPercentage}%`;
  progressPercentDisplay.textContent = `${percentage.toFixed(1)}%`;

  // Atualiza cards
  savedAmountDisplayTop.textContent = `Arrecadado: ${formatCurrency(
    savedTotal
  )}`;
  metaTotalCard.textContent = formatCurrency(currentGoal);
  valorArrecadadoCard.textContent = formatCurrency(savedTotal);
  percentCompleteCard.textContent = `${percentage.toFixed(1)}%`;
  valorRestanteCard.textContent = formatCurrency(remaining);

  // Estiliza barra de progresso
  if (visualPercentage >= 100) {
    progressBarFill.style.backgroundImage =
      "linear-gradient(to right, #2ecc71, #2ecc71)";
  } else {
    progressBarFill.style.backgroundImage =
      "linear-gradient(to right, #27ae60, #2ecc71)";
  }

  // Atualiza cálculo de prazo
  calculateDeadline(remaining);

  // Renderiza depósitos
  renderDeposits();
};

// ============================================================
// FUNÇÕES DE DEPÓSITOS
// ============================================================

/**
 * Renderiza a lista de depósitos na tabela
 */
const renderDeposits = () => {
  depositsList.innerHTML = "";

  if (deposits.length === 0) {
    depositsList.innerHTML = `
      <tr>
        <td colspan="3" class="text-center text-[#8b949e] py-4">
          Nenhum depósito registrado.
        </td>
      </tr>
    `;
    return;
  }

  deposits.forEach((dep, index) => {
    const row = depositsList.insertRow();
    row.innerHTML = `
      <td>${formatDate(dep.date)}<br>
        <span class="text-xs text-[#8b949e]">${dep.time || "--:--"}</span>
      </td>
      <td>
        <span class="value-saved font-bold">${formatCurrency(
          dep.amount
        )}</span><br>
        <span class="text-xs text-[#8b949e]">${
          dep.description || "Sem descrição"
        }</span>
      </td>
      <td>
        <button onclick="openEditModal(${index})" class="text-blue-400 hover:text-blue-300 text-sm font-semibold mr-2">
          Editar
        </button>
        <button onclick="deleteDeposit(${index})" class="text-red-500 hover:text-red-400 text-sm font-semibold">
          Excluir
        </button>
      </td>
    `;
  });
};

/**
 * Adiciona um novo depósito
 * @param {Event} event - Evento do formulário
 */
const addDeposit = (event) => {
  event.preventDefault();

  const depositAmountInput = document.getElementById("deposit-amount");
  const depositDateInput = document.getElementById("deposit-date");
  const depositDescriptionInput = document.getElementById(
    "deposit-description"
  );

  const amount = parseFloat(depositAmountInput.value);
  const date = depositDateInput.value;
  const description = depositDescriptionInput.value.trim();
  const time = getCurrentTime();

  if (currentGoal === 0) {
    alert(
      "Recomendamos definir um valor para sua meta antes de adicionar um depósito, para acompanhar o progresso."
    );
  }

  deposits.push({ amount, date, time, description });
  saveData();

  depositForm.reset();
  document.getElementById("deposit-date").value = new Date()
    .toISOString()
    .split("T")[0];

  updateGoalUI();
  showSuccessMessage("Depósito Adicionado com Sucesso!");
};

/**
 * Exclui um depósito
 * @param {number} index - Índice do depósito a ser excluído
 */
const deleteDeposit = (index) => {
  if (confirm("Tem certeza que deseja excluir este depósito?")) {
    deposits.splice(index, 1);
    saveData();
    updateGoalUI();
    showSuccessMessage("Depósito Excluído com Sucesso!");
  }
};

/**
 * Limpa todos os depósitos
 */
const clearAllDeposits = () => {
  if (deposits.length === 0) {
    alert("O histórico de transações já está vazio.");
    return;
  }

  const confirmation = confirm(
    "🚨 AVISO: Você tem certeza que deseja EXCLUIR PERMANENTEMENTE TODAS as transações de depósito? \n\nEsta ação não pode ser desfeita e zerará o seu 'Valor Arrecadado'."
  );

  if (confirmation) {
    deposits = [];
    saveData();
    updateGoalUI();
    showSuccessMessage("Histórico de Transações Limpo com Sucesso!");
  }
};

// ============================================================
// FUNÇÕES DE EDIÇÃO DE DEPÓSITOS (MODAL)
// ============================================================

/**
 * Abre o modal de edição de depósito
 * @param {number} index - Índice do depósito a ser editado
 */
const openEditModal = (index) => {
  const deposit = deposits[index];

  document.getElementById("edit-deposit-index").value = index;
  document.getElementById("edit-amount").value = deposit.amount.toFixed(2);
  document.getElementById("edit-date").value = deposit.date;
  document.getElementById("edit-time").value = deposit.time || getCurrentTime();
  document.getElementById("edit-description").value = deposit.description || "";

  editModal.classList.remove("hidden");
};

/**
 * Fecha o modal de edição
 */
const closeEditModal = () => {
  editModal.classList.add("hidden");
};

/**
 * Salva as alterações do depósito editado
 * @param {Event} event - Evento do formulário
 */
const saveEditedDeposit = (event) => {
  event.preventDefault();

  const index = parseInt(document.getElementById("edit-deposit-index").value);
  const newAmount = parseFloat(document.getElementById("edit-amount").value);
  const newDate = document.getElementById("edit-date").value;
  const newTime = document.getElementById("edit-time").value;
  const newDescription = document
    .getElementById("edit-description")
    .value.trim();

  if (isNaN(newAmount) || newAmount <= 0 || !newDate || !newTime) {
    alert(
      "Por favor, preencha todos os campos obrigatórios (Valor, Data, Hora)."
    );
    return;
  }

  deposits[index].amount = newAmount;
  deposits[index].date = newDate;
  deposits[index].time = newTime;
  deposits[index].description = newDescription;

  saveData();
  updateGoalUI();
  closeEditModal();
  showSuccessMessage("Depósito Editado com Sucesso!");
};


/**
 * Configura o sistema de abas
 */
const setupTabs = () => {
  const tabButtons = document.querySelectorAll(".tab-button");
  const tabContents = document.querySelectorAll(".tab-content");

  tabButtons.forEach((button) => {
    button.addEventListener("click", () => {
      const targetTab = button.dataset.tab;

      // Atualiza botões
      tabButtons.forEach((btn) => {
        btn.classList.remove("active");
        btn.classList.add("inactive-tab");
      });

      button.classList.add("active");
      button.classList.remove("inactive-tab");

      // Atualiza conteúdo
      tabContents.forEach((content) => {
        content.classList.add("hidden");
      });
      document.getElementById(`tab-${targetTab}`).classList.remove("hidden");

     
  
    });
  });
};


/**
 * Atualiza o display da calculadora
 */
const updateDisplay = () => {
  if (currentInput === currentExpression.replace(",", ".")) {
    calcDisplay.textContent = currentExpression.replace(".", ",");
    calcExpression.textContent = "";
  } else {
    calcExpression.textContent = currentInput
      .replace(/\*/g, "x")
      .replace(/\//g, "÷");
    const parts = currentInput.split(/[\+\-\*\/%]/).filter((p) => p.length > 0);
    const displayValue = parts.length > 0 ? parts[parts.length - 1] : "0";
    calcDisplay.textContent = displayValue.replace(".", ",");
  }

  if (currentInput === "0") {
    calcDisplay.textContent = "0";
    calcExpression.textContent = "";
  }
};

/**
 * Abre o modal de informações beta
 */
const openBetaModal = () => {
  card.classList.add("show");
  overlay.classList.add("show");
};

/**
 * Fecha o modal de informações beta
 */
const closeBetaModal = () => {
  card.classList.remove("show");
  overlay.classList.remove("show");
};


/**************************************************
 * CONFIG
 **************************************************/
const STORAGE_KEY = "meta_up_data";

/**************************************************
 * SALVAR DADOS NO DISPOSITIVO (JSON)
 **************************************************/
const saveData = () => {
  const data = {
    goalAmount: currentGoal,
    goalDescription: currentDescription,
    goalDeadline: currentDeadline,
    goalStartDate: currentStartDate,
    deposits,
    app: "Meta_up",
    savedAt: new Date().toISOString(),
  };

  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
};

/**************************************************
 * CARREGAR DADOS DO DISPOSITIVO (AUTO)
 **************************************************/
const loadData = () => {
  const savedData = localStorage.getItem(STORAGE_KEY);
  if (!savedData) return;

  try {
    const data = JSON.parse(savedData);

    if (data.app !== "Meta_up") return;

    currentGoal = data.goalAmount || 0;
    currentDescription = data.goalDescription || "";
    currentDeadline = data.goalDeadline || "";
    currentStartDate = data.goalStartDate || "";
    deposits = data.deposits || [];
  

    updateGoalUI();
    renderHistory();
    toggleGoalEdit(currentGoal === 0);
  } catch (err) {
    console.error("Erro ao carregar dados:", err);
  }
};



/**************************************************
 * EXPORTAR BACKUP (OPCIONAL)
 **************************************************/
const exportData = () => {
  const data = {
    goalAmount: currentGoal,
    goalDescription: currentDescription,
    goalDeadline: currentDeadline,
    goalStartDate: currentStartDate,
    deposits,
    exportedAt: new Date().toISOString(),
    app: "Meta_up",

  ///==============================///
  message: "Obrigado por confiar no Meta_up. Backup dos seus dados. Guarde com cuidado."


  };

  const blob = new Blob([JSON.stringify(data, null, 2)], {
    type: "application/json",
  });

  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");

  a.href = url;
  a.download = "meta_up-backup.json";
  document.body.appendChild(a);
  a.click();

  document.body.removeChild(a);
  URL.revokeObjectURL(url);

  showSuccessMessage("Backup exportado com sucesso!");
};

/**************************************************
 * IMPORTAR BACKUP (OPCIONAL)
 **************************************************/
const importData = (event) => {
  const file = event.target.files[0];
  if (!file) return;

  const reader = new FileReader();

  reader.onload = (e) => {
    try {
      const data = JSON.parse(e.target.result);

      // ✅ validação correta
      if (!data.name || !data.name.includes("Meta_up")) {
        alert("❌ Arquivo inválido para este sistema.");
        return;
      }

      currentGoal = data.goalAmount || 0;
      currentDescription = data.goalDescription || "";
      currentDeadline = data.goalDeadline || "";
      currentStartDate = data.goalStartDate || "";
      deposits = data.deposits || [];

      saveData();
      updateGoalUI();
      renderHistory();
      toggleGoalEdit(currentGoal === 0);

      showSuccessMessage("✅ Dados importados com sucesso!");
    } catch (err) {
      console.error("Erro ao importar:", err);
      alert("❌ Erro ao importar o arquivo.\nVerifique se ele é um backup válido.");
    }
  };

  reader.readAsText(file);
};

/**************************************************
 * RESETAR DADOS (OPCIONAL)
 **************************************************/
const resetData = () => {
  if (!confirm("Deseja apagar todos os dados?")) return;

  localStorage.removeItem(STORAGE_KEY);

  currentGoal = 0;
  currentDescription = "";
  currentDeadline = "";
  currentStartDate = "";
  deposits = [];
 

  updateGoalUI();
  renderHistory();
  toggleGoalEdit(true);

  showSuccessMessage("Dados apagados com sucesso!");
};

/**************************************************
 * AUTO LOAD AO ABRIR O APP
 **************************************************/
window.addEventListener("load", loadData);



// ============================================================
// BLOQUEIO DE ZOOM (REMOVIDO - Função não presente no HTML)
// ============================================================
// O código de bloqueio de zoom foi removido pois não há referências
// no HTML fornecido para essa funcionalidade

// ============================================================
// INICIALIZAÇÃO
// ============================================================

/**
 * Inicializa a aplicação
 */
const initializeApp = () => {
  // Configura data atual no input de depósito
  const depositDateInput = document.getElementById("deposit-date");
  const today = new Date().toISOString().split("T")[0];
  if (depositDateInput && !depositDateInput.value) {
    depositDateInput.value = today;
  }

  // Carrega dados
  loadData();

  // Configura abas
  setupTabs();

  // Event listeners
  saveGoalBtn.addEventListener("click", saveGoal);
  depositForm.addEventListener("submit", addDeposit);
  editForm.addEventListener("submit", saveEditedDeposit);

  // Configura modal beta
  if (openBtn && closeBtn && card && overlay) {
    openBtn.addEventListener("click", openBetaModal);
    closeBtn.addEventListener("click", closeBetaModal);
    overlay.addEventListener("click", closeBetaModal);
  }

  // Inicializa display da calculadora
  updateDisplay();
};

// ============================================================
// EXPORTAÇÃO DE FUNÇÕES PARA O HTML
// ============================================================

// Torna as funções globais para serem acessadas pelo HTML
window.toggleGoalEdit = toggleGoalEdit;
window.deleteDeposit = deleteDeposit;
window.openEditModal = openEditModal;
window.closeEditModal = closeEditModal;
window.clearAllDeposits = clearAllDeposits;
window.exportData = exportData;
window.importData = importData;
window.openBetaModal = openBetaModal;
window.closeBetaModal = closeBetaModal;

// ============================================================
// EXECUÇÃO DA APLICAÇÃO
// ============================================================

// Inicializa quando o DOM estiver carregado
document.addEventListener("DOMContentLoaded", initializeApp);
const migrateBackupData = (data) => {
  let migrated = { ...data };

  /* ===============================
     MIGRAÇÃO <= 2.1.x
     =============================== */
  if (!migrated.goalStartDate) {
    migrated.goalStartDate = "";
  }

  /* ===============================
     MIGRAÇÃO <= 2.2.0
     =============================== */
  if (!Array.isArray(migrated.calcHistory)) {
    migrated.calcHistory = [];
  }

  if (!Array.isArray(migrated.deposits)) {
    migrated.deposits = [];
  }

  /* ===============================
     GARANTIAS FINAIS
     =============================== */
  migrated.app = APP_NAME;
  migrated.version = APP_VERSION;

  return migrated;
};
