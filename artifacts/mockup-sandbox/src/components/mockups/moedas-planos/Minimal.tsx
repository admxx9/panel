export function Minimal() {
  return (
    <div className="w-[390px] min-h-[780px] bg-[#111118] font-sans flex flex-col">
      {/* Header */}
      <div className="px-6 pt-12 pb-5">
        <h1 className="text-[24px] font-bold text-white tracking-tight">Moedas & Planos</h1>
        <p className="text-[13px] text-[#505060] mt-1.5">R$ 1,00 = 100 moedas</p>
      </div>

      <div className="px-6 flex-1 space-y-6">
        {/* Balance */}
        <div className="py-6 px-6 bg-[#18181F] rounded-3xl">
          <p className="text-xs uppercase tracking-[2px] text-[#505060] mb-3">Saldo atual</p>
          <div className="flex items-end gap-2 justify-between">
            <div className="flex items-baseline gap-1.5">
              <span className="text-[48px] font-extrabold text-white leading-none tracking-tight">30</span>
              <span className="text-[18px] font-medium text-[#8B5CF6] mb-1">moedas</span>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-[#7C3AED]/10 flex items-center justify-center">
              <span className="text-[#8B5CF6] text-2xl">⚡</span>
            </div>
          </div>
        </div>

        {/* Planos */}
        <div>
          <div className="flex items-center gap-2 mb-4">
            <div className="w-1 h-4 rounded-full bg-[#7C3AED]" />
            <p className="text-[11px] font-bold tracking-[2px] text-[#505060]">PLANOS</p>
          </div>

          <div className="bg-[#18181F] rounded-3xl p-6 space-y-5">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#7C3AED] to-[#9333EA] flex items-center justify-center">
                  <span className="text-white text-xl">✦</span>
                </div>
                <div>
                  <p className="text-[18px] font-bold text-white">Premium</p>
                  <p className="text-[12px] text-[#505060]">Até -1 grupos</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-[24px] font-extrabold text-[#7C3AED]">500</p>
                <p className="text-[10px] text-[#505060] tracking-wide">MOEDAS / 30D</p>
              </div>
            </div>

            <div className="space-y-3">
              {["Grupos ilimitados","Todos os recursos Pro","API de integração"].map(f => (
                <div key={f} className="flex items-center gap-3">
                  <span className="text-[#7C3AED] text-sm font-bold">✓</span>
                  <span className="text-[13px] text-[#808090]">{f}</span>
                </div>
              ))}
            </div>

            <div className="bg-[#111118] rounded-2xl py-3.5 text-center border border-[#202028]">
              <span className="text-[13px] font-semibold text-[#404050]">Faltam 470 moedas</span>
            </div>
          </div>
        </div>

        {/* Comprar */}
        <div>
          <div className="flex items-center gap-2 mb-4">
            <div className="w-1 h-4 rounded-full bg-[#7C3AED]" />
            <p className="text-[11px] font-bold tracking-[2px] text-[#505060]">COMPRAR MOEDAS</p>
          </div>
          <div className="bg-[#18181F] rounded-3xl p-6 space-y-4">
            <div className="grid grid-cols-3 gap-2">
              {["R$5","R$10","R$25","R$50","R$100"].map(v => (
                <div key={v} className="bg-[#111118] rounded-2xl py-3 text-center border border-[#202028]">
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

      {/* Bottom Nav */}
      <div className="bg-[#111118] border-t border-[#1C1C24] px-2 h-16 flex items-center mt-6">
        {[["◻","Hub"],["⬡","Bots"]].map(([ic,lb]) => (
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
        {[["◫","Moedas",true],["⚙","Config"]].map(([ic,lb,on]) => (
          <div key={lb as string} className="flex-1 flex flex-col items-center gap-1">
            <span className={`text-xl ${on ? "text-[#8B5CF6]" : "text-[#404050]"}`}>{ic}</span>
            <span className={`text-[10px] font-semibold ${on ? "text-[#8B5CF6]" : "text-[#404050]"}`}>{lb}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
