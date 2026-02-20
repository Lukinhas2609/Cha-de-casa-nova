// ===== SUPABASE =====
const supabaseUrl = "https://iykaixanyshtbfolqvtr.supabase.co";
const supabaseKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Iml5a2FpeGFueXNodGJmb2xxdnRyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzE2MTE2MzgsImV4cCI6MjA4NzE4NzYzOH0.VgbIzMwyaIwFzWxW3VrLpvsysP__Bq6pj_g7zP5lHwU";

if (typeof supabase === "undefined") {
  console.error("Supabase não carregou! Confira a ordem dos scripts no HTML.");
}

const supabaseClient = supabase.createClient(supabaseUrl, supabaseKey);

// ===== CONFIG STORAGE (bucket public) =====
const bucketName = "presentes";
const publicBucketBase = `${supabaseUrl}/storage/v1/object/public/${bucketName}/`;

// Se quiser uma imagem padrão (opcional). Pode ser um arquivo do seu projeto.
const fallbackImg = "./img/sem-foto.jpg";

// Monta URL final da imagem.
// Aceita:
// - URL completa (https://...)
// - caminho "presentes/arquivo.jpg"
// - somente "arquivo.jpg"
function resolveImagemUrl(imagemUrl) {
  if (!imagemUrl) return null;

  const val = String(imagemUrl).trim();
  if (!val) return null;

  // já é URL completa
  if (/^https?:\/\//i.test(val)) return val;

  // veio "presentes/arquivo.jpg"
  if (val.startsWith(`${bucketName}/`)) {
    return publicBucketBase + encodeURI(val.slice(bucketName.length + 1));
  }

  // veio só "arquivo.jpg"
  return publicBucketBase + encodeURI(val);
}

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

    // IMAGEM
    const finalImgUrl = resolveImagemUrl(p.imagem_url);

    if (finalImgUrl) {
      const img = document.createElement("img");
      img.src = finalImgUrl;
      img.alt = p.nome_presente;

      img.addEventListener("error", () => {
        console.warn("Imagem não carregou:", {
          nome_presente: p.nome_presente,
          imagem_url_db: p.imagem_url,
          imagem_url_final: finalImgUrl,
        });

        // fallback (opcional)
        img.src = fallbackImg;
      });

      card.appendChild(img);
    }

    const titulo = document.createElement("h3");
    titulo.textContent = p.nome_presente;

    const botao = document.createElement("button");
    botao.className = "btn-reservar";

    if (p.disponivel) {
      botao.textContent = "Reservar";
      botao.disabled = false;
    } else {
      botao.textContent = "Reservado";
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
    .select("nome_presente, disponivel, categoria, imagem_url")
    .order("nome_presente", { ascending: true });

  if (error) {
    console.error("Erro ao carregar presentes:", error);
    listaEl.innerHTML = `<p style="color:white;text-align:center;">Erro ao carregar presentes.</p>`;
    return;
  }

  renderPresentes(listaEl, data);
}

// ===== RESERVAR =====
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