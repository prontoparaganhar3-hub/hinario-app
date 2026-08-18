// Registra o Service Worker (mantém o arquivo sw.js anterior)
if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('sw.js');
}

// Lógica da Barra Inferior
function mudarAba(idTela, titulo) {
    document.querySelectorAll('.tela').forEach(t => t.classList.remove('ativa'));
    document.getElementById(idTela).classList.add('ativa');
    
    document.querySelectorAll('.nav-btn').forEach(b => b.classList.remove('ativo'));
    event.currentTarget.classList.add('ativo');

    document.getElementById('titulo-pagina').innerText = titulo;
}

// Lógica de abrir os ministérios e gerar a lista de músicas
function abrirMinisterio(ministerio) {
    document.getElementById('tela-categorias').classList.remove('ativa');
    document.getElementById('tela-lista-hinos').classList.add('ativa');
    document.getElementById('titulo-pagina').innerText = "Hinos - " + ministerio.toUpperCase();

    const container = document.getElementById('container-hinos');
    container.innerHTML = ""; // Limpa a tela anterior

    const lista = hinos[ministerio];
    
    if (lista.length === 0) {
        container.innerHTML = "<p>Nenhum hino cadastrado ainda.</p>";
        return;
    }

    lista.forEach(hino => {
        container.innerHTML += `
            <div class="item-card">
                <h3>${hino.titulo}</h3>
                <pre>${hino.letra}</pre>
            </div>
        `;
    });
}

function voltarParaCategorias() {
    document.getElementById('tela-lista-hinos').classList.remove('ativa');
    document.getElementById('tela-categorias').classList.add('ativa');
    document.getElementById('titulo-pagina').innerText = "Hinário";
}

// Carregar os Avisos na tela
const containerAvisos = document.getElementById('container-avisos');
avisos.forEach(aviso => {
    containerAvisos.innerHTML += `
        <div class="item-card">
            <h3>${aviso.titulo}</h3>
            <p>${aviso.texto}</p>
        </div>
    `;
});