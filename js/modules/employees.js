// ============================================================================
// MÓDULO DE GESTÃO DE FUNCIONÁRIOS, COLABORADORES E DIARISTAS
// Armazenamento Direto no Banco de Dados Supabase (PostgreSQL)
// DK Revestimentos
// ============================================================================

let currentEmployeeFilter = "Todos";

function filterEmployees(status, btn) {
  currentEmployeeFilter = status;
  document.querySelectorAll("#employeeFiltersBar .filter-btn").forEach(b => b.classList.remove("active"));
  if (btn) btn.classList.add("active");
  renderEmployees(db.employees);
}

// Carrega os funcionários diretamente da tabela 'employees' do banco de dados
async function loadEmployeesFromDb() {
  renderEmployees(db.employees);
  if (typeof sbClient !== "undefined" && sbClient) {
    try {
      const { data, error } = await sbClient.from("employees").select("*").order("id", { ascending: false });
      if (!error && data) {
        db.employees = data.map(item => ({
          id: item.id,
          nome: item.nome,
          cargo: item.cargo,
          telefone: item.telefone,
          chavePix: item.chave_pix,
          diariaPadrao: parseFloat(item.diaria_padrao) || 0,
          status: item.status || "Ativo",
          contratoNome: item.contrato_nome,
          contratoData: item.contrato_url || "",
          dataCadastro: item.created_at ? new Date(item.created_at).toLocaleDateString("pt-BR") : ""
        }));
        renderEmployees(db.employees);
      } else if (error) {
        console.warn("Aviso ao buscar tabela employees no Supabase:", error.message);
      }
    } catch (err) {
      console.warn("Exceção ao buscar colaboradores:", err);
    }
  }
}

// Alterna o formulário de cadastro (abre somente no clique do botão)
function toggleEmployeeForm(forceOpen = false) {
  const card = document.getElementById("employeeDirectCard");
  const btn = document.getElementById("btnToggleEmployeeForm");
  if (!card) {
    openNewEmployeeModal();
    return;
  }

  const isClosed = (card.style.display === "none" || card.style.display === "");
  if (forceOpen || isClosed) {
    card.style.display = "block";
    if (btn) {
      btn.innerHTML = "<span>✕ Fechar Formulário</span>";
      btn.className = "btn btn-outline";
    }
    const nomeInput = document.getElementById("directEmpNome");
    if (nomeInput) {
      setTimeout(() => {
        card.scrollIntoView({ behavior: "smooth", block: "start" });
        nomeInput.focus();
      }, 100);
    }
  } else {
    card.style.display = "none";
    if (btn) {
      btn.innerHTML = "<span>➕ Adicionar Funcionário</span>";
      btn.className = "btn btn-primary";
    }
  }
}

function openNewEmployeeModal() {
  toggleEmployeeForm(true);
}

function editEmployee(empId) {
  const emp = (db.employees || []).find(e => e.id == empId);
  if (!emp) return;

  const form = document.getElementById("employeeForm");
  if (form) form.reset();
  document.getElementById("empId").value = emp.id;
  document.getElementById("empNome").value = emp.nome || "";
  document.getElementById("empCargo").value = emp.cargo || "Marceneiro";
  document.getElementById("empTelefone").value = emp.telefone || "";
  document.getElementById("empPix").value = emp.chavePix || "";
  document.getElementById("empDiaria").value = emp.diariaPadrao || 0;
  document.getElementById("empStatus").value = emp.status || "Ativo";
  document.getElementById("empExistingContratoData").value = emp.contratoData || "";
  document.getElementById("empExistingContratoNome").value = emp.contratoNome || "";

  const preview = document.getElementById("empContratoPreview");
  if (preview) {
    if (emp.contratoData) {
      preview.innerHTML = `
        <div style="display: flex; align-items: center; gap: 8px; font-size: 12.5px; color: var(--wood-primary); font-weight: 600;">
          <span>📄 ${emp.contratoNome || "Contrato Anexado"}</span>
          <button type="button" class="btn btn-outline btn-sm" style="padding: 2px 8px; font-size: 11px;" onclick="viewEmployeeContract('${emp.id}')">Ver Arquivo</button>
        </div>
      `;
    } else {
      preview.innerHTML = `<span style="color: var(--text-muted); font-size: 12px;">Nenhum contrato anexado anteriormente</span>`;
    }
  }

  document.getElementById("employeeModalTitle").textContent = `Editar Funcionário: ${emp.nome}`;
  openModal("employeeModal");
}

