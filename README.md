# SR Central · Souza Ribeiro

Tela inicial que reúne todos os sistemas da Souza Ribeiro num só site.
A Central **não pede login**: ela só organiza e alterna entre os sistemas.
**Cada sistema tem o próprio login** (Supabase) antes de liberar o uso.

## Estrutura

```
index.html              tela inicial (Central)
sistemas.js             lista de sistemas: nome, cor, ícone, caminho
assets/
  app.js                troca entre sistemas, atalhos, busca
  style.css             identidade visual Souza Ribeiro
  marca/                logo, símbolo e favicon
sistemas/
  _modelo.html          modelo de página com tela de login
  compras/index.html    SR Compras
  comercial/index.html  SR Comercial
  tarefas/index.html    SR Tarefas
  expedicao/index.html  SR Expedição
  motorista/index.html  SR Motorista
vercel.json             cabeçalhos de segurança
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

1. Substitua `sistemas/<id>/index.html` pelo HTML do sistema.
   Se ele tiver arquivos próprios (CSS, JS, imagens), coloque tudo na mesma pasta.
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

## Próximo passo: login de cada sistema (Supabase)

As telas de login de cada sistema ainda são **só visuais**.
Quando cada sistema for ligado ao Supabase:

- Use **um único projeto Supabase** para todos os sistemas. O usuário passa a ter
  uma conta só e, como todos ficam no mesmo domínio, entra uma vez e já fica logado nos outros.
- Uma tabela de perfis define **quem acessa qual sistema**. Por exemplo,
  o motorista vê só o SR Motorista e o vendedor vê só o SR Comercial.
- A `anon key` do Supabase pode ficar no código do site.
  A `service_role key` **nunca** pode ir para o site.

## Testar no computador

Abra um servidor local na pasta, porque alguns navegadores bloqueiam o funcionamento abrindo direto pelo arquivo:

```bash
python3 -m http.server 8080
# abra http://localhost:8080
```
