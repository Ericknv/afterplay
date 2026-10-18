# 🎵 AFTERPLAY — Your Music Listening Diary

> **Plataforma web minimalista de curadoria e avaliação musical faixa a faixa**, inspirada no ritual analógico de audição de discos de vinil e na experiência editorial do Letterboxd.

---

## 📌 Sumário Executivo

O **Afterplay** foi desenvolvido a partir de princípios de **Design Thinking** e **Metodologias Ágeis (Scrum/Kanban)**, estruturado inicialmente como um MVP (Release 1.0) e expandido na **Release 1.5** para incluir curadoria temática, roteamento SPA, sistema de notificações não-bloqueantes e geração de cards visuais via Canvas.

A aplicação roda 100% no cliente (*client-side*), sem necessidade de infraestrutura pesada de backend para esta fase, utilizando APIs públicas de música e persistência local sincronizada.

---

## 🚀 Status dos Releases

### Release 1.0 (MVP) — Concluído
- [x] Consumo da API pública de catálogo de música via JSONP (contornando restrições de CORS locais).
- [x] Mecanismo de busca assíncrono para álbuns e artistas.
- [x] Modal de avaliação com detalhamento individual por música (*track-by-track rating*).
- [x] Cálculo dinâmico e automático da média das faixas para sugerir a nota geral do disco.
- [x] Mural de curadoria de destaque: **"Top 5 Álbuns da Vida"** com microinteração de vinil animado em CSS.
- [x] Lista de espera de audição (*Want to Listen*).
- [x] Persistência em memória local com sincronização automática no `localStorage`.

### Release 1.5 (Engajamento, SPA & Card Studio) — Concluído
- [x] **Seletor de Meia Estrela (0.5 a 5.0):** Implementação via detecção de metades com precisão decimal.
- [x] **Edição In-Place:** Atualização de resenhas existentes sem duplicação de dados.
- [x] **Filtros e Ordenação:** Classificação por data, nota e ano de lançamento, além de busca por texto livre dentro do diário.
- [x] **Toasts e Feedback Visual Não-Bloqueante:** Notificações animadas com ícones temáticos (`💽`, `🎷`, `🎛️`, `📻`, `🔥`).
- [x] **Módulo de Coleções Temáticas:** Criação de pastas conceituais (ex: *"Obras-primas dos Anos 70"*) com mosaico de capas.
- [x] **Arquitetura SPA Router:** Roteamento baseado em hash (`#/`, `#/want-to-listen`, `#/colecoes`, `#/perfil`) com histórico nativo do navegador.
- [x] **Menu Lateral Deslizante (*Off-Canvas Drawer*):** Navegação recolhida via botão hamburger.
- [x] **Card Studio (HTML5 Canvas 1080x1350):**
  - **Layout Studio Editorial:** Capa, dados técnicos, resenha em texto, destaque da faixa favorita e nota.
  - **Layout Minimalista (Essential):** Apenas logo AFTERPLAY com slogan, arte da capa expandida, dados do álbum e estrelas destacadas.
  - **4 Temas de Fundo:** *Midnight Espresso*, *Tube Glow*, *Deep Velvet* e *Matte Graphite*.
  - Exportação direta em imagem `.png` em alta resolução.
- [x] **Desafio Anual de Audição (*Listening Challenge*):** Meta anual de discos para 2026, barra de progresso analógica e rastreador de ritmo (*pace tracker*).

---

## 📋 Product Backlog — Release 2.0 & Futuro

Este backlog documenta as funcionalidades priorizadas para a próxima iteração:

### 1. Pesquisa Expandida e Visão de Discografia (Adição Prioritária)
- **Problema identificado:** O limite fixo de 10 resultados na busca geral não oferece variedade satisfatória e agrupa álbuns e artistas em uma única lista rasa.
- **Solução técnica para a Release 2.0:**
  - Dividir os resultados em abas ou seções claras: **"Artistas Encontrados"** e **"Álbuns Encontrados"**.
  - Aumentar o limite inicial para 25-50 resultados com paginação ou rolagem infinita.
  - **Página de Discografia do Artista (`#/artista/:id`):** Ao clicar em um artista (ex: *Djavan*, *Milton Nascimento*, *Pink Floyd*), abrir a lista completa de todos os seus álbuns oficiais ordenados cronologicamente, com indicação visual dos discos que o usuário já avaliou ou adicionou ao *Want to Listen*.