// Gravação direta no Supabase (Padrão Oficial do Banco de Dados)
async function handleDirectEmployeeSubmit(e) {
  if (e) {
    e.preventDefault();
    e.stopPropagation();
  }

  const submitBtn = e && e.target ? e.target.querySelector('button[type="submit"]') : null;
  const originalBtnText = submitBtn ? submitBtn.innerHTML : "";

  try {
    const nomeEl = document.getElementById("directEmpNome");
    const cargoEl = document.getElementById("directEmpCargo");
    const telEl = document.getElementById("directEmpTelefone");
    const pixEl = document.getElementById("directEmpPix");
    const diariaEl = document.getElementById("directEmpDiaria");
    const statusEl = document.getElementById("directEmpStatus");
    const fileInput = document.getElementById("directEmpContratoFile");

    const nome = nomeEl ? nomeEl.value.trim() : "";
    const cargo = cargoEl ? cargoEl.value.trim() : "Marceneiro";
    const telefone = telEl ? telEl.value.trim() : "";
    const chavePix = pixEl ? pixEl.value.trim() : "";
    const diariaPadrao = diariaEl ? (parseFloat(diariaEl.value) || 0) : 0;
    const status = statusEl ? statusEl.value : "Ativo";

    if (!nome) {
      showToast("Por favor, informe o nome completo do funcionário.", "warning");
      return;
    }
    if (!chavePix) {
      showToast("Por favor, informe a Chave PIX do colaborador.", "warning");
      return;
    }

    if (submitBtn) {
      submitBtn.disabled = true;
      submitBtn.innerHTML = "<span>Gravando no banco...</span>";
    }

    let contratoData = "";
    let contratoNome = "";

    if (fileInput && fileInput.files && fileInput.files[0]) {
      const file = fileInput.files[0];
      contratoNome = file.name;
      try {
        contratoData = await new Promise((resolve) => {
          const reader = new FileReader();
          reader.onload = () => resolve(reader.result);
          reader.onerror = () => resolve("");
          reader.readAsDataURL(file);
        });
      } catch (err) {
        console.warn("Erro ao ler anexo:", err);
      }
    }

    const payload = {
      nome,
      cargo,
      telefone,
      chave_pix: chavePix,
      diaria_padrao: diariaPadrao,
      status,
      contrato_nome: contratoNome,
      contrato_url: contratoData
    };

    // 1. Gravação direta no Supabase
    if (typeof sbClient !== "undefined" && sbClient) {
      const { data, error } = await sbClient.from("employees").insert([payload]).select();

      if (error) {
        console.warn("Aviso Supabase ao salvar funcionário:", error.message);
        
        // Se a tabela ainda não foi criada no Supabase, mantém o registro na sessão para o usuário não perder o trabalho
        const isTableMissing = error.message && (error.message.includes("schema cache") || error.message.includes("does not exist") || error.code === "42P01");
        
        const localEmp = {
          id: Date.now(),
          nome,
          cargo,
          telefone,
          chavePix,
          diariaPadrao,
          status,
          contratoData,
          contratoNome,
          dataCadastro: new Date().toLocaleDateString("pt-BR")
        };
        db.employees.unshift(localEmp);

        if (isTableMissing) {
          showToast(`Funcionário "${nome}" salvo localmente! (Aviso: crie a tabela 'employees' no SQL do Supabase)`, "warning", 6000);
        } else {
          showToast(`Funcionário salvo localmente (Erro banco: ${error.message})`, "warning", 5000);
        }

        const form = document.getElementById("directEmployeeForm");
        if (form) form.reset();
        toggleEmployeeForm(false);
        renderEmployees(db.employees);
        return;
      }

      if (data && data[0]) {
        const createdEmp = {
          id: data[0].id,
          nome: data[0].nome,
          cargo: data[0].cargo,
          telefone: data[0].telefone,
          chavePix: data[0].chave_pix,
          diariaPadrao: parseFloat(data[0].diaria_padrao) || 0,
          status: data[0].status || "Ativo",
          contratoNome: data[0].contrato_nome,
          contratoData: data[0].contrato_url || "",
          dataCadastro: new Date().toLocaleDateString("pt-BR")
        };
        db.employees.unshift(createdEmp);
      }
    } else {
      // Modo offline/local
      const localEmp = {
        id: Date.now(),
        nome,
        cargo,
        telefone,
        chavePix,
        diariaPadrao,
        status,
        contratoData,
        contratoNome,
        dataCadastro: new Date().toLocaleDateString("pt-BR")
      };
      db.employees.unshift(localEmp);
    }

    // 2. Limpar formulário, fechar e renderizar lista atualizada
    const form = document.getElementById("directEmployeeForm");
    if (form) form.reset();
    toggleEmployeeForm(false);

    renderEmployees(db.employees);
    showToast(`Funcionário "${nome}" gravado com sucesso no banco de dados!`, "success");

  } catch (err) {
    console.error("Exceção ao salvar funcionário:", err);
    showToast("Erro inesperado ao salvar: " + err.message, "error");
  } finally {
    if (submitBtn) {
      submitBtn.disabled = false;
      submitBtn.innerHTML = originalBtnText;
    }
  }
}

