// ===== SUPABASE =====
const supabaseUrl = "https://xyjgraqnskpmbshgvwqd.supabase.co";
const supabaseKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inh5amdyYXFuc2twbWJzaGd2d3FkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzE0NjE5MzMsImV4cCI6MjA4NzAzNzkzM30.driW8fFzTMzAJrDrKocxvGhz_Wv1rOviJH8iFNashEE";
// ✅ Verifica se a lib carregou (ANTES de usar)
if (typeof supabase === "undefined") {
  console.error("Supabase não carregou! Confira a ordem dos scripts no HTML.");
}

// ✅ Cria o client do jeito certo na v2
const supabaseClient = supabase.createClient(supabaseUrl, supabaseKey);

console.log("Supabase pronto:", supabaseClient);

// ===== DOM =====
document.addEventListener("DOMContentLoaded", () => {
  const botoes = document.querySelectorAll(".btn-reservar");

  if (botoes.length === 0) {
    console.warn("Nenhum botão de reservar encontrado");
    return;
  }

  botoes.forEach((botao) => {
    botao.addEventListener("click", async () => {
      const nomePresente = botao.dataset.presente;
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
            reservado_em: new Date().toISOString(), // ✅ opcional, mas bom
          })
          .eq("nome_presente", nomePresente)
          .eq("disponivel", true)
          .select();

        console.log("UPDATE retorno:", { data, error });

        if (error) throw error;

        if (!data || data.length === 0) {
          alert("Este presente já foi reservado.");
          botao.textContent = "Indisponível";
          return;
        }

        alert("Presente reservado com sucesso ❤️");
        botao.textContent = "Reservado";
      } catch (error) {
        console.error("Erro Supabase (completo):", error);

        // ✅ mostra o motivo real
        alert("Erro ao reservar presente: " + (error?.message || "desconhecido"));

        botao.disabled = false;
        botao.textContent = "Reservar";
      }
    });
  });
});