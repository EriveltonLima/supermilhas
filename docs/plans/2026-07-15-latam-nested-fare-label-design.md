# Etiqueta única nas tarifas LATAM

O cartão de tarifa da LATAM pode representar o preço com dois elementos tipográficos aninhados. O elemento interno contém somente a quantidade de milhas; o elemento externo repete esse conteúdo e inclui a taxa em BRL. Como ambos possuem a mesma classe, a extensão anotava os dois. A anotação externa interpretava a taxa como coparticipação, gerando uma segunda etiqueta com um total incorreto.

A correção mantém como alvo apenas o elemento tipográfico mais interno que contém a quantidade de milhas. Antes de processar um `span.latam-typography`, a extensão verifica se ele possui outro elemento tipográfico descendente cujo texto começa com uma quantidade de milhas. Nesse caso, o elemento é reconhecido como wrapper e não recebe conversão.

Se uma etiqueta externa tiver sido criada por uma execução anterior, ela é removida imediatamente. A etiqueta interna correta permanece porque pertence ao elemento folha. A extração de valores em BRL continua disponível para estruturas legítimas de milhas mais dinheiro; portanto, a correção não desativa o cálculo combinado em outras páginas ou componentes.

A verificação deve cobrir wrappers com milhas aninhadas, elementos folha, descendentes sem milhas, extração legítima de BRL e a sintaxe completa do script. A versão do manifesto avança para 1.0.3 para permitir o envio do pacote corrigido à Chrome Web Store.
