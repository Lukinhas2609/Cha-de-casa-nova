// ===== SUPABASE =====
const supabaseUrl = "https://iykaixanyshtbfolqvtr.supabase.co";
const supabaseKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Iml5a2FpeGFueXNodGJmb2xxdnRyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzE2MTE2MzgsImV4cCI6MjA4NzE4NzYzOH0.VgbIzMwyaIwFzWxW3VrLpvsysP__Bq6pj_g7zP5lHwU";

if (typeof supabase === "undefined") {
  console.error("Supabase não carregou! Confira a ordem dos scripts no HTML.");
}

const supabaseClient = supabase.createClient(supabaseUrl, supabaseKey);

async function carregarPresentes() {
  const container = document.getElementById("lista-presentes");
  if (!container) return;

  const { data, error } = await supabaseClient
    .from("presentes")
    .select("nome_presente, disponivel, categoria")
    .order("categoria", { ascending: true })
    .order("nome_presente", { ascending: true });

  if (error) {
    console.error(error);
    container.innerHTML = "<p>Erro ao carregar presentes.</p>";
    return;
  }

  renderPresentes(container, data);
}

function renderPresentes(container, presentes) {
  container.innerHTML = "";

  // Agrupar por categoria
  const agrupado = {};
  presentes.forEach(p => {
    if (!agrupado[p.categoria]) {
      agrupado[p.categoria] = [];
    }
    agrupado[p.categoria].push(p);
  });

  Object.keys(agrupado).forEach(categoria => {

    const tituloCategoria = document.createElement("h2");
    tituloCategoria.className = "titulo-categoria";
    tituloCategoria.textContent = categoria;
    container.appendChild(tituloCategoria);

    const grid = document.createElement("div");
    grid.className = "lista-presentes";

    agrupado[categoria].forEach(p => {

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