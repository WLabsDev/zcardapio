/**
 * Wrapper para Route Handlers da App Router: envolve o handler em try/catch e
 * devolve um 500 JSON consistente (em vez do erro genérico do Next) quando algo
 * não tratado escapa — ex.: uma falha de banco. Erros de negócio continuam sendo
 * tratados dentro de cada rota com seus próprios status/mensagens.
 */
type RouteHandler<C> = (request: Request, context: C) => Promise<Response>;

export function apiHandler<C>(handler: RouteHandler<C>): RouteHandler<C> {
  return async (request, context) => {
    try {
      return await handler(request, context);
    } catch (error) {
      const path = new URL(request.url).pathname;
      console.error(`[api] erro não tratado em ${request.method} ${path}:`, error);
      return Response.json(
        { message: "Erro interno do servidor. Tente novamente." },
        { status: 500 }
      );
    }
  };
}
