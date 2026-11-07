# SR Central · Souza Ribeiro

Tela inicial que reúne todos os sistemas da Souza Ribeiro num só site.
A tela inicial **não pede login**. **Cada sistema pede usuário e senha** antes de liberar o uso,
e os acessos são controlados na aba **Configurações**.

## Configurações (usuários e acessos)

- Ícone de engrenagem na barra lateral, ou `#/configuracoes`.
- Login inicial do administrador: **usuário `ADMIN`, senha `ADMIN`**. **Troque a senha no primeiro acesso.**
  O site é público, então quem souber ADMIN / ADMIN controla todos os acessos.
- Lá você cria pessoas (nome, usuário, senha), escolhe os sistemas de cada uma,
  troca senhas, desativa e exclui usuários.
- O usuário não diferencia maiúsculas de minúsculas (`ADMIN` = `admin`). A senha diferencia.
- Como todos os sistemas ficam no mesmo site, quem entra num sistema já fica logado nos outros
  que tem liberados. Quem não tem acesso vê "Sem acesso".

## Supabase (já configurado)

- Projeto: `cvhcgihumdvytjvbkxvt` · conexão em `assets/sr-config.js` (chave publicável, pode ficar no site).
- Tabela `usuarios` com RLS: cada pessoa lê só o próprio cadastro, e o admin lê todos.
  Ninguém grava direto pelo site.
- Edge Function `sr-admin` (`supabase/functions/sr-admin`): é a única que cria e edita usuários,
  e só aceita chamadas de um admin logado. A chave secreta fica só no Supabase.
- SQL de referência em `supabase/migrations/`.
- Para as tabelas de cada sistema, use na regra RLS: `using (sr_priv.sr_tem_acesso('compras'))`.

## SR Compras

- Arquivo: `sistemas/compras/index.html` (+ `sistemas/compras/xlsx.full.min.js`, leitor de XLS/XLSX local, sem CDN).
- Login com o usuário da SR Central. Só entra quem tem **SR Compras** liberado em Configurações (ou é admin).
- Dados no Supabase, tabela `compras_registros` (`supabase/migrations/20261107_02_sr_compras.sql`),
  protegida por RLS com `sr_priv.sr_tem_acesso('compras')`. Cada fornecedor, produto e marcação é um registro
  separado, então duas pessoas usando ao mesmo tempo não apagam o trabalho uma da outra.
- Tudo é compartilhado entre os usuários do SR Compras: cadastro de fornecedores e produtos, vendas
  extraordinárias e descontinuadas, lista importada, progresso das listas, Comprados e CSV do Sheets.
  A tela confere a cada 30 segundos (e ao voltar para a aba) se alguém alterou algo e atualiza sozinha.
- No navegador ficam só preferências de tela (aba aberta, filtro, listas expandidas).
- O indicador na barra lateral mostra "Tudo salvo no servidor", "Salvando..." ou "Não salvo".
  Se a internet cair, o sistema tenta gravar de novo sozinho; se a sessão expirar, pede o login e grava em seguida.
- **Trazer o cadastro do arquivo antigo** (`compras.html` local): no arquivo antigo, Cadastro → Exportar backup;
  no SR Compras, Cadastro → Importar backup → Mesclar.

## Estrutura

```
index.html              tela inicial (Central)
sistemas.js             lista de sistemas: nome, cor, ícone, caminho
assets/
  app.js                troca entre sistemas, atalhos, busca
  config.js             aba Configurações (usuários e acessos)
  sr-auth.js            login compartilhado (usuário + senha)
  sr-config.js          endereço e chave pública do Supabase
  style.css             identidade visual Souza Ribeiro
  marca/                logo, símbolo e favicon
sistemas/
  _modelo.html          modelo de página com tela de login
  compras/index.html    SR Compras (sistema completo, dados no Supabase)
  compras/xlsx.full.min.js  leitor de planilhas XLS/XLSX
  comercial/index.html  SR Comercial
  tarefas/index.html    SR Tarefas
  expedicao/index.html  SR Expedição
  motorista/index.html  SR Motorista
vercel.json             cabeçalhos de segurança
supabase/               Edge Function e SQL do banco
```

## Como funciona

- Cada sistema abre **dentro da Central**. Ao trocar de sistema, o anterior continua
  aberto em segundo plano, então você não perde o que estava fazendo.
  O ponto colorido na barra lateral mostra quais estão abertos.
- Atalhos:
  - `1` a `5` na tela inicial abrem um sistema
  - `Alt + número` troca de sistema de qualquer lugar (`Alt + 0` volta ao início)
  - `Ctrl + K` abre a busca de sistemas
- No topo, quando um sistema está aberto: recarregar, tela cheia, abrir em nova aba e fechar.
- No celular, a barra lateral vira uma barra inferior.

## Colocar um sistema real

1. Substitua o bloco marcado "SUBSTITUA ESTE BLOCO" em `sistemas/<id>/index.html` pelo sistema,
   mantendo os scripts `sr-config.js` e `sr-auth.js` (eles fazem o login).
   Para ler e gravar no banco, use `SRAuth.rest('tabela?select=*')`.
2. Pronto: a Central já abre o arquivo novo.

Para **adicionar** um sistema, crie a pasta em `sistemas/` e inclua uma entrada em `sistemas.js`.
Se um sistema estiver hospedado em outro endereço, como um Web App do Google Apps Script,
coloque a URL completa em `caminho`. Se ele não abrir dentro da Central, use `novaAba: true`.

## Publicar (GitHub + Vercel)

1. Crie um repositório no GitHub e envie esta pasta:
   ```bash
   git init
   git add .
   git commit -m "SR Central"
   git branch -M main
   git remote add origin https://github.com/SEU-USUARIO/sr-central.git
   git push -u origin main
   ```
2. Na Vercel: **Add New → Project → importe o repositório**.
   - Framework Preset: **Other**
   - Build Command: deixe vazio
   - Output Directory: deixe vazio (raiz)
3. Clique em **Deploy**. Cada `git push` publica de novo automaticamente.
4. (Opcional) Em **Settings → Domains**, ligue um domínio próprio,
   por exemplo `sistemas.souzaribeiro.com.br`.

## Testar no computador

Abra um servidor local na pasta, porque alguns navegadores bloqueiam o funcionamento abrindo direto pelo arquivo:

```bash
python3 -m http.server 8080
# abra http://localhost:8080
```
