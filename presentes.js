// ===== SUPABASE =====
const supabaseUrl = "https://iykaixanyshtbfolqvtr.supabase.co";
const supabaseKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Iml5a2FpeGFueXNodGJmb2xxdnRyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzE2MTE2MzgsImV4cCI6MjA4NzE4NzYzOH0.VgbIzMwyaIwFzWxW3VrLpvsysP__Bq6pj_g7zP5lHwU";

if (typeof supabase === "undefined") {
  console.error("Supabase não carregou! Confira a ordem dos scripts no HTML.");
}

const supabaseClient = supabase.createClient(supabaseUrl, supabaseKey);

// ===== CARREGAR + RENDER POR CATEGORIA =====
async function carregarPresentes() {
  const container = document.getElementById("lista-presentes");
  if (!container) return;

  const { data, error } = await supabaseClient
    .from("presentes")
    .select("nome_presente, disponivel, categoria")
    .order("categoria", { ascending: true })
    .order("nome_presente", { ascending: true });

  if (error) {
    console.error("Erro ao carregar presentes:", error);
    container.innerHTML = '<p style="color:white;text-align:center;">Erro ao carregar presentes.</p>';
    return;
  }

  renderPresentes(container, data);
}

function renderPresentes(container, presentes) {
  container.innerHTML = "";

  if (!presentes || presentes.length === 0) {
    container.innerHTML = '<p style="color:white;text-align:center;">Nenhum presente cadastrado.</p>';
    return;
  }

  // Agrupar por categoria
  const agrupado = {};
  presentes.forEach((p) => {
    const cat = (p.categoria || "Outros").trim();
    if (!agrupado[cat]) agrupado[cat] = [];
    agrupado[cat].push(p);
  });

  Object.keys(agrupado).forEach((categoria) => {
    const tituloCategoria = document.createElement("h2");
    tituloCategoria.className = "titulo-categoria";
    tituloCategoria.textContent = categoria;
    container.appendChild(tituloCategoria);

    const grid = document.createElement("div");
    grid.className = "lista-presentes";

    agrupado[categoria].forEach((p) => {
      const card = document.createElement("div");
      card.className = "card-presente" + (p.disponivel ? "" : " reservado");

      const titulo = document.createElement("h3");
      titulo.textContent = p.nome_presente;

      const botao = document.createElement("button");
      botao.className = "btn-reservar";
      botao.textContent = p.disponivel ? "Reservar" : "Reservado";
      botao.disabled = !p.disponivel;

      botao.addEventListener("click", async () => {
        await reservarPresente(botao, card, p.nome_presente);
      });

      card.appendChild(titulo);
      card.appendChild(botao);
      grid.appendChild(card);
    });

    container.appendChild(grid);
  });
}

// ===== RESERVAR PRESENTE =====
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
      .select("nome_presente, disponivel");

    if (error) throw error;

    if (!data || data.length === 0) {
      alert("Este presente já foi reservado.");
      botao.textContent = "Reservado";
      botao.disabled = true;
      card.classList.add("reservado");
      return;
    }

    card.classList.add("reservado");
    botao.textContent = "Reservado";
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
  setInterval(carregarPresentes, 10000);
});