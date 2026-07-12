# Texto sugerido para a Chrome Web Store

## Nome

Supermilhas

## Resumo curto

Compare milhas e Avios em reais e abra consultas de resgate nos principais sites de passagens-prêmio.

## Categoria e idioma

- Categoria sugerida: Viagens
- Idioma principal: português (Brasil)
- Região inicial sugerida: Brasil

## Descrição detalhada

O Supermilhas ajuda viajantes brasileiros a entender o custo estimado de passagens-prêmio enquanto pesquisam disponibilidade.

A extensão preserva os valores originais em pontos ou milhas e acrescenta uma estimativa em reais baseada no CPM — custo por milheiro — configurado pelo usuário.

Recursos:

- conversão de Avios e milhas em reais;
- CPMs independentes para LATAM Pass, Avios, Smiles, Azul e Aegean;
- custo total estimado em opções LATAM de milhas + dinheiro;
- contexto de programas, parceiros e temporadas no Seats.aero;
- conversão no SeatSpy, Iberia e Qatar Airways;
- atalhos do Google Voos e Seats.aero para consultar voos LATAM no LATAM Pass;
- menu Explore organizado para programas relevantes ao público brasileiro.

O Supermilhas não garante disponibilidade, preço ou elegibilidade de resgate. Taxas, sobretaxas e regras devem ser confirmadas diretamente no programa emissor.

Privacidade: os cálculos são feitos localmente no navegador. A extensão não possui servidor, não envia pesquisas de voo ao desenvolvedor e não utiliza anúncios ou telemetria.

O Supermilhas é independente e não possui vínculo com companhias aéreas, programas de fidelidade, Seats.aero, SeatSpy ou Google.

## Propósito único — campo “Single purpose”

Acrescentar estimativas de custo em reais e atalhos de consulta às páginas de pesquisa de passagens-prêmio, ajudando o usuário a comparar opções de resgate.

## Justificativa da permissão `storage`

Armazenar localmente os CPMs definidos pelo usuário e a chave Pix exibida no popup. As informações não são transmitidas.

## Justificativa do acesso aos sites

O acesso é necessário para ler os valores, programas, rotas e datas visíveis e inserir localmente estimativas e atalhos relacionados ao propósito da extensão. O conteúdo não é enviado para servidores.

- `seats.aero`: opções de programas, Explore e rotas.
- `seatspy.com`: pontos no calendário e detalhes.
- `iberia.com`: valores em Avios.
- `qatarairways.com`: valores em Avios.
- `latamairlines.com`: valores LATAM Pass e milhas + dinheiro.
- `google.com/travel/flights`: resultados LATAM e rota/data para o atalho de consulta.

## Código remoto

Selecione: **Não, a extensão não usa código remoto**.

Todo JavaScript executado está incluído no pacote. A extensão somente cria links HTTPS que o usuário pode abrir voluntariamente.

## Declaração de dados

De acordo com o comportamento atual:

- não há transmissão de dados para o desenvolvedor ou terceiros;
- não há analytics, publicidade ou rastreamento;
- CPMs e chave Pix ficam somente no armazenamento local do Chrome;
- o conteúdo das páginas é processado temporariamente no próprio navegador para entregar a funcionalidade visível.

Preencha o painel de acordo com as perguntas exibidas e mantenha as respostas consistentes com `PRIVACY.md`.

## Suporte

- E-mail: `erivelton.lima.tech@gmail.com`
- Página inicial: repositório GitHub do projeto
- Suporte: aba Issues do repositório GitHub

## Imagens a preparar

- ícone: `icon128.png`, 128×128 px;
- pelo menos uma captura 1280×800 px; podem ser enviadas até cinco;
- tile pequeno: PNG ou JPEG 440×280 px;
- marquee opcional: PNG ou JPEG 1400×560 px.

Capturas recomendadas:

1. Seats.aero com Booking Options e conversões coloridas;
2. LATAM mostrando milhas, parcela em dinheiro e custo total;
3. SeatSpy com conversão no hover e no modal;
4. Google Voos com o botão “Milhas” em um voo LATAM;
5. popup com os CPMs configuráveis.

Antes de enviar, remova nomes, contas, números de fidelidade e outras informações pessoais das imagens.

