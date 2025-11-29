
// --- Referências DOM PRINCIPAIS ---
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

const progressPercentDisplay = document.getElementById(
  "progress-percent-display"
);
const savedAmountDisplayTop = document.getElementById(
  "saved-amount-display-top"
);
const progressBarFill = document.getElementById("progress-bar-fill");
const endLabel = document.getElementById("end-label");
const metaTotalCard = document.getElementById("meta-total-card");
const valorArrecadadoCard = document.getElementById("valor-arrecadado-card");
const percentCompleteCard = document.getElementById("percent-complete-card");
const valorRestanteCard = document.getElementById("valor-restante-card");

const diasRestantesCard = document.getElementById("dias-restantes-card");
const duracaoTotalCard = document.getElementById("duracao-total-card");

// --- Referências DOM DEPÓSITO / MODAL ---
const depositsList = document.getElementById("deposits-list");
const depositForm = document.getElementById("deposit-form");
const editModal = document.getElementById("edit-modal");
const editForm = document.getElementById("edit-form");

// --- Referências DOM CALCULADORA ---
const calcDisplay = document.getElementById("calc-display");
const calcExpression = document.getElementById("calc-expression");
const calcHistoryList = document.getElementById("calc-history-list");
const tabButtonsContainer = document.getElementById("tab-buttons-container");

let currentExpression = "0";
let currentInput = "0";
let history = [];

// --- Estado Inicial (Usando LocalStorage) ---
let currentGoal = 0;
let currentDescription = "";
let currentDeadline = "";
let currentStartDate = "";
let deposits = [];

// Função utilitária para formatar em moeda brasileira
const formatCurrency = (amount) =>
  `R$ ${parseFloat(amount).toFixed(2).replace(".", ",")}`;

// Função utilitária para formatar data (DD/MM/AAAA)
const formatDate = (dateString) => {
  if (!dateString) return "--/--/----";
  const date = new Date(dateString);
  const offsetDate = new Date(
    date.getTime() + date.getTimezoneOffset() * 60000
  );
  return new Intl.DateTimeFormat("pt-BR").format(offsetDate);
};

const getCurrentTime = () => {
  const now = new Date();
  const hours = String(now.getHours()).padStart(2, "0");
  const minutes = String(now.getMinutes()).padStart(2, "0");
  return `${hours}:${minutes}`;
};

// --- Lógica de Bloqueio de Abas (AGORA REMOVIDA) ---
const checkGoalAndControlTabs = (goalAmount) => {
  // A lógica de bloqueio de abas foi desativada para que todas as abas abram livremente.
};

// --- Lógica de Alternância de Seção ---
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

    // Primeiro: início
    if (currentStartDate) {
      deadlineText = `Início: ${formatDate(currentStartDate)}`;
    }

    // Depois: data limite
    if (currentDeadline) {
      // adiciona separador apenas se já tiver texto antes
      deadlineText += (deadlineText ? " | " : "") + `Data de fim: ${formatDate(currentDeadline)}`;
    } else {
      // sem data limite
      deadlineText += (deadlineText ? " | " : "") + "Prazo não definido";
    }

    // Mantém exatamente como estava:
    displayGoalDeadline.textContent = deadlineText;

  }
};

