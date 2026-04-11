const menuItems = [
  { icon: "◫", label: "Meus Bots",      badge: "1 Ativos" },
  { icon: "⚡", label: "Comprar Moedas", badge: "" },
  { icon: "☆",  label: "Ver Planos",     badge: "" },
];
const prefs = [
  { icon: "🔔", label: "Notificações" },
  { icon: "🔒", label: "Segurança" },
  { icon: "❓", label: "Suporte" },
  { icon: "📋", label: "Termos de uso" },
];

export function Neon() {
  return (
    <div className="w-[390px] min-h-[780px] bg-[#08080F] font-sans flex flex-col">
      <div className="px-5 pt-12 pb-4">
        <h1 className="text-[22px] font-bold text-white">Configuracoes</h1>
      </div>

      <div className="px-5 flex-1 space-y-4">
        {/* User Card */}
        <div className="rounded-2xl border border-purple-500/30 p-4 flex items-center gap-3 bg-[#0F0F1A]"
          style={{ boxShadow: "0 0 24px rgba(124,58,237,0.12)" }}>
          <div className="w-13 h-13 w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0"
            style={{ background: "linear-gradient(135deg,#7C3AED,#EC4899)", boxShadow: "0 0 16px rgba(124,58,237,0.5)" }}>
            <span className="text-white text-[18px] font-bold">T</span>
          </div>
          <div className="flex-1">
            <p className="text-[16px] font-bold text-white">teste</p>
            <p className="text-[12px] text-[#5050A0]">62993736175</p>
          </div>
          <div className="w-9 h-9 rounded-xl bg-[#141428] border border-[#1E1E38] flex items-center justify-center">
            <span className="text-[#5050A0] text-lg">⚙</span>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 gap-3">
          {[
            { label: "SALDO", value: "30", sub: "Moedas disponíveis", valColor: "#FFF" },
            { label: "PLANO", value: "Gratuito", sub: "Não há nenhum", valColor: "#A855F7" },
          ].map(stat => (
            <div key={stat.label} className="rounded-2xl border border-[#1A1A38] p-4 bg-[#0F0F1A]">
              <p className="text-[10px] font-bold text-[#5050A0] tracking-widest mb-2">{stat.label}</p>
              <p className="text-[22px] font-extrabold leading-none" style={{ color: stat.valColor, textShadow: stat.valColor === "#A855F7" ? "0 0 12px rgba(168,85,247,0.4)" : "none" }}>{stat.value}</p>
              <p className="text-[11px] text-[#5050A0] mt-1">{stat.sub}</p>
            </div>
          ))}
        </div>

        {/* SUA CONTA */}
        <div>
          <p className="text-[11px] font-bold text-[#5050A0] tracking-[1.6px] mb-2">SUA CONTA</p>
          <div className="rounded-2xl border border-[#1A1A38] overflow-hidden bg-[#0F0F1A]">
            {menuItems.map((item, i) => (
              <div key={item.label}
                className={`flex items-center gap-3 px-4 py-3.5 ${i < menuItems.length - 1 ? "border-b border-[#1A1A38]" : ""}`}>
                <div className="w-8 h-8 rounded-lg bg-purple-500/10 flex items-center justify-center flex-shrink-0"
                  style={{ border: "1px solid rgba(124,58,237,0.2)" }}>
                  <span className="text-purple-400 text-sm">{item.icon}</span>
                </div>
                <span className="flex-1 text-[14px] font-medium text-white">{item.label}</span>
                {item.badge && <span className="text-[12px] font-semibold text-purple-400 mr-1">{item.badge}</span>}
                <span className="text-[#303060] text-lg">›</span>
              </div>
            ))}
          </div>
        </div>

        {/* PREFERENCIAS */}
        <div>
          <p className="text-[11px] font-bold text-[#5050A0] tracking-[1.6px] mb-2">PREFERENCIAS</p>
          <div className="rounded-2xl border border-[#1A1A38] overflow-hidden bg-[#0F0F1A]">
            {prefs.map((item, i) => (
              <div key={item.label}
                className={`flex items-center gap-3 px-4 py-3.5 ${i < prefs.length - 1 ? "border-b border-[#1A1A38]" : ""}`}>
                <div className="w-8 h-8 rounded-lg bg-[#141428] flex items-center justify-center flex-shrink-0">
                  <span className="text-sm">{item.icon}</span>
                </div>
                <span className="flex-1 text-[14px] font-medium text-white">{item.label}</span>
                <span className="text-[#303060] text-lg">›</span>
              </div>
            ))}
          </div>
        </div>

        <button className="w-full rounded-2xl py-3.5 text-center"
          style={{ border: "1px solid rgba(124,58,237,0.4)", boxShadow: "0 0 16px rgba(124,58,237,0.1)" }}>
          <span className="text-[14px] font-bold" style={{ color: "#A855F7", textShadow: "0 0 10px rgba(168,85,247,0.5)" }}>Sair da conta</span>
        </button>
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
            style={{ background: "linear-gradient(135deg,#7C3AED,#4F46E5)", boxShadow: "0 0 20px rgba(124,58,237,0.7)" }}>
            <span className="text-white text-2xl font-bold">+</span>
          </div>
        </div>
        {[["◫","Moedas"],["⚙","Config",true]].map(([ic,lb,on]) => (
          <div key={lb as string} className="flex-1 flex flex-col items-center gap-1">
            <span className={`text-xl ${on ? "text-purple-400" : "text-[#404060]"}`}
              style={on ? { textShadow: "0 0 8px rgba(168,85,247,0.6)" } : {}}>{ic}</span>
            <span className={`text-[10px] font-semibold ${on ? "text-purple-400" : "text-[#404060]"}`}>{lb}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
