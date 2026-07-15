# Organização da pasta do projeto

A raiz do repositório deve conter somente o código-fonte, a documentação e os recursos usados para desenvolver a extensão. Pacotes ZIP e cópias extraídas são artefatos de distribuição ou teste e não devem ficar misturados com os arquivos editáveis.

A pasta local `releases/` passa a concentrar esses artefatos. ZIPs prontos para envio ficam em `releases/archives/`, nomeados como `supermilhas-chrome-<versão>.zip`. Cópias extraídas ficam em `releases/unpacked/`, também identificadas pela versão do manifesto. Nenhum artefato será apagado; os arquivos existentes serão apenas movidos e, quando necessário, renomeados para tornar sua versão explícita.

Como os pacotes são derivados do código e podem ser recriados, `releases/` será ignorada pelo Git. O padrão `supermilhas-chrome*/` também evita que uma extração futura feita por engano na raiz apareça como conteúdo não rastreado. A documentação de publicação será atualizada para gerar novos ZIPs diretamente no local correto.

Antes do envio ao GitHub, o repositório deve estar sem alterações rastreáveis pendentes, com exceção dos arquivos deliberadamente modificados nesta organização. O histórico local será enviado para `origin/main` sem reescrever commits ou usar operações destrutivas.
