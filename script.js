// ===== SUPABASE =====
const supabaseUrl = "https://iykaixanyshtbfolqvtr.supabase.co";
const supabaseKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Iml5a2FpeGFueXNodGJmb2xxdnRyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzE2MTE2MzgsImV4cCI6MjA4NzE4NzYzOH0.VgbIzMwyaIwFzWxW3VrLpvsysP__Bq6pj_g7zP5lHwU";

if (typeof supabase === "undefined") {
  console.error("Supabase não carregou! Confira a ordem dos scripts no HTML.");
}

const supabaseClient = supabase.createClient(supabaseUrl, supabaseKey);
console.log("Supabase pronto:", supabaseClient);

// ===== Adicionar pessoa =====
function adicionarPessoa() {
  const lista = document.getElementById("lista-pessoas");
  if (!lista) return;

  const div = document.createElement("div");
  div.className = "pessoa";
  div.innerHTML = `
    <input type="text" placeholder="Nome">
    <div class="erro" style="color:red; font-size:12px;"></div>
    <button type="button" class="remover">✕</button>
  `;

  div.querySelector(".remover").addEventListener("click", () => div.remove());
  lista.appendChild(div);
}

// ===== DOM =====
document.addEventListener("DOMContentLoaded", () => {
  const btnAdicionar = document.getElementById("adicionar");
  const btnConfirmar = document.getElementById("confirmar");

  if (btnAdicionar) {
    btnAdicionar.addEventListener("click", adicionarPessoa);
  }

  if (btnConfirmar) {
    btnConfirmar.addEventListener("click", async () => {
      const pessoasDiv = document.querySelectorAll(".pessoa");
      let valido = true;

      const pessoas = [...pessoasDiv].map((div) => {
        const input = div.querySelector("input");
        const erro = div.querySelector(".erro");

        const nome = (input?.value || "").trim();
        if (erro) erro.textContent = "";

        if (!nome) {
          if (erro) erro.textContent = "Nome obrigatório";
          valido = false;
        } else if (nome.length < 3) {
          if (erro) erro.textContent = "Nome muito curto";
          valido = false;
        }

        return { nome };
      });

      if (!valido) return;
      if (!confirm("Deseja confirmar a presença?")) return;

      btnConfirmar.disabled = true;
      btnConfirmar.textContent = "Enviando...";

      console.log("Enviando:", pessoas);

      try {
        const { data, error } = await supabaseClient
          .from("presencas")
          .insert(pessoas)
          .select();

        console.log("INSERT retorno:", { data, error });

        if (error) throw error;

        alert("Presença confirmada com sucesso ❤️");

        // ✅ melhor para GitHub Pages (evita quebrar por causa do "/")
        window.location.href = "./localizacao.html";
      } catch (err) {
        console.error("Erro Supabase:", err);
        alert("Erro ao confirmar presença: " + (err?.message || "desconhecido"));

        btnConfirmar.disabled = false;
        btnConfirmar.textContent = "Confirmar Presença";
      }
    });
  }
});