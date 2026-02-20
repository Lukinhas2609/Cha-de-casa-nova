// ===== SUPABASE =====
const supabaseUrl = "https://xyjgraqnskpmbshgvwqd.supabase.co";
const supabaseKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inh5amdyYXFuc2twbWJzaGd2d3FkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzE0NjE5MzMsImV4cCI6MjA4NzAzNzkzM30.driW8fFzTMzAJrDrKocxvGhz_Wv1rOviJH8iFNashEE";
// 👇 usamos outro nome para evitar conflito
if (!window.supabase) {
    console.error("Supabase não carregou!");
}

const supabaseClient = window.supabase.createClient(
    supabaseUrl,
    supabaseKey
);

console.log("Supabase pronto:", supabaseClient);

// ===== DOM =====
document.addEventListener("DOMContentLoaded", () => {

    const botoes = document.querySelectorAll(".btn-reservar");

    if (botoes.length === 0) {
        console.warn("Nenhum botão de reservar encontrado");
        return;
    }

    botoes.forEach(botao => {

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
                        disponivel: false
                    })
                    .eq("nome_presente", nomePresente)
                    .eq("disponivel", true)
                    .select();

                if (error) throw error;

                if (!data || data.length === 0) {
                    alert("Este presente já foi reservado.");
                    botao.textContent = "Indisponível";
                    return;
                }

                alert("Presente reservado com sucesso ❤️");
                botao.textContent = "Reservado";

            } catch (error) {
                console.error("Erro Supabase:", error);
                alert("Erro ao reservar presente.");
                botao.disabled = false;
                botao.textContent = "Reservar";
            }
        });

    });

});