// Modal de edição/cadastro
async function handleEmployeeSubmit(e) {
  if (e) {
    e.preventDefault();
    e.stopPropagation();
  }

  const submitBtn = e && e.target ? e.target.querySelector('button[type="submit"]') : null;
  const originalBtnText = submitBtn ? submitBtn.innerHTML : "";

  try {
    const id = document.getElementById("empId").value;
    const nome = document.getElementById("empNome").value.trim();
    const cargo = document.getElementById("empCargo").value.trim();
    const telefone = document.getElementById("empTelefone").value.trim();
    const chavePix = document.getElementById("empPix").value.trim();
    const diariaPadrao = parseFloat(document.getElementById("empDiaria").value) || 0;
    const status = document.getElementById("empStatus").value;

    const fileInput = document.getElementById("empContratoFile");
    let contratoData = document.getElementById("empExistingContratoData").value;
    let contratoNome = document.getElementById("empExistingContratoNome").value;

    if (fileInput && fileInput.files && fileInput.files[0]) {
      const file = fileInput.files[0];
      contratoNome = file.name;
      try {
        contratoData = await new Promise((resolve) => {
          const reader = new FileReader();
          reader.onload = () => resolve(reader.result);
          reader.onerror = () => resolve("");
          reader.readAsDataURL(file);
        });
      } catch (err) {
        console.warn(err);
      }
    }

    if (!nome) {
      showToast("Por favor, informe o nome do funcionário.", "warning");
      return;
    }

    if (submitBtn) {
      submitBtn.disabled = true;
      submitBtn.innerHTML = "<span>Salvando no banco...</span>";
    }

    const payload = {
      nome,
      cargo,
      telefone,
      chave_pix: chavePix,
      diaria_padrao: diariaPadrao,
      status,
      contrato_nome: contratoNome,
      contrato_url: contratoData
    };

    if (typeof sbClient !== "undefined" && sbClient) {
      if (id) {
        const { error } = await sbClient.from("employees").update(payload).eq("id", id);
        if (error) {
          console.warn("Aviso ao atualizar no Supabase:", error.message);
          const isTableMissing = error.message && (error.message.includes("schema cache") || error.message.includes("does not exist") || error.code === "42P01");
          
          // Atualiza na sessão para não travar o usuário
          const empIndex = db.employees.findIndex(e => e.id == id);
          if (empIndex !== -1) {
            db.employees[empIndex] = {
              ...db.employees[empIndex],
              nome,
              cargo,
              telefone,
              chavePix,
              diariaPadrao,
              status,
              contratoNome,
              contratoData
            };
          }
          closeModal("employeeModal");
          renderEmployees(db.employees);

          if (isTableMissing) {
            showToast(`Dados de "${nome}" atualizados na sessão. Execute o SQL no Supabase para ativar a tabela.`, "warning", 6000);
          } else {
            showToast(`Atualizado na sessão (Aviso banco: ${error.message})`, "warning", 5000);
          }
          return;
        }
        const empIndex = db.employees.findIndex(e => e.id == id);
        if (empIndex !== -1) {
          db.employees[empIndex] = {
            ...db.employees[empIndex],
            nome,
            cargo,
            telefone,
            chavePix,
            diariaPadrao,
            status,
            contratoNome,
            contratoData
          };
        }
      } else {
        const { data, error } = await sbClient.from("employees").insert([payload]).select();
        if (error) {
          showToast("Erro ao gravar no banco: " + error.message, "error");
          return;
        }
        if (data && data[0]) {
          db.employees.unshift({
            id: data[0].id,
            nome: data[0].nome,
            cargo: data[0].cargo,
            telefone: data[0].telefone,
            chavePix: data[0].chave_pix,
            diariaPadrao: parseFloat(data[0].diaria_padrao) || 0,
            status: data[0].status,
            contratoNome: data[0].contrato_nome,
            contratoData: data[0].contrato_url || "",
            dataCadastro: new Date().toLocaleDateString("pt-BR")
          });
        }
      }
    } else {
      if (id) {
        const empIndex = db.employees.findIndex(e => e.id == id);
        if (empIndex !== -1) {
          db.employees[empIndex] = {
            ...db.employees[empIndex],
            nome,
            cargo,
            telefone,
            chavePix,
            diariaPadrao,
            status,
            contratoNome,
            contratoData
          };
        }
      } else {
        db.employees.unshift({
          id: Date.now(),
          nome,
          cargo,
          telefone,
          chavePix,
          diariaPadrao,
          status,
          contratoNome,
          contratoData,
          dataCadastro: new Date().toLocaleDateString("pt-BR")
        });
      }
    }

    closeModal("employeeModal");
    renderEmployees(db.employees);
    showToast("Funcionário salvo no banco com sucesso!", "success");

  } catch (err) {
    showToast("Erro ao processar: " + err.message, "error");
  } finally {
    if (submitBtn) {
      submitBtn.disabled = false;
      submitBtn.innerHTML = originalBtnText;
    }
  }
}

