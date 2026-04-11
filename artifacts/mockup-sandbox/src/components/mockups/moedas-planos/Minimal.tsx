const PLANS = [
  {
    name: "Starter",
    desc: "Para começar",
    coins: 100,
    days: 7,
    features: ["1 grupo ativo", "Comandos básicos", "Suporte por e-mail"],
    missing: 70,
    canAfford: false,
    icon: "◈",
    from: "#6D28D9",
    to: "#7C3AED",
  },
  {
    name: "Pro",
    desc: "Mais popular",
    coins: 300,
    days: 30,
    features: ["5 grupos ativos", "Todos os comandos", "Suporte prioritário"],
    missing: 270,
    canAfford: false,
    icon: "◆",
    from: "#7C3AED",
    to: "#9333EA",
    badge: "POPULAR",
  },
  {
    name: "Premium",
    desc: "Até -1 grupos",
    coins: 500,
    days: 30,
    features: ["Grupos ilimitados", "Todos os recursos Pro", "API de integração"],
    missing: 470,
    canAfford: false,
    icon: "✦",
    from: "#7C3AED",
    to: "#C026D3",
  },
];

export function Minimal() {
  return (
    <div className="w-[390px] min-h-[780px] bg-[#111118] font-sans flex flex-col overflow-hidden">
      {/* Header */}
      <div className="px-6 pt-12 pb-5">
        <h1 className="text-[24px] font-bold text-white tracking-tight">Moedas & Planos</h1>
        <p className="text-[13px] text-[#505060] mt-1.5">R$ 1,00 = 100 moedas</p>
      </div>

      <div className="flex-1 overflow-y-auto">
        <div className="px-6 space-y-6">
          {/* Balance */}
          <div className="py-6 px-6 bg-[#18181F] rounded-3xl">
            <p className="text-xs uppercase tracking-[2px] text-[#505060] mb-3">Saldo atual</p>
            <div className="flex items-center justify-between">
              <div className="flex items-baseline gap-1.5">
                <span className="text-[48px] font-extrabold text-white leading-none tracking-tight">30</span>
                <span className="text-[18px] font-medium text-[#8B5CF6] mb-1">moedas</span>
              </div>
              <div className="w-12 h-12 rounded-2xl bg-[#7C3AED]/10 flex items-center justify-center">
                <span className="text-[#8B5CF6] text-2xl">⚡</span>
              </div>
            </div>
          </div>

          {/* Planos label */}
          <div className="flex items-center gap-2">
            <div className="w-1 h-4 rounded-full bg-[#7C3AED]" />
            <p className="text-[11px] font-bold tracking-[2px] text-[#505060]">PLANOS</p>
          </div>
        </div>

        {/* ── Carrossel ── */}
        <div
          className="flex gap-3 mt-0 pb-2"
          style={{
            overflowX: "scroll",
            scrollSnapType: "x mandatory",
            WebkitOverflowScrolling: "touch",
            paddingLeft: 24,
            paddingRight: 24,
            scrollbarWidth: "none",
          }}
        >
          {PLANS.map((plan) => (
            <div
              key={plan.name}
              className="flex-shrink-0 bg-[#18181F] rounded-3xl p-5 space-y-4"
              style={{
                width: "74%",
                scrollSnapAlign: "start",
              }}
            >
              {/* Card header */}
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div
                    className="w-12 h-12 rounded-2xl flex items-center justify-center text-white text-xl"
                    style={{ background: `linear-gradient(135deg, ${plan.from}, ${plan.to})` }}
                  >
                    {plan.icon}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="text-[18px] font-bold text-white">{plan.name}</p>
                      {plan.badge && (
                        <span className="text-[9px] font-bold text-[#A78BFA] bg-[#7C3AED]/15 px-2 py-0.5 rounded-full border border-[#7C3AED]/30">
                          {plan.badge}
                        </span>
                      )}
                    </div>
                    <p className="text-[12px] text-[#505060]">{plan.desc}</p>
                  </div>
                </div>
                <div className="text-right flex-shrink-0">
                  <p className="text-[24px] font-extrabold text-[#7C3AED]">{plan.coins}</p>
                  <p className="text-[10px] text-[#505060] tracking-wide">MOEDAS / {plan.days}D</p>
                </div>
              </div>

              {/* Divider */}
              <div className="border-t border-[#202028]" />

              {/* Features */}
              <div className="space-y-3">
                {plan.features.map((f) => (
                  <div key={f} className="flex items-center gap-3">
                    <div className="w-5 h-5 rounded-md bg-[#7C3AED]/10 flex items-center justify-center flex-shrink-0">
                      <span className="text-[#7C3AED] text-xs font-bold">✓</span>
                    </div>
                    <span className="text-[13px] text-[#808090]">{f}</span>
                  </div>
                ))}
              </div>

              {/* CTA */}
              <div className="bg-[#111118] rounded-2xl py-3.5 text-center border border-[#202028]">
                <span className="text-[13px] font-semibold text-[#404050]">
                  Faltam {plan.missing} moedas
                </span>
              </div>
            </div>
          ))}
        </div>

        {/* Dots indicator */}
        <div className="flex justify-center gap-1.5 mt-3 mb-2">
          {PLANS.map((p, i) => (
            <div
              key={p.name}
              className={`rounded-full transition-all ${i === 2 ? "w-4 h-1.5 bg-[#7C3AED]" : "w-1.5 h-1.5 bg-[#303040]"}`}
            />
          ))}
        </div>

        <div className="px-6 space-y-6 mt-2">
          {/* Comprar */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <div className="w-1 h-4 rounded-full bg-[#7C3AED]" />
              <p className="text-[11px] font-bold tracking-[2px] text-[#505060]">COMPRAR MOEDAS</p>
            </div>
            <div className="bg-[#18181F] rounded-3xl p-5 space-y-4">
              <div className="grid grid-cols-3 gap-2">
                {["R$5", "R$10", "R$25", "R$50", "R$100"].map((v) => (
                  <div
                    key={v}
                    className="bg-[#111118] rounded-2xl py-3 text-center border border-[#202028]"
                  >
                    <span className="text-[14px] font-semibold text-[#606070]">{v}</span>
                  </div>
                ))}
              </div>
              <p className="text-[10px] font-bold tracking-[2px] text-[#404050]">VALOR PERSONALIZADO</p>
              <div className="bg-[#111118] rounded-2xl px-5 py-4 flex items-center gap-2 border border-[#202028]">
                <span className="text-[20px] font-bold text-[#505060]">R$</span>
                <span className="text-[24px] font-bold text-white">0,00</span>
              </div>
              <div className="bg-[#7C3AED] rounded-2xl py-4 text-center">
                <span className="text-[15px] font-bold text-white">Gerar PIX →</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Nav */}
      <div className="bg-[#111118] border-t border-[#1C1C24] px-2 h-16 flex items-center flex-shrink-0">
        {[["◻", "Hub"], ["⬡", "Bots"]].map(([ic, lb]) => (
          <div key={lb} className="flex-1 flex flex-col items-center gap-1">
            <span className="text-[#404050] text-xl">{ic}</span>
            <span className="text-[10px] font-semibold text-[#404050]">{lb}</span>
          </div>
        ))}
        <div className="w-16 flex flex-col items-center -mt-7">
          <div className="w-14 h-14 rounded-full bg-[#7C3AED] flex items-center justify-center border-4 border-[#111118] shadow-lg shadow-purple-700/40">
            <span className="text-white text-2xl font-bold">+</span>
          </div>
        </div>
        {[["◫", "Moedas", true], ["⚙", "Config"]].map(([ic, lb, on]) => (
          <div key={lb as string} className="flex-1 flex flex-col items-center gap-1">
            <span className={`text-xl ${on ? "text-[#8B5CF6]" : "text-[#404050]"}`}>{ic}</span>
            <span className={`text-[10px] font-semibold ${on ? "text-[#8B5CF6]" : "text-[#404050]"}`}>{lb}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
