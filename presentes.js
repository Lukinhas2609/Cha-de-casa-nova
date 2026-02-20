// ===== SUPABASE =====
const supabaseUrl = "https://iykaixanyshtbfolqvtr.supabase.co";
const supabaseKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Iml5a2FpeGFueXNodGJmb2xxdnRyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzE2MTE2MzgsImV4cCI6MjA4NzE4NzYzOH0.VgbIzMwyaIwFzWxW3VrLpvsysP__Bq6pj_g7zP5lHwU";
if (typeof supabase === "undefined") {
  console.error("Supabase não carregou! Confira a ordem dos scripts no HTML.");
}

const supabaseClient = supabase.createClient(supabaseUrl, supabaseKey);

// ===== RENDER =====
function renderPresentes(listaEl, presentes) {
  listaEl.innerHTML = "";

  if (!presentes || presentes.length === 0) {
    listaEl.innerHTML = `<p style="color:white;text-align:center;">Nenhum presente cadastrado.</p>`;
    return;
  }

  presentes.forEach((p) => {
    const card = document.createElement("div");
    card.className = "card-presente" + (p.disponivel ? "" : " reservado");

    const titulo = document.createElement("h3");
    titulo.textContent = p.nome_presente;

    const botao = document.createElement("button");
    botao.className = "btn-reservar";
    botao.dataset.presente = p.nome_presente;

    if (p.disponivel) {
      botao.textContent = "Reservar";
      botao.disabled = false;
    } else {
      botao.textContent = p.nome_pessoa ? `Reservado (${p.nome_pessoa})` : "Reservado";
      botao.disabled = true;
    }

    botao.addEventListener("click", async () => {
      await reservarPresente(botao, card, p.nome_presente);
    });

    card.appendChild(titulo);
    card.appendChild(botao);
    listaEl.appendChild(card);
  });
}

async function carregarPresentes() {
  const listaEl = document.getElementById("lista-presentes");
  if (!listaEl) return;

  const { data, error } = await supabaseClient
    .from("presentes")
    .select("nome_presente, disponivel, nome_pessoa")
    .order("nome_presente", { ascending: true });

  if (error) {
    console.error("Erro ao carregar presentes:", error);
    listaEl.innerHTML = `<p style="color:white;text-align:center;">Erro ao carregar presentes.</p>`;
    return;
  }

  renderPresentes(listaEl, data);
}

async function reservarPresente(botao, card, nomePresente) {
  const nomePessoa = prompt("Digite seu nome para reservar:");
  if (!nomePessoa || nomePessoa.trim().length < 3) {
    alert("Digite um nome válido.");
    return;
  }
  if (!confirm("Deseja reservar este presente?")) return;

  botao.disabled = true;
  botao.textContent = "Reservando...";

  try {
    const { data, error } = await supabaseClient
      .from("presentes")
      .update({
        nome_pessoa: nomePessoa.trim(),
        disponivel: false,
        reservado_em: new Date().toISOString(),
      })
      .eq("nome_presente", nomePresente)
      .eq("disponivel", true)
      .select("nome_presente, disponivel, nome_pessoa");

    if (error) throw error;

    if (!data || data.length === 0) {
      alert("Este presente já foi reservado.");
      botao.textContent = "Reservado";
      botao.disabled = true;
      card.classList.add("reservado");
      return;
    }

    // Atualiza UI do card
    card.classList.add("reservado");
    botao.textContent = `Reservado (${data[0].nome_pessoa})`;
    botao.disabled = true;

    alert("Presente reservado com sucesso ❤️");
  } catch (error) {
    console.error("Erro Supabase (completo):", error);
    alert("Erro ao reservar presente: " + (error?.message || "desconhecido"));
    botao.disabled = false;
    botao.textContent = "Reservar";
  }
}

// ===== INIT =====
document.addEventListener("DOMContentLoaded", () => {
  carregarPresentes();

  // opcional: recarrega a lista a cada 10s pra refletir reservas de outras pessoas
  setInterval(carregarPresentes, 10000);
});