// --- Lógica de Cálculo de Prazo e Duração ---
const calculateDeadline = (remainingAmount) => {
  const ONE_DAY = 1000 * 60 * 60 * 24;

  let totalDuration = "--";
  if (currentStartDate && currentDeadline) {
    const start = new Date(currentStartDate).getTime();
    const deadline = new Date(currentDeadline).getTime();
    totalDuration = Math.ceil((deadline - start) / ONE_DAY);
    if (totalDuration < 0) totalDuration = "Inválida";
  }
  duracaoTotalCard.textContent = totalDuration;

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

  // Estilização do card Dias Restantes
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

// --- Lógica Principal: Cálculo e Atualização da UI ---
const updateGoalUI = () => {
  const savedTotal = deposits.reduce((sum, dep) => sum + dep.amount, 0);
  const remaining = Math.max(0, currentGoal - savedTotal);
  let percentage = currentGoal > 0 ? (savedTotal / currentGoal) * 100 : 0;

  const visualPercentage = Math.min(100, percentage);

  // 1. Atualiza Labels
  endLabel.textContent = formatCurrency(currentGoal);
  toggleGoalEdit(currentGoal === 0);

  // 2. Atualiza Barra de Progresso
  progressBarFill.style.width = `${visualPercentage}%`;
  progressPercentDisplay.textContent = `${percentage.toFixed(1)}%`;

  // 3. Atualiza Cards de Detalhes
  savedAmountDisplayTop.textContent = `Arrecadado: ${formatCurrency(
    savedTotal
  )}`;
  metaTotalCard.textContent = formatCurrency(currentGoal);
  valorArrecadadoCard.textContent = formatCurrency(savedTotal);
  percentCompleteCard.textContent = `${percentage.toFixed(1)}%`;
  valorRestanteCard.textContent = formatCurrency(remaining);

  if (visualPercentage >= 100) {
    progressBarFill.style.backgroundImage =
      "linear-gradient(to right, #2ecc71, #2ecc71)";
  } else {
    progressBarFill.style.backgroundImage =
      "linear-gradient(to right, #27ae60, #2ecc71)";
  }

  // 4. Atualiza Cálculo de Prazo e Duração
  calculateDeadline(remaining);

  // 5. Controle de Abas (Mantido, mas agora vazio)
  checkGoalAndControlTabs(currentGoal);

  renderDeposits();
};

// --- Lógica de Depósitos e Edição ---
const renderDeposits = () => {
  const depositAmountInput = document.getElementById("deposit-amount");
  const depositDateInput = document.getElementById("deposit-date");
  const depositDescriptionInput = document.getElementById(
    "deposit-description"
  );
  depositsList.innerHTML = "";

  if (deposits.length === 0) {
    depositsList.innerHTML =
      '<tr><td colspan="3" class="text-center text-[#8b949e] py-4">Nenhum depósito registrado.</td></tr>';
    return;
  }

  deposits.forEach((dep, index) => {
    const row = depositsList.insertRow();
    row.innerHTML = `
            <td>${formatDate(
      dep.date
    )}<br><span class="text-xs text-[#8b949e]">${dep.time || "--:--"
      }</span></td>
            <td>
                <span class="value-saved font-bold">${formatCurrency(
        dep.amount
      )}</span>
                <br>
                <span class="text-xs text-[#8b949e]">${dep.description || "Sem descrição"
      }</span>
            </td>
            <td>
                <button onclick="openEditModal(${index})" class="text-blue-400 hover:text-blue-300 text-sm font-semibold mr-2">Editar</button>
                <button onclick="deleteDeposit(${index})" class="text-red-500 hover:text-red-400 text-sm font-semibold">Excluir</button>
            </td>
        `;
  });
};

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
    // Mensagem opcional
    alert(
      "Recomendamos definir um valor para sua meta antes de adicionar um depósito, para acompanhar o progresso."
    );
  }

  deposits.push({
    amount,
    date,
    time,
    description,
  });
  saveData();

  depositForm.reset();
  document.getElementById("deposit-date").value = new Date()
    .toISOString()
    .split("T")[0];

  updateGoalUI();
  showSuccessMessage("Depósito Adicionado com Sucesso!");
};

const deleteDeposit = (index) => {
  if (confirm("Tem certeza que deseja excluir este depósito?")) {
    deposits.splice(index, 1);
    saveData();
    updateGoalUI();
    showSuccessMessage("Depósito Excluído com Sucesso!");
  }
};

const openEditModal = (index) => {
  const deposit = deposits[index];

  document.getElementById("edit-deposit-index").value = index;
  document.getElementById("edit-amount").value = deposit.amount.toFixed(2);
  document.getElementById("edit-date").value = deposit.date;
  document.getElementById("edit-time").value = deposit.time || getCurrentTime();
  document.getElementById("edit-description").value = deposit.description || "";

  editModal.classList.remove("hidden");
};

