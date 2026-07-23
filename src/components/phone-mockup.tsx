/** Mockup ilustrativo do cardápio no celular — mesmo usado no hero da landing page. */
export function PhoneMockup() {
  return (
    <div className="relative mx-auto w-full max-w-[290px]">
      <span
        aria-hidden
        className="absolute -left-10 top-8 hidden -rotate-12 rounded-lg border-2 border-foreground bg-background px-3 py-1.5 font-display text-sm font-bold shadow-offset-sm md:block"
      >
        pedido novo! 🔔
      </span>
      <span
        aria-hidden
        className="absolute -right-8 bottom-24 z-20 hidden rotate-6 rounded-lg border-2 border-foreground bg-primary px-3 py-1.5 font-display text-sm font-bold text-primary-foreground shadow-offset-sm md:block"
      >
        + R$ 88,70
      </span>
      <div className="rotate-2 rounded-[2.2rem] border-2 border-foreground bg-background shadow-offset transition-transform duration-300 hover:rotate-0">
        <div className="m-2 overflow-hidden rounded-[1.7rem] border border-foreground/10">
          <div className="relative h-28 bg-[url('https://images.unsplash.com/photo-1550547660-d9450f859349?w=600&q=60')] bg-cover bg-center" />
          <div className="-mt-6 px-4">
            <div className="flex size-12 items-center justify-center rounded-xl border-2 border-foreground bg-primary font-display text-lg font-bold text-primary-foreground">
              BZ
            </div>
          </div>
          <div className="space-y-3 p-4">
            <div>
              <p className="font-display font-bold">Burguer do Zé</p>
              <p className="text-xs text-muted-foreground">
                Aberto · 40–55 min · ⭐ 4.8
              </p>
            </div>
            {[
              ["Zé Clássico", "R$ 29,90"],
              ["Zé Bacon Duplo", "R$ 39,90"],
              ["Batata Rústica", "R$ 18,90"],
            ].map(([name, price]) => (
              <div
                key={name}
                className="flex items-center justify-between rounded-lg border p-2.5"
              >
                <div>
                  <p className="text-sm font-medium">{name}</p>
                  <p className="text-xs font-bold text-primary">{price}</p>
                </div>
                <div className="flex size-7 items-center justify-center rounded-md bg-primary font-bold text-primary-foreground">
                  +
                </div>
              </div>
            ))}
            <div className="rounded-lg bg-foreground p-2.5 text-center text-sm font-semibold text-background">
              Ver carrinho · R$ 88,70
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