### 2. Análise de Dados e Estatísticas Musicais
- Painel analítico com gráficos em CSS/SVG de **Décadas mais ouvidas** (ex: anos 70, 80, 2010s).
- Distribuição quantitativa de notas (histograma de 0.5 a 5.0 estrelas).
- Identificação dos gêneros e artistas com maior frequência no diário.

### 3. Retrospectiva Musical (*Afterplay Wrapped*)
- Geração automatizada de pôster anual resumindo os discos favoritos, maior nota, faixa mais elogiada e total de horas estimadas.

### 4. Sincronização em Nuvem (Backend opcional)
- Integração com BaaS leve e gratuito (como Supabase ou Firebase Authentication/Firestore) para permitir login em múltiplos dispositivos sem depender exclusivamente do `localStorage`.

---

## 🛠️ Stack Tecnológica

| Camada | Tecnologia | Propósito |
| :--- | :--- | :--- |
| **Marcação** | HTML5 Semântico | Estruturação de views, modais e telas SPA |
| **Estilização** | CSS3 Moderno (Custom Properties & Grid/Flexbox) | Design System *Midnight Vinyl & Tube Amp* |
| **Lógica** | JavaScript Vanilla (ES6+) | Manipulação de DOM, SPA Router, chamadas JSONP |
| **Renderização Gráfica** | HTML5 Canvas 2D API | Criação vetorial e exportação dos cards PNG |
| **Dados** | Apple/iTunes Search & Lookup API | Consulta de metadados, capas em alta definição e faixas |
| **Armazenamento** | Web Storage API (`localStorage`) | Persistência local do estado do usuário |
| **Hospedagem** | GitHub Pages | Deploy estático contínuo com SSL |

---

## 📂 Estrutura de Arquivos

```text
afterplay/
├── index.html        # Estrutura semântica, SPA views, modais e containers
├── style.css         # Design tokens, animações do vinil e layout responsivo
├── app.js            # Router, consumo da API, cálculos, canvas e estado
└── README.md         # Documentação técnica e governança do projeto
```

---

## 🌐 Guia de Hospedagem no GitHub Pages

Para publicar o projeto e deixá-lo acessível por qualquer celular ou computador:

### 1. Criar o Repositório no GitHub
1. Acesse [github.com/new](https://github.com/new).
2. Dê o nome do repositório de `afterplay`.
3. Mantenha-o como **Public** e não marque para criar README (já temos o nosso pronto).
4. Clique em **Create repository**.

### 2. Publicar direto pelo VS Code
Como o seu VS Code já está conectado à sua conta do GitHub:
1. Abra o painel do **Source Control** no VS Code (`Ctrl + Shift + G`).
2. Se a pasta ainda não tiver Git iniciado, clique em **Initialize Repository**.
3. Na caixa de mensagem, digite: `feat: release 1.5 complete with canvas card studio, collections and spa router`.
4. Clique no botão azul **Commit** (ou no ícone de check `✓`).
5. Clique em **Publish Branch** (Publicar Branch). O VS Code perguntará se deseja publicar como repositório público ou privado no seu perfil. Escolha **Publish to GitHub public repository**.

### 3. Ativar o GitHub Pages
1. No repositório no site do GitHub, clique na aba **Settings** (Configurações) no topo.
2. Na coluna esquerda, clique em **Pages**.
3. Na seção **Branch**, selecione `main` (ou `master`), mantenha a pasta como `/(root)` e clique em **Save**.
4. Em menos de 1 minuto, o GitHub gerará o link oficial:
   ```text
   https://<seu-usuario>.github.io/afterplay/
   ```
   