const closeEditModal = () => {
  editModal.classList.add("hidden");
};

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

const showSuccessMessage = (message) => {
  const messageElement = document.getElementById("success-message");

  messageElement.querySelector("p").innerHTML = `
        <svg class="w-6 h-6 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
        ${message}
    `;

  messageElement.classList.remove(
    "opacity-0",
    "translate-y-full",
    "pointer-events-none"
  );
  messageElement.classList.add("opacity-100", "translate-y-0");

  setTimeout(() => {
    messageElement.classList.remove("opacity-100", "translate-y-0");
    messageElement.classList.add("opacity-0", "translate-y-full");

    setTimeout(() => {
      messageElement.classList.add("pointer-events-none");
    }, 500);
  }, 3000);
};

// --- Lógica de Salvar Meta ---
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

  checkGoalAndControlTabs(currentGoal);

  alert(`Meta atualizada para ${formatCurrency(newGoalAmount)} com sucesso!`);
};

// --- Lógica de Persistência (localStorage) ---
const saveData = () => {
  localStorage.setItem("goalAmount", currentGoal);
  localStorage.setItem("goalDescription", currentDescription);
  localStorage.setItem("goalDeadline", currentDeadline);
  localStorage.setItem("goalStartDate", currentStartDate);
  localStorage.setItem("deposits", JSON.stringify(deposits));
  localStorage.setItem("calcHistory", JSON.stringify(history));
};

const loadData = () => {
  currentGoal = parseFloat(localStorage.getItem("goalAmount") || "0");
  currentDescription = localStorage.getItem("goalDescription") || "";
  currentDeadline = localStorage.getItem("goalDeadline") || "";
  currentStartDate = localStorage.getItem("goalStartDate") || "";

  try {
    history = JSON.parse(localStorage.getItem("calcHistory")) || [];
    deposits = JSON.parse(localStorage.getItem("deposits")) || [];
  } catch (e) {
    history = [];
    deposits = [];
  }

  updateGoalUI();
  toggleGoalEdit(currentGoal === 0);
  renderHistory();
};

// --- Lógica das Abas (Tabs) ---
const setupTabs = () => {
  const tabButtons = document.querySelectorAll(".tab-button");
  const tabContents = document.querySelectorAll(".tab-content");

  tabButtons.forEach((button) => {
    button.addEventListener("click", () => {
      const targetTab = button.dataset.tab;

      tabButtons.forEach((btn) => {
        btn.classList.remove("active");
        btn.classList.add("inactive-tab");
      });

      button.classList.add("active");
      button.classList.remove("inactive-tab");

      tabContents.forEach((content) => {
        content.classList.add("hidden");
      });
      document.getElementById(`tab-${targetTab}`).classList.remove("hidden");

      if (targetTab === "calculadora") {
        updateDisplay();
      }
    });
  });
};

// --- Lógica do Histórico da Calculadora ---
// --- Lógica do Histórico da Calculadora ---
const renderHistory = () => {
  calcHistoryList.innerHTML = "";
  if (history.length === 0) {
    calcHistoryList.innerHTML =
      '<p class="text-center text-[#8b949e] py-2" id="empty-history-message">Nenhum cálculo registrado.</p>';
    return;
  }

  history
    .slice()
    .reverse()
    .forEach((item, index) => {
      const historyItem = document.createElement("div");
      historyItem.className = "history-item";
      historyItem.innerHTML = `
            <div class="history-expression">${item.expression
          .replace(/\*/g, "x")
          .replace(/\//g, "÷")}</div>
            <div class="history-result">= ${item.result}</div>
        `;
      historyItem.onclick = () => {
        calcClearAll();
        currentInput = item.result.replace(",", ".");
        updateDisplay();
      };
      calcHistoryList.appendChild(historyItem);
    });
};

const clearHistory = () => {
  if (confirm("Tem certeza que deseja apagar todo o histórico de cálculos?")) {
    history = [];
    saveData();
    renderHistory();
    showSuccessMessage("Histórico de cálculos apagado!");
  }
};


