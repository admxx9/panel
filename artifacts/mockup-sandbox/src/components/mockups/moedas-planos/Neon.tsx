export function Neon() {
  return (
    <div className="w-[390px] min-h-[780px] bg-[#08080F] font-sans flex flex-col">
      {/* Header */}
      <div className="px-5 pt-12 pb-4">
        <h1 className="text-[22px] font-bold text-white">Moedas & Planos</h1>
        <p className="text-[13px] text-[#555570] mt-1">R$ 1,00 = 100 moedas</p>
      </div>

      <div className="px-5 flex-1 space-y-5">
        {/* Balance Card */}
        <div className="relative rounded-2xl border border-purple-500/30 p-5 overflow-hidden bg-[#0F0F1A]"
          style={{boxShadow:"0 0 24px rgba(124,58,237,0.15)"}}>
          <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 to-transparent pointer-events-none" />
          <div className="flex justify-between items-start">
            <div>
              <p className="text-[13px] text-[#6060A0] mb-2">Saldo atual</p>
              <div className="flex items-baseline gap-1.5">
                <span className="text-[42px] font-bold text-white leading-none">30</span>
                <span className="text-[17px] font-semibold text-purple-400">moedas</span>
              </div>
            </div>
            <span className="text-3xl" style={{filter:"drop-shadow(0 0 8px #7C3AED)"}}>⚡</span>
          </div>
          <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-purple-500/60 to-transparent" />
        </div>

        {/* Planos label */}
        <div className="flex items-center gap-2">
          <span className="text-purple-400">☆</span>
          <span className="text-[11px] font-bold tracking-[1.6px]" style={{color:"#8B5CF6"}}>PLANOS</span>
        </div>

        {/* Plan Card */}
        <div className="rounded-2xl border border-purple-500/40 p-5 space-y-4 bg-[#0F0F1A]"
          style={{boxShadow:"0 0 30px rgba(124,58,237,0.12)"}}>
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-xl flex-shrink-0 flex items-center justify-center text-white text-lg"
              style={{background:"linear-gradient(135deg,#7C3AED,#EC4899)",boxShadow:"0 0 16px rgba(124,58,237,0.5)"}}>
              ✦
            </div>
            <div className="flex-1">
              <p className="text-[17px] font-bold text-white">Premium</p>
              <p className="text-[12px] text-[#6060A0]">Até -1 grupos</p>
            </div>
            <div className="text-right">
              <p className="text-[22px] font-bold" style={{color:"#A855F7",textShadow:"0 0 12px rgba(168,85,247,0.5)"}}>500</p>
              <p className="text-[10px] text-[#6060A0]">MOEDAS / 30D</p>
            </div>
          </div>
          <div className="h-px bg-gradient-to-r from-transparent via-purple-500/40 to-transparent" />
          <div className="space-y-2.5">
            {["Grupos ilimitados","Todos os recursos Pro","API de integração"].map(f => (
              <div key={f} className="flex items-center gap-2.5">
                <div className="w-5 h-5 rounded-md bg-purple-500/15 flex items-center justify-center">
                  <span style={{color:"#A855F7",textShadow:"0 0 6px rgba(168,85,247,0.8)"}} className="text-xs">✓</span>
                </div>
                <span className="text-[13px] text-[#9090C0]">{f}</span>
              </div>
            ))}
          </div>
          <div className="bg-[#141428] border border-[#252248] rounded-xl py-3.5 text-center">
            <span className="text-[14px] font-bold text-[#404060]">Faltam 470 moedas</span>
          </div>
        </div>

        {/* Comprar Moedas */}
        <div className="rounded-2xl border border-[#1E1E38] p-5 space-y-4 bg-[#0F0F1A]">
          <p className="text-[15px] font-bold text-white">⚡ COMPRAR MOEDAS</p>
          <div className="grid grid-cols-3 gap-2">
            {["R$5","R$10","R$25","R$50","R$100"].map(v => (
              <div key={v} className="border border-[#1E1E38] rounded-xl py-2.5 text-center hover:border-purple-500/50 transition-colors bg-[#141428]">
                <span className="text-[14px] font-semibold text-[#7070A0]">{v}</span>
              </div>
            ))}
          </div>
          <p className="text-[11px] font-bold text-[#6060A0] tracking-wider">VALOR PERSONALIZADO</p>
          <div className="border border-purple-500/30 rounded-xl px-4 py-3.5 flex items-center gap-2 bg-[#141428]"
            style={{boxShadow:"0 0 12px rgba(124,58,237,0.1)"}}>
            <span className="text-[18px] font-bold text-[#6060A0]">R$</span>
            <span className="text-[22px] font-bold text-white">0,00</span>
          </div>
          <div className="rounded-xl py-4 text-center"
            style={{background:"linear-gradient(90deg,#7C3AED,#4F46E5)",boxShadow:"0 4px 20px rgba(124,58,237,0.4)"}}>
            <span className="text-[15px] font-bold text-white">Gerar PIX →</span>
          </div>
        </div>
      </div>

      {/* Bottom Nav */}
      <div className="bg-[#08080F] border-t border-[#1A1A30] px-2 h-16 flex items-center mt-4">
        {[["◻","Hub"],["⬡","Bots"]].map(([ic,lb]) => (
          <div key={lb} className="flex-1 flex flex-col items-center gap-1">
            <span className="text-[#404060] text-xl">{ic}</span>
            <span className="text-[10px] font-semibold text-[#404060]">{lb}</span>
          </div>
        ))}
        <div className="w-16 flex flex-col items-center -mt-7">
          <div className="w-14 h-14 rounded-full flex items-center justify-center border-4 border-[#08080F]"
            style={{background:"linear-gradient(135deg,#7C3AED,#4F46E5)",boxShadow:"0 0 20px rgba(124,58,237,0.7)"}}>
            <span className="text-white text-2xl font-bold">+</span>
          </div>
        </div>
        {[["◫","Moedas",true],["⚙","Config"]].map(([ic,lb,on]) => (
          <div key={lb as string} className="flex-1 flex flex-col items-center gap-1">
            <span className={`text-xl ${on ? "text-purple-400" : "text-[#404060]"}`} style={on ? {textShadow:"0 0 8px rgba(168,85,247,0.6)"} : {}}>{ic}</span>
            <span className={`text-[10px] font-semibold ${on ? "text-purple-400" : "text-[#404060]"}`}>{lb}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
