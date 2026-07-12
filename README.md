# Supermilhas

Extensão Chrome Manifest V3 para comparar o custo estimado de milhas e Avios em reais e abrir consultas de resgate nos sites usados para pesquisar passagens-prêmio.

> O Supermilhas é uma ferramenta independente. Não possui vínculo com companhias aéreas, programas de fidelidade, Seats.aero, SeatSpy ou Google.

## Recursos

- **Seats.aero:** converte somente as opções de reserva que identificam explicitamente o programa; adiciona contexto de tabelas, parceiros, temporada e links para consultar voos LATAM no LATAM Pass.
- **Explore do Seats.aero:** reorganiza programas para o uso brasileiro, adiciona badges de moeda/parceria e separadores, além de destacar rotas selecionadas do Qatar.
- **SeatSpy:** converte Avios no hover do calendário e no modal de detalhes.
- **Iberia:** converte Avios e opções Avios + dinheiro.
- **Qatar Airways:** converte Avios nos cartões de cabine e no calendário semanal.
- **LATAM Airlines:** converte milhas e mostra o custo estimado total nas opções milhas + dinheiro.
- **Google Voos:** adiciona “Milhas” aos resultados LATAM e abre a mesma rota e data na busca de resgate do LATAM Pass.

O cálculo é executado localmente:

```text
custo das milhas = quantidade ÷ 1.000 × CPM
custo total = custo das milhas + parcela em dinheiro
```

CPMs padrão:

- LATAM Pass: R$ 18 por milheiro;
- Avios: R$ 39 por milheiro;
- Aegean Miles+Bonus: R$ 68 por milheiro;
- Smiles e Azul: configuráveis pelo usuário.

Os valores são estimativas. Disponibilidade, taxas, sobretaxas, regras de parceiros e preços finais devem ser confirmados no programa emissor.

## Instalação para testes

1. Baixe ou clone este repositório.
2. Abra `chrome://extensions`.
3. Ative **Modo do desenvolvedor**.
4. Clique em **Carregar sem compactação**.
5. Selecione a pasta que contém `manifest.json`.
6. Recarregue os sites já abertos.

## Configuração

Clique no ícone do Supermilhas para:

- alterar o CPM de LATAM Pass, Avios, Smiles, Azul e Aegean;
- copiar a chave Pix de apoio ao desenvolvimento;
- abrir a página interna com explicação e FAQ.

As configurações são armazenadas apenas em `chrome.storage.local` no navegador do usuário.

## Estrutura

```text
manifest.json       Configuração Manifest V3 e sites permitidos
content.js          Inicialização do script de conteúdo
settings.js         CPMs e configurações locais
lib/mileage.js      Detecção, cálculo e integrações
styles.css          Etiquetas inseridas nos sites
popup.*             Configurações da extensão
about.*             Página de apresentação e FAQ
icon*.png           Ícones da extensão
docs/               Publicação, privacidade e textos da loja
```

Não há servidor, conta, telemetria, anúncios ou dependências de produção.

## Verificação antes de publicar

Execute no PowerShell:

```powershell
node --check content.js
node --check settings.js
node --check popup.js
node --check about.js
node --check lib/mileage.js
Get-Content -Raw manifest.json | ConvertFrom-Json | Out-Null
```

Depois teste manualmente os sites afetados, pois suas estruturas HTML podem mudar sem aviso.

## Gerar o ZIP da Chrome Web Store

Na raiz do projeto:

```powershell
$files = @(
  'manifest.json','content.js','settings.js','styles.css',
  'popup.html','popup.css','popup.js',
  'about.html','about.css','about.js',
  'lib','icon16.png','icon32.png','icon48.png','icon128.png'
)
Compress-Archive -Path $files -DestinationPath '.\supermilhas-chrome.zip' -Force
```

Abra o ZIP e confirme que `manifest.json` está na raiz. Não inclua screenshots, documentação, `.git` ou arquivos pessoais no pacote enviado.

Consulte [docs/CHROME_WEB_STORE.md](docs/CHROME_WEB_STORE.md) para o passo a passo completo.

## Privacidade e segurança

O Supermilhas lê apenas o conteúdo visível dos sites declarados no Manifest para adicionar cálculos e links. Nenhum conteúdo de página ou histórico é enviado para servidores do projeto. Veja [PRIVACY.md](PRIVACY.md).

A chave Pix pública serve somente para doação voluntária. A extensão não inicia pagamentos nem solicita dados bancários.

## Contribuição

Relate mudanças de HTML, resultados incorretos e sugestões pelas Issues. Ao relatar um problema, remova nomes, e-mails, números de fidelidade e outros dados pessoais das capturas ou trechos HTML.

## Apoio

Chave Pix: `erivelton.lima.tech@gmail.com`

