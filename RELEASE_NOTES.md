# CondoPrime — versão candidata à entrega

Ajustes de fechamento realizados:
- removidos console.error de desenvolvimento;
- corrigida a dependência do carregamento em CondominioDetalhe;
- ESLint validado sem erros ou avisos;
- node_modules removido do pacote de entrega;
- layouts e funcionalidades aprovadas preservados.

Validação:
- `eslint .`: aprovado, 0 erros / 0 avisos.
- O build não foi gerado neste ambiente porque o node_modules recebido no ZIP foi instalado em outro sistema operacional e continha bindings nativos incompatíveis. O pacote mantém package-lock.json para instalação limpa no ambiente de build/deploy.

Produção:
1. executar `npm ci`;
2. executar `npm run build`;
3. publicar o conteúdo de `dist/` ou deixar a Vercel executar o build;
4. manter a API com tratamento de erro seguro, sem mensagem/arquivo/linha internos.