async function deleteEmployee(empId) {
  const emp = (db.employees || []).find(e => e.id == empId);
  const nomeEmp = emp ? emp.nome : "este funcionário";

  const confirmado = await customConfirm(
    `Tem certeza que deseja excluir "${nomeEmp}" do banco de dados?\n\nEsta ação removerá o registro do colaborador no Supabase.`,
    "Excluir Funcionário do Banco",
    { danger: true, confirmText: "Sim, Excluir do Banco" }
  );

  if (!confirmado) return;

  if (typeof sbClient !== "undefined" && sbClient) {
    try {
      const { error } = await sbClient.from("employees").delete().eq("id", empId);
      if (error) console.warn("Aviso ao excluir do banco:", error.message);
    } catch (err) {
      console.warn(err);
    }
  }

  db.employees = (db.employees || []).filter(e => e.id != empId);
  renderEmployees(db.employees);
  showToast("Funcionário excluído com sucesso!", "success");
}

function viewEmployeeContract(empId) {
  const emp = (db.employees || []).find(e => e.id == empId);
  if (!emp || !emp.contratoData) {
    showToast("Nenhum contrato anexado para este colaborador.", "info");
    return;
  }

  const win = window.open();
  if (win) {
    if (emp.contratoData.startsWith("data:application/pdf")) {
      win.document.write(`<iframe src="${emp.contratoData}" style="width:100%; height:100%; border:none;"></iframe>`);
    } else if (emp.contratoData.startsWith("data:image")) {
      win.document.write(`<div style="display:flex; justify-content:center; align-items:center; min-height:100vh; background:#111;"><img src="${emp.contratoData}" style="max-width:100%; max-height:100vh; object-fit:contain;"/></div>`);
    } else {
      const a = document.createElement("a");
      a.href = emp.contratoData;
      a.download = emp.contratoNome || "contrato_trabalho";
      a.click();
    }
  } else {
    showToast("Permita popups no navegador para visualizar o anexo.", "warning");
  }
}