// --- Lógica da Calculadora ---

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

const calcClear = () => {
  currentInput = "0";
  updateDisplay();
};

const calcClearAll = () => {
  currentExpression = "0";
  currentInput = "0";
  updateDisplay();
};

const calcDelete = () => {
  if (currentInput === "0" || currentInput === "") return;

  if (currentInput.length > 1) {
    currentInput = currentInput.slice(0, -1);
  } else {
    currentInput = "0";
  }
  updateDisplay();
};

const calcAppend = (value) => {
  const isOperator = ["+", "-", "*", "/", "%"].includes(value);
  const isDot = value === ".";

  if (currentInput === currentExpression.replace(",", ".")) {
    if (isOperator) {
      currentInput += value;
    } else {
      currentInput = value;
    }
    currentExpression = "";
  } else if (currentInput === "0" && !isOperator && !isDot) {
    currentInput = value;
  } else {
    const lastChar = currentInput.slice(-1);
    const isLastCharOperator = ["+", "-", "*", "/", "%"].includes(lastChar);

    if (isOperator && isLastCharOperator) {
      currentInput = currentInput.slice(0, -1) + value;
    } else if (isDot) {
      const currentNumber = currentInput.split(/[\+\-\*\/%]/g).pop();
      if (currentNumber.includes(".")) {
        return;
      } else if (isLastCharOperator) {
        currentInput += "0.";
      } else {
        currentInput += value;
      }
    } else {
      currentInput += value;
    }
  }

  if (currentInput === "") currentInput = "0";

  updateDisplay();
};

