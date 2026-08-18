if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('sw.js');
}

let ministerioAtual = '';

function mudarAba(idTela, titulo) {
    document.querySelectorAll('.tela').forEach(t => t.classList.remove('ativa'));
    document.getElementById(idTela).classList.add('ativa');
    
    document.querySelectorAll('.nav-btn').forEach(b => b.classList.remove('ativo'));
    
    if(idTela === 'tela-categorias' || idTela === 'tela-lista-hinos') {
        document.getElementById('btn-nav-hinos').classList.add('ativo');
    } else {
        document.getElementById('btn-nav-avisos').classList.add('ativo');
    }

    document.getElementById('titulo-pagina').innerText = titulo;
    
    if(idTela === 'tela-categorias') {
        document.getElementById('tela-lista-hinos').classList.remove('ativa');
        document.getElementById('tela-categorias').classList.add('ativa');
    }
}

function abrirMinisterio(ministerio) {
    ministerioAtual = ministerio;
    document.getElementById('tela-categorias').classList.remove('ativa');
    document.getElementById('tela-lista-hinos').classList.add('ativa');
    
    const nomesMinistros = {
        'senhoras': 'Senhoras', 'jovens': 'Jovens',
        'adolescentes': 'Adolescentes', 'criancas': 'Crianças'
    };
    
    document.getElementById('titulo-pagina').innerText = nomesMinistros[ministerio];
    document.getElementById('busca-hino').value = ''; 
    
    renderizarHinos(hinos[ministerio]);
}

function renderizarHinos(lista) {
    const container = document.getElementById('container-hinos');
    container.innerHTML = ""; 

    if (lista.length === 0) {
        container.innerHTML = "<p style='text-align:center; color:#94a3b8; margin-top: 20px;'>Nenhum hino encontrado.</p>";
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

function buscarHino() {
    const termo = document.getElementById('busca-hino').value.toLowerCase();
    const listaFiltrada = hinos[ministerioAtual].filter(hino => 
        hino.titulo.toLowerCase().includes(termo) || hino.letra.toLowerCase().includes(termo)
    );
    renderizarHinos(listaFiltrada);
}

function voltarParaCategorias() {
    document.getElementById('tela-lista-hinos').classList.remove('ativa');
    document.getElementById('tela-categorias').classList.add('ativa');
    document.getElementById('titulo-pagina').innerText = "Hinário";
}

const containerAvisos = document.getElementById('container-avisos');
avisos.forEach(aviso => {
    containerAvisos.innerHTML += `
        <div class="item-card">
            <h3>${aviso.titulo}</h3>
            <p>${aviso.texto}</p>
        </div>
    `;
});