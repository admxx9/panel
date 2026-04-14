export function Classico() {
  return (
    <div className="w-[390px] min-h-[780px] bg-[#0D0D12] font-sans flex flex-col">
      {/* Header */}
      <div className="px-5 pt-12 pb-4">
        <h1 className="text-[22px] font-bold text-white leading-tight">Moedas & Planos</h1>
        <p className="text-[13px] text-[#6B6B80] mt-1">R$ 1,00 = 100 moedas</p>
      </div>

      <div className="px-5 flex-1 overflow-y-auto space-y-5">
        {/* Balance Card */}
        <div className="bg-[#141320] rounded-2xl border border-[#252235] p-5 flex justify-between items-start shadow-lg shadow-purple-950/20">
          <div>
            <p className="text-[13px] text-[#6B6B80] mb-2">Saldo atual</p>
            <div className="flex items-baseline gap-1.5">
              <span className="text-[40px] font-bold text-white leading-none">30</span>
              <span className="text-[17px] font-semibold text-[#A78BFA]">moedas</span>
            </div>
          </div>
          <span className="text-3xl text-[#7C3AED] opacity-70">⚡</span>
        </div>

        {/* Planos Label */}
        <div className="flex items-center gap-2">
          <span className="text-[#7C3AED]">☆</span>
          <span className="text-[11px] font-bold text-[#6B6B80] tracking-[1.6px]">PLANOS</span>
        </div>

        {/* Plan Card */}
        <div className="bg-[#141320] rounded-2xl border border-[#252235] p-5 space-y-4">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#7C3AED] to-[#C026D3] flex items-center justify-center text-white text-lg flex-shrink-0">
              ✦
            </div>
            <div className="flex-1">
              <p className="text-[17px] font-bold text-white">Premium</p>
              <p className="text-[12px] text-[#6B6B80]">Até -1 grupos</p>
            </div>
            <div className="text-right">
              <p className="text-[22px] font-bold text-[#7C3AED]">500</p>
              <p className="text-[10px] text-[#6B6B80]">MOEDAS / 30D</p>
            </div>
          </div>
          <div className="border-t border-[#252235]" />
          <div className="space-y-2.5">
            {["Grupos ilimitados","Todos os recursos Pro","API de integração"].map(f => (
              <div key={f} className="flex items-center gap-2.5">
                <div className="w-5 h-5 rounded-md bg-[#7C3AED]/10 flex items-center justify-center">
                  <span className="text-[#A78BFA] text-xs">✓</span>
                </div>
                <span className="text-[13px] text-[#A0A0B5]">{f}</span>
              </div>
            ))}
          </div>
          <div className="bg-[#1A1828] border border-[#252235] rounded-xl py-3.5 text-center">
            <span className="text-[14px] font-bold text-[#4A4A60]">Faltam 470 moedas</span>
          </div>
        </div>

        {/* Comprar Moedas */}
        <div className="bg-[#141320] rounded-2xl border border-[#252235] p-5 space-y-4">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-[#7C3AED]/10 flex items-center justify-center">
              <span className="text-[#A78BFA] text-sm">⚡</span>
            </div>
            <p className="text-[15px] font-bold text-white">COMPRAR MOEDAS</p>
          </div>
          <div className="grid grid-cols-3 gap-2">
            {["R$5","R$10","R$25","R$50","R$100"].map(v => (
              <div key={v} className="bg-[#1A1828] border border-[#252235] rounded-xl py-2.5 text-center">
                <span className="text-[14px] font-semibold text-[#A0A0B5]">{v}</span>
              </div>
            ))}
          </div>
          <p className="text-[11px] font-bold text-[#6B6B80] tracking-wider">VALOR PERSONALIZADO</p>
          <div className="bg-[#1A1828] border border-[#252235] rounded-xl px-4 py-3.5 flex items-center gap-2">
            <span className="text-[18px] font-bold text-[#6B6B80]">R$</span>
            <span className="text-[22px] font-bold text-white">0,00</span>
          </div>
          <div className="bg-gradient-to-r from-[#7C3AED] to-[#4F46E5] rounded-xl py-4 text-center">
            <span className="text-[15px] font-bold text-white">Gerar PIX →</span>
          </div>
        </div>
      </div>

      {/* Bottom Nav */}
      <div className="bg-[#0D0D12] border-t border-[#1E1E2A] px-2 h-16 flex items-center relative">
        {[["◻","Hub"],["⬡","Bots"]].map(([ic,lb]) => (
          <div key={lb} className="flex-1 flex flex-col items-center gap-1">
            <span className="text-[#555568] text-xl">{ic}</span>
            <span className="text-[10px] font-semibold text-[#555568]">{lb}</span>
          </div>
        ))}
        <div className="w-16 flex flex-col items-center -mt-6">
          <div className="w-14 h-14 rounded-full bg-gradient-to-br from-[#7C3AED] to-[#4F46E5] flex items-center justify-center shadow-lg shadow-purple-700/50 border-4 border-[#0D0D12]">
            <span className="text-white text-2xl font-bold">+</span>
          </div>
        </div>
        {[["◫","Moedas",true],["⚙","Config"]].map(([ic,lb,active]) => (
          <div key={lb as string} className="flex-1 flex flex-col items-center gap-1">
            <span className={`text-xl ${active ? "text-[#A78BFA]" : "text-[#555568]"}`}>{ic}</span>
            <span className={`text-[10px] font-semibold ${active ? "text-[#A78BFA]" : "text-[#555568]"}`}>{lb}</span>
            {active && <div className="absolute bottom-1.5 w-1 h-1 rounded-full bg-[#7C3AED]" style={{marginLeft:60}} />}
          </div>
        ))}
      </div>
    </div>
  );
}
