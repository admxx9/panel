export function Fintech() {
  return (
    <div className="w-[390px] min-h-[780px] bg-[#0A0A10] font-sans flex flex-col">
      {/* Header */}
      <div className="px-5 pt-12 pb-4">
        <h1 className="text-[22px] font-bold text-white">Moedas & Planos</h1>
        <p className="text-[13px] text-[#5A5A70] mt-1">R$ 1,00 = 100 moedas</p>
      </div>

      <div className="px-5 flex-1 space-y-5">
        {/* Balance - Full width gradient card */}
        <div className="rounded-2xl p-5 relative overflow-hidden"
          style={{background:"linear-gradient(135deg,#1E1040 0%,#160D30 50%,#0F0A20 100%)",border:"1px solid rgba(124,58,237,0.3)"}}>
          <div className="absolute top-0 right-0 w-32 h-32 rounded-full opacity-20"
            style={{background:"radial-gradient(circle,#7C3AED,transparent)",transform:"translate(30%,-30%)"}} />
          <div className="flex justify-between items-start relative">
            <div>
              <p className="text-[12px] font-semibold text-purple-300/50 tracking-wider mb-2">SALDO ATUAL</p>
              <div className="flex items-baseline gap-1.5">
                <span className="text-[44px] font-extrabold text-white leading-none">30</span>
                <span className="text-[16px] font-semibold text-[#A78BFA]">moedas</span>
              </div>
            </div>
            <div className="w-11 h-11 rounded-2xl flex items-center justify-center"
              style={{background:"rgba(124,58,237,0.3)",border:"1px solid rgba(124,58,237,0.5)"}}>
              <span className="text-[#A78BFA] text-2xl">⚡</span>
            </div>
          </div>
        </div>

        {/* Section */}
        <div className="flex items-center gap-2">
          <span className="text-yellow-400 text-sm">★</span>
          <p className="text-[11px] font-bold tracking-[1.8px] text-[#5A5A70]">PLANOS</p>
        </div>

        {/* Plan Card - Bordered accent */}
        <div className="rounded-2xl p-5 space-y-4 relative overflow-hidden"
          style={{background:"#141420",border:"1px solid #252238"}}>
          <div className="absolute top-0 left-0 w-1 h-full bg-gradient-to-b from-[#7C3AED] to-[#EC4899]" />
          <div className="pl-2">
            <div className="flex items-start gap-3">
              <div className="w-11 h-11 rounded-2xl flex-shrink-0 flex items-center justify-center text-white"
                style={{background:"linear-gradient(135deg,#7C3AED,#EC4899)"}}>
                <span className="text-lg font-bold">P</span>
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-0.5">
                  <p className="text-[17px] font-bold text-white">Premium</p>
                  <span className="text-[9px] font-bold text-[#A78BFA] bg-[#7C3AED]/15 px-2 py-0.5 rounded-full border border-[#7C3AED]/30">TOP</span>
                </div>
                <p className="text-[12px] text-[#5A5A70]">Até -1 grupos</p>
              </div>
              <div className="text-right">
                <p className="text-[24px] font-extrabold" style={{background:"linear-gradient(135deg,#A78BFA,#EC4899)",WebkitBackgroundClip:"text",WebkitTextFillColor:"transparent"}}>500</p>
                <p className="text-[10px] text-[#5A5A70]">moedas/30d</p>
              </div>
            </div>
            <div className="h-px bg-[#252238] my-4" />
            <div className="space-y-2.5">
              {["Grupos ilimitados","Todos os recursos Pro","API de integração"].map(f => (
                <div key={f} className="flex items-center gap-2.5">
                  <div className="w-5 h-5 rounded-full bg-green-500/10 flex items-center justify-center">
                    <span className="text-green-400 text-xs">✓</span>
                  </div>
                  <span className="text-[13px] text-[#8080A0]">{f}</span>
                </div>
              ))}
            </div>
            <div className="mt-4 bg-[#0E0E1A] border border-[#252238] rounded-xl py-3.5 text-center">
              <span className="text-[13px] font-bold text-[#3A3A50]">Faltam 470 moedas</span>
            </div>
          </div>
        </div>

        {/* Comprar */}
        <div className="rounded-2xl p-5 space-y-4" style={{background:"#141420",border:"1px solid #252238"}}>
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-[#7C3AED]/15 flex items-center justify-center">
              <span className="text-[#A78BFA] text-sm">⚡</span>
            </div>
            <p className="text-[14px] font-bold text-white tracking-wide">COMPRAR MOEDAS</p>
          </div>
          <div className="grid grid-cols-3 gap-2">
            {["R$5","R$10","R$25","R$50","R$100"].map(v => (
              <div key={v} className="bg-[#0E0E1A] border border-[#252238] rounded-xl py-2.5 text-center">
                <span className="text-[14px] font-semibold text-[#6060A0]">{v}</span>
              </div>
            ))}
          </div>
          <p className="text-[10px] font-bold tracking-[1.8px] text-[#5A5A70]">VALOR PERSONALIZADO</p>
          <div className="bg-[#0E0E1A] border border-[#7C3AED]/30 rounded-xl px-4 py-3.5 flex items-center gap-2">
            <span className="text-[18px] font-bold text-[#5A5A70]">R$</span>
            <span className="text-[22px] font-bold text-white">0,00</span>
          </div>
          <button className="w-full rounded-xl py-4 text-center text-[15px] font-bold text-white"
            style={{background:"linear-gradient(90deg,#7C3AED,#4F46E5)"}}>
            Gerar PIX →
          </button>
        </div>
      </div>

      {/* Bottom Nav */}
      <div className="bg-[#0A0A10] border-t border-[#1A1A28] px-2 h-16 flex items-center mt-5">
        {[["◻","Hub"],["⬡","Bots"]].map(([ic,lb]) => (
          <div key={lb} className="flex-1 flex flex-col items-center gap-1">
            <span className="text-[#3A3A50] text-xl">{ic}</span>
            <span className="text-[10px] font-semibold text-[#3A3A50]">{lb}</span>
          </div>
        ))}
        <div className="w-16 flex flex-col items-center -mt-7">
          <div className="w-14 h-14 rounded-full flex items-center justify-center border-4 border-[#0A0A10]"
            style={{background:"linear-gradient(135deg,#7C3AED,#4F46E5)",boxShadow:"0 6px 20px rgba(124,58,237,0.45)"}}>
            <span className="text-white text-2xl font-bold">+</span>
          </div>
        </div>
        {[["◫","Moedas",true],["⚙","Config"]].map(([ic,lb,on]) => (
          <div key={lb as string} className="flex-1 flex flex-col items-center gap-1">
            <span className={`text-xl ${on ? "text-[#A78BFA]" : "text-[#3A3A50]"}`}>{ic}</span>
            <span className={`text-[10px] font-semibold ${on ? "text-[#A78BFA]" : "text-[#3A3A50]"}`}>{lb}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
