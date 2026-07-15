# Publicar o Supermilhas na Chrome Web Store

Estas instruções foram conferidas com a documentação oficial do Chrome em 12 de julho de 2026. Reconfirme os requisitos no momento da publicação, pois as políticas podem mudar.

## 1. Preparar a conta

1. Acesse o [Chrome Web Store Developer Dashboard](https://chrome.google.com/webstore/devconsole/).
2. Registre a conta de desenvolvedor e pague a taxa única solicitada pelo Google.
3. Ative a verificação em duas etapas na Conta Google; ela é obrigatória para publicar e atualizar extensões.
4. Confirme o e-mail do desenvolvedor e preencha o nome do publicador.
5. Use um endereço acompanhado com frequência, pois rejeições e avisos chegam por e-mail.

## 2. Testar localmente

1. Carregue a pasta por `chrome://extensions` usando **Carregar sem compactação**.
2. Teste o popup, a página Sobre e cada site compatível.
3. Confirme que não há erros no console da extensão.
4. Verifique links, rotas, datas, modo claro/escuro e alterações de CPM.
5. Confira se `manifest.json` possui nome, descrição, versão e ícones corretos.

## 3. Gerar o pacote

Execute na raiz do projeto:

```powershell
$version = (Get-Content -Raw '.\manifest.json' | ConvertFrom-Json).version
$releaseDir = '.\releases\archives'
$zip = Join-Path $releaseDir "supermilhas-chrome-$version.zip"

$files = @(
  'manifest.json','content.js','settings.js','styles.css',
  'popup.html','popup.css','popup.js',
  'about.html','about.css','about.js',
  'lib','icon16.png','icon32.png','icon48.png','icon128.png'
)
New-Item -ItemType Directory -Force -Path $releaseDir | Out-Null
Compress-Archive -Path $files -DestinationPath $zip -Force
```

Abra o ZIP e verifique que `manifest.json` aparece diretamente na raiz. O pacote não deve conter uma pasta externa envolvendo todos os arquivos.

Os pacotes gerados ficam em `releases/archives/`. Pastas extraídas para testes locais devem ficar em `releases/unpacked/`; toda a pasta `releases/` é ignorada pelo Git.

## 4. Criar o item

1. No dashboard, clique em **Add new item**.
2. Selecione `supermilhas-chrome.zip` e faça o upload.
3. Se houver erro no Manifest, corrija o projeto, aumente a versão, gere outro ZIP e envie novamente.

## 5. Preencher a listagem

Use os textos de [STORE_LISTING.md](STORE_LISTING.md).

- idioma: português (Brasil);
- categoria sugerida: Viagens;
- descrição clara, sem prometer disponibilidade ou economia garantida;
- descrição baseada em benefícios, sem listas de sites, marcas ou palavras-chave;
- ícone 128×128;
- no mínimo uma captura 1280×800, até cinco;
- tile pequeno 440×280;
- marquee 1400×560 opcional;
- homepage e suporte: URLs do GitHub quando o repositório estiver público.

## 6. Preencher “Privacy practices”

1. Informe o propósito único descrito em `STORE_LISTING.md`.
2. Justifique `storage` e cada grupo de sites acessado.
3. Declare que não há código remoto.
4. Responda às perguntas de coleta conforme o comportamento real: não existe transmissão, analytics ou publicidade; configurações ficam localmente.
5. Certifique o cumprimento dos requisitos de Uso Limitado.
6. Informe uma URL pública para [PRIVACY.md](../PRIVACY.md). Um arquivo em repositório privado não serve como política pública; torne o repositório público ou hospede a política em uma página pública antes do envio.

## 7. Distribuição

Para uma primeira revisão, você pode escolher:

- **Private:** somente testadores indicados;
- **Unlisted:** instalável por quem possuir o link;
- **Public:** aparece normalmente na loja.

Todas as opções passam pelas mesmas políticas e revisão. Para um teste fechado separado, o Google exige que o nome indique “BETA” ou “DEVELOPMENT BUILD” e que a descrição deixe clara a finalidade de teste.

## 8. Enviar para revisão

1. Revise as abas Package, Store listing, Privacy practices e Distribution.
2. Envie o item para análise.
3. Acompanhe o dashboard e o e-mail do publicador.
4. A revisão normalmente pode levar dias e, em alguns casos, semanas. A documentação oficial recomenda procurar o suporte se permanecer pendente por mais de três semanas.

## 9. Publicar atualizações

1. Altere o código.
2. Aumente obrigatoriamente `version` no `manifest.json`.
3. Gere um ZIP completo novo.
4. Use **Upload New Package**.
5. Atualize textos, privacidade ou imagens se o comportamento tiver mudado.
6. Envie novamente para revisão.

## Checklist final

- [ ] Verificação em duas etapas ativada
- [ ] E-mail do publicador confirmado
- [ ] Extensão testada em todos os sites
- [ ] Sem erros no console
- [ ] Versão do Manifest correta
- [ ] ZIP com Manifest na raiz
- [ ] Ícone 128×128
- [ ] Captura 1280×800 sem dados pessoais
- [ ] Tile 440×280
- [ ] Descrição e propósito único preenchidos
- [ ] Descrição sem enumerações de sites ou marcas
- [ ] Permissões justificadas
- [ ] Código remoto declarado como “Não”
- [ ] Práticas de dados preenchidas
- [ ] Política de privacidade em URL pública
- [ ] Canal e regiões de distribuição escolhidos

## Fontes oficiais

- [Registrar a conta](https://developer.chrome.com/docs/webstore/register)
- [Preparar a extensão](https://developer.chrome.com/docs/webstore/prepare)
- [Preencher a listagem](https://developer.chrome.com/docs/webstore/cws-dashboard-listing/)
- [Preencher privacidade](https://developer.chrome.com/docs/webstore/cws-dashboard-privacy)
- [Configurar distribuição](https://developer.chrome.com/docs/webstore/cws-dashboard-distribution/)
- [Publicar](https://developer.chrome.com/docs/webstore/publish/)
- [Políticas do programa](https://developer.chrome.com/docs/webstore/program-policies/policies)
