# 💽 Afterplay — Your Music Listening Diary

> *"O som termina. A experiência começa."*

O **Afterplay** é um diário de bordo musical analógico construído em Vanilla Web Technologies, projetado para audição atenta, curadoria conceitual e registro detalhado de álbuns faixa a faixa.

---

## 🚀 Release 2.0 (Changelog de Entregas)

### 🔍 Busca Dedicada & Discografias
* **Rota Exclusiva de Busca (`#/busca`):** Página dedicada com consulta multi-entidade e atalho de teclado global (`/`).
* **Fotos Oficiais de Artistas (Deezer API):** Avatares circulares de alta resolução integrados via JSONP.
* **Discografia Cronológica Completa:** Exploração profunda de até 100 álbuns por artista, com filtro de desduplicação e ordenação cronológica (*Antigos ➔ Novos* / *Recentes*).

### 📁 Módulo de Coleções Expandido
* **Visualizador Detalhado de Pastas:** Clique para abrir a gaveta temática, consultar a lista completa de discos, média de avaliação do acervo e opção de retirar discos da seleção.

### 📊 Inteligência Analítica & Retrospectivas
* **Dashboard de Métricas Musicais:** Histograma de distribuição de notas (`0.5` a `5.0 ★`), linha do tempo por décadas históricas e ranking dos artistas mais ouvidos.
* **Afterplay Wrapped (Mensal & Anual):** Retrospectivas com cálculo do álbum do período, artista dominante e exportação de pôster comemorativo em alta resolução (1080x1350 PNG).
* **Top 5 Álbuns da Vida:** Integrado à identidade do ouvinte na tela de Perfil.

### 💾 Portabilidade & Identidade
* **Cofre de Dados (Backup & Restore):** Exportação e importação de acervo completo em formato JSON (`afterplay-backup.json`) e preparação para Cloud Sync.
* **Favicon Oficial:** Suporte configurado para ícone nativo na aba do navegador.

---

## 🛠️ Stack Tecnológica

* **Front-end:** HTML5 Semântico, CSS3 Moderno (Custom Properties, Flexbox, CSS Grid).
* **Lógica & Roteamento:** Vanilla JavaScript ES6+ com SPA Hash Router (`window.location.hash`).
* **APIs de Metadados:** iTunes Search & Lookup API + Deezer Public API via JSONP.
* **Motor Gráfico:** HTML5 Canvas API para geração e download de pôsteres em alta definição (4:5 vertical).
* **Persistência:** LocalStorage Engine com portabilidade JSON.
* **Versionamento & Deploy:** Git + GitHub Pages.

---

## 📦 Como Rodar Localmente

1. Clone o repositório:
   ```bash
   git clone [https://github.com/seu-usuario/afterplay.git](https://github.com/seu-usuario/afterplay.git)