const calcCalculate = () => {
  let finalExpression = currentInput;

  try {
    finalExpression = finalExpression.replace(/[\+\-\*\/%]+$/, "");
    if (finalExpression === "") finalExpression = "0";

    let evaluated = finalExpression;

    // Tratamento da operação de porcentagem
    while (evaluated.includes("%")) {
      const percentMatch = evaluated.match(
        /(\d+\.?\d*)\s*([+\-*\/])\s*(\d+\.?\d*)\s*%/
      );
      if (percentMatch) {
        const [, base, operator, percentage] = percentMatch;
        const baseVal = parseFloat(base);
        const percentVal = parseFloat(percentage);
        let result;

        if (operator === "+") result = baseVal + baseVal * (percentVal / 100);
        else if (operator === "-")
          result = baseVal - baseVal * (percentVal / 100);
        else if (operator === "*") result = baseVal * (percentVal / 100);
        else if (operator === "/") result = baseVal / (percentVal / 100);

        evaluated = evaluated.replace(percentMatch[0], result);
      } else {
        const simplePercentMatch = evaluated.match(/^(\d+\.?\d*)\s*%$/);
        if (simplePercentMatch) {
          evaluated = parseFloat(simplePercentMatch[1]) / 100;
        } else {
          break;
        }
      }
    }

    let result = eval(evaluated);

    if (result === Infinity || isNaN(result)) {
      calcDisplay.textContent = "Erro";
      currentInput = "0";
      currentExpression = "0";
    } else {
      result = parseFloat(result.toFixed(8));

      history.push({
        expression: finalExpression,
        result: result.toLocaleString("pt-BR"),
      });

      if (history.length > 10) {
        history.shift();
      }
      saveData();
      renderHistory();

      currentExpression = result.toLocaleString("pt-BR");
      currentInput = result.toString();
      calcDisplay.textContent = currentExpression;
      calcExpression.textContent =
        finalExpression.replace(/\*/g, "x").replace(/\//g, "÷") + " =";
    }
  } catch (error) {
    calcDisplay.textContent = "Erro";
    calcExpression.textContent =
      finalExpression.replace(/\*/g, "x").replace(/\//g, "÷") + " =";
    currentInput = "0";
    currentExpression = "0";
  }
};

// --- Inicialização ---
document.addEventListener("DOMContentLoaded", () => {
  // Torna as funções globais para o HTML (para serem usadas nos atributos onclick)
  window.toggleGoalEdit = toggleGoalEdit;
  window.deleteDeposit = deleteDeposit;
  window.openEditModal = openEditModal;
  window.closeEditModal = closeEditModal;
  window.calcAppend = calcAppend;
  window.calcClear = calcClear;
  window.calcClearAll = calcClearAll;
  window.calcCalculate = calcCalculate;
  window.calcDelete = calcDelete;
  window.clearHistory = clearHistory;
  window.renderHistory = renderHistory;

  // Define a data atual como padrão no input de depósito
  const depositDateInput = document.getElementById("deposit-date");
  const today = new Date().toISOString().split("T")[0];
  if (depositDateInput && !depositDateInput.value) {
    depositDateInput.value = today;
  }

  loadData();
  setupTabs();

  const saveGoalBtn = document.getElementById("save-goal-btn");
  const editForm = document.getElementById("edit-form");
  const depositForm = document.getElementById("deposit-form");

  saveGoalBtn.addEventListener("click", saveGoal);
  depositForm.addEventListener("submit", addDeposit);
  editForm.addEventListener("submit", saveEditedDeposit);

  updateDisplay();
});
// A função deve estar definida globalmente ou acessível pelo 'onclick' no HTML
const clearAllDeposits = () => {
  // 1. Verifica se há transações para limpar
  if (deposits.length === 0) {
    alert("O histórico de transações já está vazio.");
    return;
  }

  // 2. Mensagem de AVISO e Confirmação
  const confirmation = confirm(
    "🚨 AVISO: Você tem certeza que deseja EXCLUIR PERMANENTEMENTE TODAS as transações de depósito? \n\nEsta ação não pode ser desfeita e zerará o seu 'Valor Arrecadado'."
  );

  // 3. Execução
  if (confirmation) {
    deposits = []; // Limpa o array
    saveData(); // Salva o estado vazio no LocalStorage
    updateGoalUI(); // Atualiza a interface (progresso e lista)
    showSuccessMessage("Histórico de Transações Limpo com Sucesso!");
  }
};

//beta modal
const openBtn = document.getElementById("openCard");
const closeBtn = document.getElementById("closeCard");
const card = document.getElementById("card");
const overlay = document.getElementById("overlay");

// abrir o card
openBtn.addEventListener("click", () => {
  card.classList.add("show");
  overlay.classList.add("show");
});

// fechar o card (botão)
closeBtn.addEventListener("click", () => {
  card.classList.remove("show");
  overlay.classList.remove("show");
});

// fechar ao clicar no fundo
overlay.addEventListener("click", () => {
  card.classList.remove("show");
  overlay.classList.remove("show");
});

//bloqueio de zoom
// no-zoom.js
// Sistema para tentar bloquear zoom (desktop + mobile)

// 1) bloquear Ctrl + roda do mouse (wheel + ctrl)
document.addEventListener('wheel', function(e) {
  if (e.ctrlKey) {
    e.preventDefault();
  }
}, { passive: false });

// 2) bloquear teclas de zoom no teclado (Ctrl + + / - / 0) e Ctrl + Scroll em trackpad
document.addEventListener('keydown', function(e) {
  // algumas variações de teclas: '+' pode ser '=' com shift em muitos teclados
  const isCtrl = e.ctrlKey || e.metaKey; // metaKey para Mac (cmd)
  if (!isCtrl) return;

  const forbidden = [
    '+', // some layouts
    '=', // plus
    '-', 
    '0'
  ];

  // e.key pode ser '+' '/'=' '-' '0' ou 'Equal'/'NumpadAdd' etc.
  if (forbidden.includes(e.key) || e.key === 'NumpadAdd' || e.key === 'NumpadSubtract' || e.key === 'Equal') {
    e.preventDefault();
  }
}, { passive: false });

// 3) bloquear gesto de pinça (touch pinch) - detecta mudança de scale em touchmove (quando disponível)
document.addEventListener('touchmove', function(e) {
  // alguns navegadores expõem e.scale em eventos touchmove (WebKit)
  if (e.scale && e.scale !== 1) {
    e.preventDefault();
  }

  // se houver mais de 1 toque (dois dedos) e distância variar rapidamente -> prevenir
  if (e.touches && e.touches.length > 1) {
    e.preventDefault();
  }
}, { passive: false });

// 4) bloquear double-tap que dá zoom
let lastTouchEnd = 0;
document.addEventListener('touchend', function(e) {
  const now = Date.now();
  if (now - lastTouchEnd <= 300) {
    e.preventDefault();
  }
  lastTouchEnd = now;
}, { passive: false });

// 5) bloquear gesturestart (Safari iOS)
document.addEventListener('gesturestart', function(e) {
  e.preventDefault();
}, { passive: false });

// 6) prevenção extra: impedir zoom por "pinch" via pointer events (quando aplicável)
if (window.PointerEvent) {
  let pointers = new Map();

  window.addEventListener('pointerdown', e => {
    pointers.set(e.pointerId, { x: e.clientX, y: e.clientY });
  });

  window.addEventListener('pointermove', e => {
    if (pointers.size > 1) {
      // se houver múltiplos pointers, prevenimos comportamento para evitar pinch
      e.preventDefault();
    }
  }, { passive: false });

  window.addEventListener('pointerup', e => {
    pointers.delete(e.pointerId);
  });

  window.addEventListener('pointercancel', e => {
    pointers.delete(e.pointerId);
  });
}

// 7) fallback: impedir zoom via dblclick (alguns navegadores)
document.addEventListener('dblclick', function(e) {
  if (e.target) {
    e.preventDefault();
  }
}, { passive: false });

// Info no console (opcional)
console.log('[no-zoom.js] Sistema de prevenção de zoom inicializado');


//sistema scroll
//--------------------------------------------------
// ROLAGEM SUAVE UNIVERSAL (MOUSE + TOUCH)
//--------------------------------------------------

const SCROLL_SPEED = 80;     // Ajuste a velocidade da rolagem
const DURATION = 400;        // Tempo da animação

let targetScroll = window.scrollY;
let isTouching = false;
let lastTouchY = 0;

// Easing para suavidade
function ease(t) {
    return t < 0.5
        ? 4 * t * t * t
        : 1 - Math.pow(-2 * t + 2, 3) / 2;
}

// Animação suave sincronizada com 60/120/144Hz
function animateScroll() {
    const current = window.scrollY;
    const diff = targetScroll - current;

    if (Math.abs(diff) > 1) {
        window.scrollTo(0, current + diff * 0.12); // suavização
        requestAnimationFrame(animateScroll);
    }
}

//--------------------------------------------------
// 1️⃣ Suavizar SCROLL DO MOUSE (rodinha)
//--------------------------------------------------
window.addEventListener("wheel", (e) => {
    e.preventDefault(); // impede o scroll padrão

    targetScroll += e.deltaY > 0 ? SCROLL_SPEED : -SCROLL_SPEED;

    targetScroll = Math.max(0, Math.min(targetScroll, document.body.scrollHeight - window.innerHeight));

    requestAnimationFrame(animateScroll);
}, { passive: false });


//--------------------------------------------------
// 2️⃣ Suavizar SCROLL COM O DEDO (touch move)
//--------------------------------------------------
window.addEventListener("touchstart", (e) => {
    isTouching = true;
    lastTouchY = e.touches[0].clientY;
}, { passive: true });

window.addEventListener("touchmove", (e) => {
    if (!isTouching) return;

    let currentY = e.touches[0].clientY;
    let delta = lastTouchY - currentY; // valor da rolagem

    targetScroll += delta; 

    targetScroll = Math.max(0, Math.min(targetScroll, document.body.scrollHeight - window.innerHeight));

    lastTouchY = currentY;

    e.preventDefault(); // impede scroll padrão
    requestAnimationFrame(animateScroll);
}, { passive: false });

window.addEventListener("touchend", () => {
    isTouching = false;
});

//sistema novo

