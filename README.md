# Nuvem Vida

A carteirinha de saúde do seu pet, no celular. Vacinas, remédios, consultas, exames e documentos ficam num lugar só, com lembretes antes de cada data e espaço para a família inteira acompanhar quem já deu o remédio.

Projeto do Grupo 11 na disciplina de Projetos 2026.2 da CESAR School.

## O que tem no MVP

- **Landing page** com a apresentação do produto, os dados do problema, planos e equipe.
- **Acesso e cadastro de pets**: perfis salvos no aparelho, cadastro curto e vários pets na mesma conta.
- **Painel**: próximo cuidado, itens atrasados, desta semana e mais adiante, e quem cuidou por último.
- **Histórico de saúde**: linha do tempo com filtros e busca, carteirinha de vacinação com selos, gráfico de peso e anexos.
- **Agenda e lembretes**: calendário do mês, repetição (de horas em horas, dias, semanas, meses ou anos), avisos do navegador e exportação para o Google Agenda ou o Calendário do iPhone (`.ics`).
- **Família**: convite por código ou link, papéis (tutor, família, cuidador), registro de quem fez cada cuidado e aviso de dose duplicada.
- **Documentos**: fotos e PDFs de receitas, exames e da carteirinha de papel.
- **Modo consulta**: resumo com letra grande para mostrar ao veterinário, com versão para imprimir ou salvar em PDF.
- Tema claro e escuro, funciona no celular e pode ser instalado como app (PWA).

Para testar rápido, entre em **Explorar com dados de exemplo**: o app cria o Paçoca e o Mingau com histórico, lembretes e família já preenchidos.

## Como rodar

Precisa do Node.js 20 ou mais recente.

```bash
npm install
npm run dev
```

O site abre em `http://localhost:5173`. Para gerar a versão de produção:

```bash
npm run build
npm run preview
```

## Onde ficam os dados

Nesta versão tudo fica guardado no navegador (IndexedDB), sem servidor. Por isso o convite de família funciona no mesmo aparelho: a pessoa convidada cria o perfil dela ali e entra com o código. Toda a leitura e escrita passa por `src/data/`, então dá para trocar por um backend (Supabase, por exemplo) sem mexer nas telas.

## Tecnologias

| Para quê | O quê |
|---|---|
| Base | React, TypeScript, Vite, React Router |
| Estilo | Tailwind CSS 4, tokens de cor em `src/index.css` |
| Animação | Motion, GSAP com ScrollTrigger, Lenis, canvas-confetti |
| Ícones | Phosphor Icons |
| Fontes | Bricolage Grotesque, Plus Jakarta Sans, Inter (logo) e JetBrains Mono (Fontsource) |
| Componentes | Radix UI, Vaul (gavetas), Sonner (avisos) |
| Dados | Dexie (IndexedDB) |
| Formulários | React Hook Form e Zod |
| Datas e gráficos | date-fns, Recharts |
| App instalável | vite-plugin-pwa |

## Estrutura

```
src/
  app/         rotas, layout, sessão e gaveta de ações
  landing/     seções da página inicial
  features/    telas do app (painel, histórico, agenda, família, pets, documentos, modo consulta)
  data/        banco local, tipos, operações e dados de exemplo
  components/  logo, botões, campos, selos de vacina e outros componentes
  lib/         datas, cores por tipo de cuidado, exportação .ics, imagens
```

## Créditos

Fotos do [Unsplash](https://unsplash.com), sob a Licença Unsplash. A lista completa está em `public/img/CREDITOS.md`.
