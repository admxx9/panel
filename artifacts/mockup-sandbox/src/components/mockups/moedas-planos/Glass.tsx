export function Glass() {
  return (
    <div className="w-[390px] min-h-[780px] font-sans flex flex-col relative overflow-hidden"
      style={{background:"linear-gradient(160deg,#110D1E 0%,#0A0A14 60%,#0D0A1A 100%)"}}>
      {/* BG blobs */}
      <div className="absolute top-20 left-10 w-48 h-48 rounded-full opacity-20 pointer-events-none"
        style={{background:"radial-gradient(circle,#7C3AED,transparent)",filter:"blur(40px)"}} />
      <div className="absolute top-48 right-0 w-40 h-40 rounded-full opacity-15 pointer-events-none"
        style={{background:"radial-gradient(circle,#EC4899,transparent)",filter:"blur(35px)"}} />

      {/* Header */}
      <div className="px-5 pt-12 pb-4 relative">
        <h1 className="text-[22px] font-bold text-white">Moedas & Planos</h1>
        <p className="text-[13px] text-purple-300/50 mt-1">R$ 1,00 = 100 moedas</p>
      </div>

      <div className="px-5 flex-1 space-y-5 relative">
        {/* Balance Card - Glass */}
        <div className="rounded-2xl p-5 flex justify-between items-start"
          style={{background:"rgba(255,255,255,0.05)",backdropFilter:"blur(20px)",border:"1px solid rgba(255,255,255,0.1)",boxShadow:"0 8px 32px rgba(0,0,0,0.3)"}}>
          <div>
            <p className="text-[13px] text-purple-200/50 mb-2">Saldo atual</p>
            <div className="flex items-baseline gap-1.5">
              <span className="text-[42px] font-bold text-white leading-none">30</span>
              <span className="text-[17px] font-semibold text-purple-300">moedas</span>
            </div>
          </div>
          <div className="w-10 h-10 rounded-xl flex items-center justify-center"
            style={{background:"rgba(124,58,237,0.25)",backdropFilter:"blur(10px)",border:"1px solid rgba(124,58,237,0.4)"}}>
            <span className="text-purple-300 text-xl">⚡</span>
          </div>
        </div>

        {/* Planos label */}
        <div className="flex items-center gap-2">
          <span className="text-purple-400">☆</span>
          <span className="text-[11px] font-bold tracking-[1.6px] text-purple-300/60">PLANOS</span>
        </div>

        {/* Plan Card - Glass */}
        <div className="rounded-2xl p-5 space-y-4"
          style={{background:"rgba(124,58,237,0.08)",backdropFilter:"blur(20px)",border:"1px solid rgba(124,58,237,0.25)",boxShadow:"0 8px 32px rgba(0,0,0,0.2)"}}>
          <div className="flex items-start gap-3">
            <div className="w-11 h-11 rounded-xl flex-shrink-0 flex items-center justify-center text-white"
              style={{background:"linear-gradient(135deg,rgba(124,58,237,0.8),rgba(236,72,153,0.8))",backdropFilter:"blur(10px)",border:"1px solid rgba(255,255,255,0.2)"}}>
              <span className="text-lg">✦</span>
            </div>
            <div className="flex-1">
              <p className="text-[17px] font-bold text-white">Premium</p>
              <p className="text-[12px] text-purple-200/40">Até -1 grupos</p>
            </div>
            <div className="text-right">
              <p className="text-[22px] font-bold text-purple-300">500</p>
              <p className="text-[10px] text-purple-200/40">MOEDAS / 30D</p>
            </div>
          </div>
          <div className="h-px" style={{background:"linear-gradient(90deg,transparent,rgba(124,58,237,0.4),transparent)"}} />
          <div className="space-y-2.5">
            {["Grupos ilimitados","Todos os recursos Pro","API de integração"].map(f => (
              <div key={f} className="flex items-center gap-2.5">
                <div className="w-5 h-5 rounded-md flex items-center justify-center"
                  style={{background:"rgba(124,58,237,0.2)",border:"1px solid rgba(124,58,237,0.3)"}}>
                  <span className="text-purple-300 text-xs">✓</span>
                </div>
                <span className="text-[13px] text-purple-100/60">{f}</span>
              </div>
            ))}
          </div>
          <div className="rounded-xl py-3.5 text-center"
            style={{background:"rgba(30,20,50,0.6)",backdropFilter:"blur(10px)",border:"1px solid rgba(255,255,255,0.08)"}}>
            <span className="text-[14px] font-bold text-purple-200/30">Faltam 470 moedas</span>
          </div>
        </div>

        {/* Comprar */}
        <div className="rounded-2xl p-5 space-y-4"
          style={{background:"rgba(255,255,255,0.04)",backdropFilter:"blur(20px)",border:"1px solid rgba(255,255,255,0.08)"}}>
          <p className="text-[15px] font-bold text-white">COMPRAR MOEDAS</p>
          <div className="grid grid-cols-3 gap-2">
            {["R$5","R$10","R$25","R$50","R$100"].map(v => (
              <div key={v} className="rounded-xl py-2.5 text-center"
                style={{background:"rgba(255,255,255,0.05)",border:"1px solid rgba(255,255,255,0.08)"}}>
                <span className="text-[14px] font-semibold text-white/50">{v}</span>
              </div>
            ))}
          </div>
          <p className="text-[11px] font-bold text-white/30 tracking-wider">VALOR PERSONALIZADO</p>
          <div className="rounded-xl px-4 py-3.5 flex items-center gap-2"
            style={{background:"rgba(255,255,255,0.05)",border:"1px solid rgba(124,58,237,0.3)"}}>
            <span className="text-[18px] font-bold text-white/40">R$</span>
            <span className="text-[22px] font-bold text-white">0,00</span>
          </div>
          <div className="rounded-xl py-4 text-center"
            style={{background:"linear-gradient(90deg,rgba(124,58,237,0.9),rgba(79,70,229,0.9))",backdropFilter:"blur(10px)",boxShadow:"0 4px 24px rgba(124,58,237,0.35)"}}>
            <span className="text-[15px] font-bold text-white">Gerar PIX →</span>
          </div>
        </div>
      </div>

      {/* Bottom Nav */}
      <div className="px-2 h-16 flex items-center mt-4"
        style={{background:"rgba(8,8,20,0.85)",backdropFilter:"blur(20px)",borderTop:"1px solid rgba(255,255,255,0.06)"}}>
        {[["◻","Hub"],["⬡","Bots"]].map(([ic,lb]) => (
          <div key={lb} className="flex-1 flex flex-col items-center gap-1">
            <span className="text-white/20 text-xl">{ic}</span>
            <span className="text-[10px] font-semibold text-white/20">{lb}</span>
          </div>
        ))}
        <div className="w-16 flex flex-col items-center -mt-7">
          <div className="w-14 h-14 rounded-full flex items-center justify-center border-4 border-[#08080F]"
            style={{background:"linear-gradient(135deg,#7C3AED,#EC4899)",boxShadow:"0 0 24px rgba(124,58,237,0.6)"}}>
            <span className="text-white text-2xl font-bold">+</span>
          </div>
        </div>
        {[["◫","Moedas",true],["⚙","Config"]].map(([ic,lb,on]) => (
          <div key={lb as string} className="flex-1 flex flex-col items-center gap-1">
            <span className={`text-xl ${on ? "text-purple-300" : "text-white/20"}`}>{ic}</span>
            <span className={`text-[10px] font-semibold ${on ? "text-purple-300" : "text-white/20"}`}>{lb}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
