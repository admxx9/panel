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

export function Classico() {
  return (
    <div className="w-[390px] min-h-[780px] bg-[#0D0D12] font-sans flex flex-col">
      {/* Header */}
      <div className="px-5 pt-12 pb-4">
        <h1 className="text-[22px] font-bold text-white">Configuracoes</h1>
      </div>

      <div className="px-5 flex-1 space-y-4">
        {/* User Card */}
        <div className="bg-[#141320] border border-[#252235] rounded-2xl p-4 flex items-center gap-3">
          <div className="w-12 h-12 rounded-full bg-[#7C3AED] flex items-center justify-center flex-shrink-0">
            <span className="text-white text-[18px] font-bold">T</span>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-[16px] font-bold text-white">teste</p>
            <p className="text-[12px] text-[#6B6B80] truncate">62993736175</p>
          </div>
          <div className="w-9 h-9 rounded-xl bg-[#1E1E2A] flex items-center justify-center">
            <span className="text-[#6B6B80] text-lg">⚙</span>
          </div>
        </div>

        {/* Stat Cards */}
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-[#141320] border border-[#252235] rounded-2xl p-4">
            <p className="text-[10px] font-bold text-[#6B6B80] tracking-widest mb-2">SALDO</p>
            <p className="text-[24px] font-extrabold text-white leading-none">30</p>
            <p className="text-[11px] text-[#6B6B80] mt-1">Moedas disponíveis</p>
          </div>
          <div className="bg-[#141320] border border-[#252235] rounded-2xl p-4">
            <p className="text-[10px] font-bold text-[#6B6B80] tracking-widest mb-2">PLANO</p>
            <p className="text-[20px] font-extrabold text-[#A78BFA] leading-none">Gratuito</p>
            <p className="text-[11px] text-[#6B6B80] mt-1">Não há nenhum</p>
          </div>
        </div>

        {/* SUA CONTA */}
        <div>
          <p className="text-[11px] font-bold text-[#6B6B80] tracking-[1.6px] mb-2">SUA CONTA</p>
          <div className="bg-[#141320] border border-[#252235] rounded-2xl overflow-hidden">
            {menuItems.map((item, i) => (
              <div
                key={item.label}
                className={`flex items-center gap-3 px-4 py-3.5 ${i < menuItems.length - 1 ? "border-b border-[#252235]" : ""}`}
              >
                <div className="w-8 h-8 rounded-lg bg-[#1E1E2A] flex items-center justify-center flex-shrink-0">
                  <span className="text-[#A78BFA] text-sm">{item.icon}</span>
                </div>
                <span className="flex-1 text-[14px] font-medium text-white">{item.label}</span>
                {item.badge && (
                  <span className="text-[12px] font-semibold text-[#A78BFA] mr-1">{item.badge}</span>
                )}
                <span className="text-[#3D3D52] text-lg">›</span>
              </div>
            ))}
          </div>
        </div>

        {/* PREFERENCIAS */}
        <div>
          <p className="text-[11px] font-bold text-[#6B6B80] tracking-[1.6px] mb-2">PREFERENCIAS</p>
          <div className="bg-[#141320] border border-[#252235] rounded-2xl overflow-hidden">
            {prefs.map((item, i) => (
              <div
                key={item.label}
                className={`flex items-center gap-3 px-4 py-3.5 ${i < prefs.length - 1 ? "border-b border-[#252235]" : ""}`}
              >
                <div className="w-8 h-8 rounded-lg bg-[#1E1E2A] flex items-center justify-center flex-shrink-0">
                  <span className="text-sm">{item.icon}</span>
                </div>
                <span className="flex-1 text-[14px] font-medium text-white">{item.label}</span>
                <span className="text-[#3D3D52] text-lg">›</span>
              </div>
            ))}
          </div>
        </div>

        {/* Logout */}
        <button className="w-full border border-[#7C3AED]/40 rounded-2xl py-3.5 text-center">
          <span className="text-[14px] font-bold text-[#7C3AED]">Sair da conta</span>
        </button>
      </div>

      {/* Bottom Nav */}
      <div className="bg-[#0D0D12] border-t border-[#1E1E2A] px-2 h-16 flex items-center mt-4">
        {[["◻","Hub"],["⬡","Bots"]].map(([ic,lb]) => (
          <div key={lb} className="flex-1 flex flex-col items-center gap-1">
            <span className="text-[#555568] text-xl">{ic}</span>
            <span className="text-[10px] font-semibold text-[#555568]">{lb}</span>
          </div>
        ))}
        <div className="w-16 flex flex-col items-center -mt-7">
          <div className="w-14 h-14 rounded-full bg-gradient-to-br from-[#7C3AED] to-[#4F46E5] flex items-center justify-center border-4 border-[#0D0D12] shadow-lg shadow-purple-700/50">
            <span className="text-white text-2xl font-bold">+</span>
          </div>
        </div>
        {[["◫","Moedas"],["⚙","Config",true]].map(([ic,lb,on]) => (
          <div key={lb as string} className="flex-1 flex flex-col items-center gap-1">
            <span className={`text-xl ${on ? "text-[#A78BFA]" : "text-[#555568]"}`}>{ic}</span>
            <span className={`text-[10px] font-semibold ${on ? "text-[#A78BFA]" : "text-[#555568]"}`}>{lb}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