function renderEmployees(employees) {
  const container = document.getElementById("employeesList");
  if (!container) return;
  container.innerHTML = "";

  const emps = Array.isArray(employees) ? employees : (db.employees || []);
  const totalTxt = document.getElementById("employeesTotalTxt");
  const filteredEmployees = currentEmployeeFilter === "Todos"
    ? emps
    : emps.filter(e => e.status === currentEmployeeFilter);

  if (totalTxt) {
    totalTxt.textContent = `${filteredEmployees.length} de ${emps.length} colaboradores no banco`;
  }

  if (filteredEmployees.length === 0) {
    container.innerHTML = `
      <div style="grid-column: 1/-1; text-align: center; padding: 45px 20px; background: #ffffff; border-radius: var(--radius); border: 2px dashed var(--border-soft); box-shadow: var(--shadow-subtle);">
        <div style="font-size: 42px; margin-bottom: 10px;">👷</div>
        <h4 style="font-size: 18px; font-weight: 700; color: #0f172a; margin-bottom: 6px;">Nenhum funcionário cadastrado no banco</h4>
        <p style="font-size: 13.5px; color: #64748b; margin-bottom: 22px; max-width: 460px; margin-left: auto; margin-right: auto; line-height: 1.55;">
          Clique no botão acima para adicionar um colaborador com nome, telefone, valor da diária, <strong>chave PIX</strong> e contrato de trabalho diretamente no banco de dados.
        </p>
        <button type="button" class="btn btn-primary" onclick="toggleEmployeeForm(true)" style="font-weight: 700; padding: 12px 26px; font-size: 14.5px; box-shadow: 0 4px 14px rgba(180, 83, 9, 0.3); display: inline-flex; align-items: center; gap: 6px;">
          <span>➕ Adicionar Primeiro Funcionário</span>
        </button>
      </div>
    `;
    return;
  }

  filteredEmployees.forEach(emp => {
    const cleanTel = emp.telefone ? String(emp.telefone).replace(/\D/g, "") : "";
    const waLink = cleanTel ? `https://api.whatsapp.com/send?phone=55${cleanTel}&text=${encodeURIComponent("Olá " + emp.nome + ", tudo bem? Aqui é da DK Revestimentos sobre as escalas de obras.")}` : "#";

    const card = document.createElement("div");
    card.className = "employee-card";
    card.innerHTML = `
      <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 12px;">
        <div>
          <h4 style="font-size: 17px; font-weight: 700; color: #0f172a; margin-bottom: 3px;">${emp.nome}</h4>
          <span class="badge ${emp.status === 'Ativo' ? 'badge-success' : 'badge-neutral'}" style="font-size: 11px;">${emp.status || 'Ativo'}</span>
        </div>
        <span style="font-size: 12px; font-weight: 700; background: #f1f5f9; color: #334155; padding: 4px 8px; border-radius: 6px;">
          ${emp.cargo || "Especialista"}
        </span>
      </div>

      <div style="font-size: 13px; color: #475569; margin-bottom: 14px; line-height: 1.65;">
        <div><strong>📱 WhatsApp:</strong> ${emp.telefone ? `<a href="${waLink}" target="_blank" style="color: var(--wood-primary); font-weight: 600;">${emp.telefone}</a>` : "Não informado"}</div>
        <div style="background: #f8fafc; border: 1px solid var(--border-soft); border-radius: 6px; padding: 7px 10px; margin: 8px 0;">
          <strong style="color: #0f172a;">🔑 Chave PIX:</strong> <span style="font-family: monospace; font-size: 12.5px; font-weight: 700; color: #b45309;">${emp.chavePix || "Não informada"}</span>
        </div>
        <div style="padding-top: 6px; border-top: 1px dashed var(--border-soft); display: flex; justify-content: space-between; align-items: center;">
          <span>Valor da Diária Padrão:</span>
          <strong style="color: var(--wood-primary); font-size: 15px;">R$ ${(emp.diariaPadrao || 0).toLocaleString("pt-BR", {minimumFractionDigits: 2})}</strong>
        </div>
      </div>

      <div style="background: #f8fafc; border: 1px solid var(--border-soft); border-radius: 8px; padding: 10px; margin-bottom: 14px; display: flex; align-items: center; justify-content: space-between;">
        <span style="font-size: 12px; color: var(--text-muted);">Contrato de Trabalho:</span>
        ${emp.contratoData ? `
          <button type="button" class="btn btn-outline btn-sm" style="padding: 3px 8px; font-size: 11.5px; display: inline-flex; align-items: center; gap: 4px;" onclick="viewEmployeeContract('${emp.id}')">
            <span>📄 Ver Anexo</span>
          </button>
        ` : `
          <span style="font-size: 11px; color: #94a3b8; font-style: italic;">Sem anexo</span>
        `}
      </div>

      <div style="display: flex; gap: 8px;">
        <button class="btn btn-outline btn-sm" style="flex: 1;" onclick="editEmployee('${emp.id}')">✏️ Editar</button>
        <button class="btn btn-danger btn-sm" onclick="deleteEmployee('${emp.id}')">Excluir</button>
      </div>
    `;
    container.appendChild(card);
  });
}

window.renderEmployees = renderEmployees;
window.loadEmployeesFromDb = loadEmployeesFromDb;
window.toggleEmployeeForm = toggleEmployeeForm;
window.openNewEmployeeModal = openNewEmployeeModal;
window.editEmployee = editEmployee;
window.handleDirectEmployeeSubmit = handleDirectEmployeeSubmit;
window.handleEmployeeSubmit = handleEmployeeSubmit;
window.deleteEmployee = deleteEmployee;
window.viewEmployeeContract = viewEmployeeContract;
window.filterEmployees = filterEmployees;
