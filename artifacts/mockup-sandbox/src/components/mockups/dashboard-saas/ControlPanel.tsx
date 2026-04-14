import React from "react";
import { 
  Bell, 
  Settings, 
  MessageCircle, 
  Headphones, 
  Send, 
  Activity, 
  ArrowUpRight, 
  Plus, 
  MoreVertical, 
  CheckCircle2, 
  AlertCircle,
  BarChart3,
  Globe,
  Workflow
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export function ControlPanel() {
  return (
    <div className="min-h-[844px] w-full max-w-[390px] mx-auto bg-[#0A0A0F] text-[#F0F0F5] font-sans flex flex-col relative overflow-hidden selection:bg-[#7C3AED]/30">
      
      {/* Header */}
      <header className="sticky top-0 z-20 flex items-center justify-between px-4 py-3 bg-[#0A0A0F]/80 backdrop-blur-xl border-b border-[#1E1E2A]">
        <div className="flex items-center gap-3">
          <Avatar className="h-8 w-8 ring-1 ring-[#1E1E2A]">
            <AvatarImage src="/__mockup/images/avatar.png" alt="João Silva" />
            <AvatarFallback className="bg-[#1A1A24] text-xs font-medium">JS</AvatarFallback>
          </Avatar>
          <div className="flex flex-col">
            <span className="text-sm font-semibold leading-none">João Silva</span>
            <span className="text-[10px] text-[#7A7A8A] mt-1 font-medium flex items-center gap-1">
              <Badge variant="outline" className="h-4 px-1 text-[8px] bg-[#7C3AED]/10 text-[#7C3AED] border-[#7C3AED]/20 uppercase tracking-wider rounded-sm">Pro</Badge>
              Workspace
            </span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" className="h-8 w-8 text-[#7A7A8A] hover:text-[#F0F0F5] hover:bg-[#1A1A24]">
            <Bell className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="icon" className="h-8 w-8 text-[#7A7A8A] hover:text-[#F0F0F5] hover:bg-[#1A1A24]">
            <Settings className="h-4 w-4" />
          </Button>
        </div>
      </header>

      <main className="flex-1 overflow-y-auto pb-20">
        <div className="p-4 space-y-6">
          
          {/* KPI Row */}
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-[#12121A] border border-[#1E1E2A] rounded-xl p-3 flex flex-col relative overflow-hidden group hover:border-[#7C3AED]/50 transition-colors">
              <div className="absolute top-0 right-0 p-2 opacity-10 group-hover:opacity-20 transition-opacity">
                <Globe className="h-10 w-10 text-[#7C3AED]" />
              </div>
              <span className="text-xs text-[#7A7A8A] font-medium flex items-center gap-1.5">
                <Activity className="h-3.5 w-3.5 text-[#22C55E]" />
                Active Bots
              </span>
              <div className="flex items-end gap-2 mt-2">
                <span className="text-2xl font-bold tracking-tight">2<span className="text-[#7A7A8A] text-sm font-medium">/3</span></span>
              </div>
            </div>
            
            <div className="bg-[#12121A] border border-[#1E1E2A] rounded-xl p-3 flex flex-col relative overflow-hidden group hover:border-[#7C3AED]/50 transition-colors">
              <div className="absolute top-0 right-0 p-2 opacity-10 group-hover:opacity-20 transition-opacity">
                <BarChart3 className="h-10 w-10 text-[#7C3AED]" />
              </div>
              <span className="text-xs text-[#7A7A8A] font-medium flex items-center gap-1.5">
                Total Messages
              </span>
              <div className="flex items-end justify-between mt-2">
                <span className="text-2xl font-bold tracking-tight">2.1K</span>
                <span className="flex items-center text-[10px] text-[#22C55E] font-medium bg-[#22C55E]/10 px-1.5 py-0.5 rounded-md mb-1">
                  <ArrowUpRight className="h-3 w-3 mr-0.5" />
                  12%
                </span>
              </div>
            </div>
          </div>

          {/* Create Bot */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-semibold tracking-wide uppercase text-[#7A7A8A]">Create Connection</h2>
            </div>
            <div className="grid grid-cols-3 gap-2">
              <button className="flex flex-col items-center justify-center p-3 rounded-xl bg-[#12121A] border border-[#1E1E2A] hover:border-[#25D366] hover:bg-[#25D366]/5 transition-all group h-[88px]">
                <div className="h-10 w-10 rounded-full bg-[#1A1A24] group-hover:bg-[#25D366]/10 flex items-center justify-center mb-2 transition-colors">
                  <MessageCircle className="h-5 w-5 text-[#25D366]" />
                </div>
                <span className="text-[10px] font-medium text-[#F0F0F5]">WhatsApp</span>
              </button>
              
              <button className="flex flex-col items-center justify-center p-3 rounded-xl bg-[#12121A] border border-[#1E1E2A] hover:border-[#5865F2] hover:bg-[#5865F2]/5 transition-all group h-[88px]">
                <div className="h-10 w-10 rounded-full bg-[#1A1A24] group-hover:bg-[#5865F2]/10 flex items-center justify-center mb-2 transition-colors">
                  <Headphones className="h-5 w-5 text-[#5865F2]" />
                </div>
                <span className="text-[10px] font-medium text-[#F0F0F5]">Discord</span>
              </button>

              <button className="flex flex-col items-center justify-center p-3 rounded-xl bg-[#12121A] border border-[#1E1E2A] hover:border-[#0088CC] hover:bg-[#0088CC]/5 transition-all group h-[88px]">
                <div className="h-10 w-10 rounded-full bg-[#1A1A24] group-hover:bg-[#0088CC]/10 flex items-center justify-center mb-2 transition-colors">
                  <Send className="h-5 w-5 text-[#0088CC]" />
                </div>
                <span className="text-[10px] font-medium text-[#F0F0F5]">Telegram</span>
              </button>
            </div>
          </div>

          {/* Your Bots Table/List */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-semibold tracking-wide uppercase text-[#7A7A8A]">Active Deployments</h2>
              <Button variant="ghost" size="sm" className="h-6 text-xs text-[#7C3AED] hover:text-[#7C3AED] hover:bg-[#7C3AED]/10 px-2 rounded-md font-medium">
                View All
              </Button>
            </div>
            
            <div className="bg-[#12121A] border border-[#1E1E2A] rounded-xl overflow-hidden shadow-sm">
              <div className="flex flex-col divide-y divide-[#1E1E2A]">
                
                {/* Bot 1 */}
                <div className="p-3.5 hover:bg-[#1A1A24]/50 transition-colors flex items-center gap-3">
                  <div className="h-10 w-10 shrink-0 rounded-lg bg-[#25D366]/10 border border-[#25D366]/20 flex items-center justify-center relative shadow-[inset_0_1px_1px_rgba(255,255,255,0.1)]">
                    <MessageCircle className="h-5 w-5 text-[#25D366]" />
                    <div className="absolute -bottom-0.5 -right-0.5 h-2.5 w-2.5 rounded-full bg-[#22C55E] ring-2 ring-[#12121A]"></div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-0.5">
                      <h3 className="text-sm font-medium text-[#F0F0F5] truncate pr-2">Atendimento Vendas</h3>
                      <span className="text-xs font-mono text-[#F0F0F5]">1.2K</span>
                    </div>
                    <div className="flex items-center text-xs text-[#7A7A8A]">
                      <span className="flex items-center">
                        Online
                      </span>
                      <span className="mx-1.5 opacity-50">•</span>
                      <span>WhatsApp</span>
                    </div>
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-8 w-8 text-[#7A7A8A] hover:text-[#F0F0F5]">
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-48 bg-[#1A1A24] border-[#1E1E2A] text-[#F0F0F5]">
                      <DropdownMenuItem className="focus:bg-[#12121A] focus:text-[#F0F0F5] cursor-pointer">
                        <Workflow className="mr-2 h-4 w-4" /> Flow Builder
                      </DropdownMenuItem>
                      <DropdownMenuItem className="focus:bg-[#12121A] focus:text-[#F0F0F5] cursor-pointer">
                        <BarChart3 className="mr-2 h-4 w-4" /> Analytics
                      </DropdownMenuItem>
                      <DropdownMenuSeparator className="bg-[#1E1E2A]" />
                      <DropdownMenuItem className="focus:bg-[#12121A] focus:text-[#F0F0F5] cursor-pointer">
                        <Settings className="mr-2 h-4 w-4" /> Settings
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>

                {/* Bot 2 */}
                <div className="p-3.5 hover:bg-[#1A1A24]/50 transition-colors flex items-center gap-3">
                  <div className="h-10 w-10 shrink-0 rounded-lg bg-[#5865F2]/10 border border-[#5865F2]/20 flex items-center justify-center relative shadow-[inset_0_1px_1px_rgba(255,255,255,0.1)]">
                    <Headphones className="h-5 w-5 text-[#5865F2]" />
                    <div className="absolute -bottom-0.5 -right-0.5 h-2.5 w-2.5 rounded-full bg-[#22C55E] ring-2 ring-[#12121A]"></div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-0.5">
                      <h3 className="text-sm font-medium text-[#F0F0F5] truncate pr-2">Suporte Discord</h3>
                      <span className="text-xs font-mono text-[#F0F0F5]">842</span>
                    </div>
                    <div className="flex items-center text-xs text-[#7A7A8A]">
                      <span className="flex items-center">
                        Online
                      </span>
                      <span className="mx-1.5 opacity-50">•</span>
                      <span>Discord</span>
                    </div>
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-8 w-8 text-[#7A7A8A] hover:text-[#F0F0F5]">
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-48 bg-[#1A1A24] border-[#1E1E2A] text-[#F0F0F5]">
                      <DropdownMenuItem className="focus:bg-[#12121A] focus:text-[#F0F0F5] cursor-pointer">
                        <Workflow className="mr-2 h-4 w-4" /> Flow Builder
                      </DropdownMenuItem>
                      <DropdownMenuItem className="focus:bg-[#12121A] focus:text-[#F0F0F5] cursor-pointer">
                        <BarChart3 className="mr-2 h-4 w-4" /> Analytics
                      </DropdownMenuItem>
                      <DropdownMenuSeparator className="bg-[#1E1E2A]" />
                      <DropdownMenuItem className="focus:bg-[#12121A] focus:text-[#F0F0F5] cursor-pointer">
                        <Settings className="mr-2 h-4 w-4" /> Settings
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>

                {/* Bot 3 */}
                <div className="p-3.5 hover:bg-[#1A1A24]/50 transition-colors flex items-center gap-3 opacity-60">
                  <div className="h-10 w-10 shrink-0 rounded-lg bg-[#0088CC]/10 border border-[#0088CC]/20 flex items-center justify-center relative shadow-[inset_0_1px_1px_rgba(255,255,255,0.1)] grayscale">
                    <Send className="h-5 w-5 text-[#0088CC]" />
                    <div className="absolute -bottom-0.5 -right-0.5 h-2.5 w-2.5 rounded-full bg-[#7A7A8A] ring-2 ring-[#12121A]"></div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-0.5">
                      <h3 className="text-sm font-medium text-[#F0F0F5] truncate pr-2">Bot Telegram</h3>
                      <span className="text-xs font-mono text-[#7A7A8A]">0</span>
                    </div>
                    <div className="flex items-center text-xs text-[#7A7A8A]">
                      <span className="flex items-center">
                        Offline
                      </span>
                      <span className="mx-1.5 opacity-50">•</span>
                      <span>Telegram</span>
                    </div>
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-8 w-8 text-[#7A7A8A] hover:text-[#F0F0F5]">
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-48 bg-[#1A1A24] border-[#1E1E2A] text-[#F0F0F5]">
                      <DropdownMenuItem className="focus:bg-[#12121A] focus:text-[#F0F0F5] cursor-pointer">
                        <Workflow className="mr-2 h-4 w-4" /> Flow Builder
                      </DropdownMenuItem>
                      <DropdownMenuItem className="focus:bg-[#12121A] focus:text-[#F0F0F5] cursor-pointer">
                        <Settings className="mr-2 h-4 w-4" /> Settings
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>

              </div>
            </div>
          </div>

          {/* Plan Usage */}
          <div className="bg-[#1A1A24] border border-[#1E1E2A] rounded-xl p-4">
            <div className="flex items-center justify-between mb-3">
              <div>
                <h3 className="text-sm font-semibold text-[#F0F0F5]">Plan Usage</h3>
                <p className="text-xs text-[#7A7A8A] mt-0.5">Pro Tier • Resets in 12 days</p>
              </div>
              <Button size="sm" variant="outline" className="h-7 text-xs border-[#7C3AED]/30 text-[#7C3AED] hover:bg-[#7C3AED]/10 hover:text-[#7C3AED] bg-transparent">
                Upgrade
              </Button>
            </div>
            
            <div className="space-y-4">
              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-[#F0F0F5] font-medium">Messages</span>
                  <span className="text-[#7A7A8A]"><span className="text-[#F0F0F5] font-medium">45K</span> / 100K</span>
                </div>
                <Progress value={45} className="h-1.5 bg-[#0A0A0F] [&>div]:bg-[#7C3AED]" />
              </div>
              
              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-[#F0F0F5] font-medium">Bots</span>
                  <span className="text-[#7A7A8A]"><span className="text-[#F0F0F5] font-medium">3</span> / 5</span>
                </div>
                <Progress value={60} className="h-1.5 bg-[#0A0A0F] [&>div]:bg-[#7C3AED]" />
              </div>
            </div>
          </div>

        </div>
      </main>

      {/* System Status Footer */}
      <div className="absolute bottom-0 inset-x-0 p-3 bg-gradient-to-t from-[#0A0A0F] via-[#0A0A0F]/90 to-transparent flex justify-center pb-safe">
        <div className="flex items-center gap-2 text-[10px] text-[#7A7A8A] font-medium bg-[#1A1A24]/80 backdrop-blur-md px-3 py-1.5 rounded-full border border-[#1E1E2A]">
          <span className="h-2 w-2 rounded-full bg-[#22C55E] animate-pulse"></span>
          All systems operational
        </div>
      </div>

    </div>
  );
}
