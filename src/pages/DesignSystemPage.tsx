import React, { useState } from "react";
import { format } from "date-fns";
import { uk } from "date-fns/locale";
import { 
  Palette, 
  Calendar as CalendarIcon,
  Clock,
  AlertCircle,
  Search,
  UploadCloud,
  Type,
  MousePointer2,
  Bell,
  Check,
  Mail,
  Shield,
  Users,
  User,
  Terminal,
  Layers,
  Layout,
  Loader2,
  Sparkles
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Checkbox } from "@/components/ui/checkbox";
import { Separator } from "@/components/ui/separator";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { cn } from "@/lib/utils";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

// Хелпер для дати
const formatDateUA = (date: Date | undefined) => {
  if (!date) return null;
  const formatted = format(date, "d MMM yyyy", { locale: uk });
  return formatted.split(" ").map((word, index) => 
    index === 1 ? word.charAt(0).toUpperCase() + word.slice(1) : word
  ).join(" ");
};

export function DesignSystemPage() {
  const [date, setDate] = useState<Date>();
  const [time, setTime] = useState<string>("10:00"); 

  return (
    <div className="space-y-8 pb-20">
      

      <Tabs defaultValue="styles" className="w-full">
        
        {/* ==================== УНІВЕРСАЛЬНІ ТАБИ (Line Style) ==================== */}
        <div className="mb-8 border-b border-border">
          <TabsList className="h-auto w-full justify-start gap-6 bg-transparent p-0">
            <TabsTrigger 
              value="styles" 
              className="relative h-12 rounded-none border-b-2 border-transparent px-4 pb-3 pt-3 font-medium text-muted-foreground transition-none hover:text-foreground data-[state=active]:border-primary data-[state=active]:text-primary data-[state=active]:shadow-none"
            >
              <Palette className="mr-2 h-4 w-4" />
              Стилі
            </TabsTrigger>
            <TabsTrigger 
              value="buttons" 
              className="relative h-12 rounded-none border-b-2 border-transparent px-4 pb-3 pt-3 font-medium text-muted-foreground transition-none hover:text-foreground data-[state=active]:border-primary data-[state=active]:text-primary data-[state=active]:shadow-none"
            >
              <MousePointer2 className="mr-2 h-4 w-4" />
              Кнопки
            </TabsTrigger>
            <TabsTrigger 
              value="forms" 
              className="relative h-12 rounded-none border-b-2 border-transparent px-4 pb-3 pt-3 font-medium text-muted-foreground transition-none hover:text-foreground data-[state=active]:border-primary data-[state=active]:text-primary data-[state=active]:shadow-none"
            >
              <Layout className="mr-2 h-4 w-4" />
              Форми
            </TabsTrigger>
            <TabsTrigger 
              value="feedback" 
              className="relative h-12 rounded-none border-b-2 border-transparent px-4 pb-3 pt-3 font-medium text-muted-foreground transition-none hover:text-foreground data-[state=active]:border-primary data-[state=active]:text-primary data-[state=active]:shadow-none"
            >
              <Bell className="mr-2 h-4 w-4" />
              Статус
            </TabsTrigger>
          </TabsList>
        </div>

        {/* ================== TAB 1: STYLES ================== */}
        <TabsContent value="styles" className="space-y-6 animate-in fade-in-50">
          
          {/* Colors Card */}
          <div className="bg-card p-6 rounded-xl border shadow-sm space-y-6">
            <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold flex items-center gap-2 text-foreground">
                  <Palette className="h-4 w-4 text-primary" /> Системні кольори
                </h2>
                <Badge variant="outline" className="font-mono text-[10px] border-primary/20 text-primary bg-primary/5">
                    Theme: Royal Blue
                </Badge>
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
              <ColorSwatch name="Primary" bg="bg-primary" text="text-primary-foreground" label="Royal Blue" />
              <ColorSwatch name="Foreground" bg="bg-foreground" text="text-background" label="Text Main" />
              <ColorSwatch name="Card" bg="bg-card" text="text-card-foreground border" label="Surface" />
              <ColorSwatch name="Muted" bg="bg-muted" text="text-muted-foreground" label="Secondary BG" />
              <ColorSwatch name="Border" bg="bg-border" text="text-foreground" label="Lines" />
              <ColorSwatch name="Background" bg="bg-background" text="text-foreground border" label="Canvas" />
            </div>
            
            <Separator />
            
            <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Семантичні статуси</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
              <ColorSwatch name="Destructive" bg="bg-destructive" text="text-destructive-foreground" label="Error" />
              <ColorSwatch name="Success" bg="bg-emerald-500" text="text-white" label="Success" />
              <ColorSwatch name="Warning" bg="bg-amber-500" text="text-white" label="Warning" />
              <ColorSwatch name="Info" bg="bg-blue-500" text="text-white" label="Info" />
            </div>
          </div>

          {/* Depth & Shadows Card */}
          <div className="bg-card p-6 rounded-xl border shadow-sm space-y-6">
             <h2 className="text-lg font-semibold flex items-center gap-2 text-foreground">
                <Layers className="h-4 w-4 text-primary" /> Ефекти та Глибина
             </h2>
             <div className="grid md:grid-cols-3 gap-8">
                <div className="h-24 rounded-xl bg-card border shadow-sm flex items-center justify-center text-xs text-muted-foreground font-medium transition-shadow hover:shadow-md cursor-default">
                   Shadow SM
                </div>
                <div className="h-24 rounded-xl bg-card border shadow-md flex items-center justify-center text-xs text-muted-foreground font-medium transition-shadow hover:shadow-lg cursor-default">
                   Shadow MD
                </div>
                <div className="h-24 rounded-xl bg-card border shadow-lg flex items-center justify-center text-xs text-muted-foreground font-medium cursor-default">
                   Shadow LG
                </div>
             </div>
          </div>

          {/* Typography Card */}
          <div className="bg-card p-8 rounded-xl border shadow-sm space-y-8">
             <h2 className="text-lg font-semibold flex items-center gap-2 text-foreground">
                <Type className="h-4 w-4 text-primary" /> Типографіка
             </h2>
             <div className="grid gap-6">
                <div className="flex flex-col gap-1">
                    <span className="text-xs text-muted-foreground font-mono mb-1">H1 / Extrabold</span>
                    <h1 className="text-4xl font-extrabold tracking-tight text-foreground">Heading 1</h1>
                </div>
                <div className="flex flex-col gap-1">
                    <span className="text-xs text-muted-foreground font-mono mb-1">H2 / Semibold</span>
                    <h2 className="text-3xl font-semibold tracking-tight text-foreground">Heading 2</h2>
                </div>
                <div className="flex flex-col gap-1 max-w-2xl">
                    <span className="text-xs text-muted-foreground font-mono mb-1">Body / Regular</span>
                    <p className="leading-7 text-muted-foreground">
                        Inter — це шрифт, спеціально створений для комп'ютерних екранів. Він має велику x-height, що забезпечує відмінну читабельність навіть у дрібному кеглі.
                    </p>
                </div>
             </div>
          </div>
        </TabsContent>

        {/* ================== TAB 2: BUTTONS ================== */}
        <TabsContent value="buttons" className="space-y-6 animate-in fade-in-50">
           <div className="bg-card p-6 rounded-xl border shadow-sm space-y-6">
                <h2 className="text-lg font-semibold flex items-center gap-2 text-foreground">
                    <MousePointer2 className="h-4 w-4 text-primary" /> Кнопки та Дії
                </h2>
                
                <div className="flex flex-wrap gap-4">
                    <Button>Primary Button</Button>
                    <Button variant="secondary">Secondary</Button>
                    <Button variant="outline">Outline</Button>
                    <Button variant="ghost">Ghost</Button>
                    <Button variant="destructive">Delete</Button>
                    <Button variant="link">Link Button</Button>
                </div>

                <Separator />

                <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Стани та Іконки</h3>
                <div className="flex flex-wrap items-center gap-4">
                    <Button disabled>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Saving...
                    </Button>
                    <Button variant="outline" className="gap-2">
                        <Mail className="h-4 w-4" /> Login
                    </Button>
                    <Button size="icon" variant="outline"><Bell className="h-4 w-4" /></Button>
                    <Button size="icon" className="rounded-full"><Check className="h-4 w-4" /></Button>
                </div>
           </div>
        </TabsContent>

        {/* ================== TAB 3: FORMS ================== */}
        <TabsContent value="forms" className="space-y-6 animate-in fade-in-50">
          
          {/* Inputs */}
          <div className="bg-card p-6 rounded-xl border shadow-sm space-y-6">
             <h2 className="text-lg font-semibold text-foreground flex items-center gap-2">
                <Layout className="h-4 w-4 text-primary" /> Елементи вводу (h-10)
             </h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              <div className="space-y-2">
                <Label>Label</Label>
                <Input placeholder="Placeholder text..." />
              </div>
              <div className="space-y-2">
                <Label>Focused</Label>
                <Input placeholder="Type here..." className="ring-2 ring-ring ring-offset-2" />
              </div>
              <div className="space-y-2">
                <Label>Disabled</Label>
                <Input disabled placeholder="Cannot edit" />
              </div>
              
              <div className="space-y-2">
                <Label className="text-destructive">Error State</Label>
                <Input placeholder="Invalid" className="border-destructive bg-destructive/10 text-destructive placeholder:text-destructive/50" defaultValue="error@mail" />
                <p className="text-[0.8rem] text-destructive font-medium flex items-center gap-1">
                  <AlertCircle className="h-3 w-3" /> Fix this error
                </p>
              </div>
              
              <div className="space-y-2">
                <Label>Search</Label>
                <div className="relative">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input className="pl-9" placeholder="Search..." />
                </div>
              </div>

               <div className="space-y-2">
                <Label>Upload</Label>
                 <div className="flex w-full items-center gap-2">
                     <Button variant="outline" size="icon" className="shrink-0 text-muted-foreground">
                        <UploadCloud className="h-4 w-4" />
                     </Button>
                     <Input type="file" className="cursor-pointer text-muted-foreground pt-[7px]" />
                  </div>
              </div>
            </div>
          </div>

          {/* Selectors & Date */}
          <div className="bg-card p-6 rounded-xl border shadow-sm space-y-6">
            <h2 className="text-lg font-semibold text-foreground">Селектори</h2>
            <div className="grid md:grid-cols-3 gap-6 items-end">
              
              {/* Select */}
              <div className="space-y-2">
                <Label>Роль</Label>
                <Select>
                  <SelectTrigger className="w-full h-10">
                    <SelectValue placeholder="Оберіть роль" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="admin">
                        <div className="flex items-center gap-2"><Shield className="h-4 w-4 text-muted-foreground" /> Admin</div>
                    </SelectItem>
                    <SelectItem value="coach">
                        <div className="flex items-center gap-2"><Users className="h-4 w-4 text-muted-foreground" /> Coach</div>
                    </SelectItem>
                    <SelectItem value="player">
                        <div className="flex items-center gap-2"><User className="h-4 w-4 text-muted-foreground" /> Player</div>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Date */}
              <div className="space-y-2 flex flex-col">
                <Label>Дата</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant={"outline"}
                      className={cn(
                        "w-full justify-start text-left font-normal h-10 px-3",
                        !date && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4 text-muted-foreground" />
                      {date ? <span className="text-foreground">{formatDateUA(date)}</span> : <span className="text-muted-foreground">Оберіть дату</span>}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={date}
                      onSelect={setDate}
                      locale={uk}
                      captionLayout="dropdown-buttons" 
                      fromYear={1980}
                      toYear={2030}
                      initialFocus
                      formatters={{
                        formatMonthCaption: (date, options) => {
                          const m = format(date, "MMM", { locale: uk });
                          return m.charAt(0).toUpperCase() + m.slice(1);
                        }
                      }}
                    />
                  </PopoverContent>
                </Popover>
              </div>

              {/* Time */}
              <div className="space-y-2 flex flex-col">
                <Label>Час</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-full justify-start text-left font-normal h-10 px-3",
                        !time && "text-muted-foreground"
                      )}
                    >
                      <Clock className="mr-2 h-4 w-4 text-muted-foreground" />
                      {time ? <span className="text-foreground">{time}</span> : <span className="text-muted-foreground">--:--</span>}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <div className="flex h-[200px] divide-x">
                      <div className="flex flex-col overflow-y-auto px-1 py-2 w-16 no-scrollbar">
                        {Array.from({ length: 24 }, (_, i) => i).map((hour) => {
                           const h = hour.toString().padStart(2, '0');
                           return (
                            <button key={h} onClick={() => setTime(`${h}:${time.split(':')[1]}`)} className="text-xs py-1 hover:bg-muted rounded-sm text-foreground">{h}</button>
                           )
                        })}
                      </div>
                      <div className="flex flex-col overflow-y-auto px-1 py-2 w-16 no-scrollbar">
                         {Array.from({ length: 12 }, (_, i) => i * 5).map((m) => {
                           const min = m.toString().padStart(2, '0');
                           return (
                            <button key={min} onClick={() => setTime(`${time.split(':')[0]}:${min}`)} className="text-xs py-1 hover:bg-muted rounded-sm text-foreground">{min}</button>
                           )
                        })}
                      </div>
                    </div>
                  </PopoverContent>
                </Popover>
              </div>
            </div>

            <Separator className="my-6" />

            <div className="flex flex-wrap gap-12">
               <div className="space-y-4">
                  <h4 className="text-xs font-medium mb-3 text-muted-foreground uppercase tracking-wider">Чекбокси</h4>
                  <div className="flex items-center space-x-2">
                    <Checkbox id="terms2" />
                    <Label htmlFor="terms2">Agree to terms</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox id="disabled" disabled checked />
                    <Label htmlFor="disabled" className="opacity-70">Mandatory (Disabled)</Label>
                  </div>
               </div>

               <div className="space-y-4">
                  <h4 className="text-xs font-medium mb-3 text-muted-foreground uppercase tracking-wider">Світчі</h4>
                  <div className="flex items-center space-x-2">
                    <Switch id="airplane-mode" />
                    <Label htmlFor="airplane-mode">Notifications</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Switch id="disabled-switch" disabled checked />
                    <Label htmlFor="disabled-switch" className="opacity-70">Safe Mode</Label>
                  </div>
               </div>
            </div>
          </div>
        </TabsContent>

        {/* ================== TAB 4: FEEDBACK ================== */}
        <TabsContent value="feedback" className="space-y-6 animate-in fade-in-50">
           
           {/* Soft Badges */}
           <div className="bg-card p-6 rounded-xl border shadow-sm space-y-6">
              <h2 className="text-lg font-semibold flex items-center gap-2 text-foreground">
                 <Bell className="h-4 w-4 text-primary" /> Статуси (Soft UI Badges)
              </h2>
              <div className="flex flex-wrap gap-4 items-center">
                 <Badge variant="outline" className="bg-muted text-muted-foreground border-border">Draft</Badge>
                 <Badge variant="outline" className="bg-emerald-500/10 text-emerald-600 border-emerald-500/20">Active</Badge>
                 <Badge variant="outline" className="bg-amber-500/10 text-amber-600 border-amber-500/20">Pending</Badge>
                 <Badge variant="outline" className="bg-destructive/10 text-destructive border-destructive/20">Banned</Badge>
                 
                 {/* PRIMARY BADGE (ROYAL BLUE) */}
                 <Badge variant="outline" className="bg-primary/5 text-primary border-primary/20">New Feature</Badge>
              </div>
           </div>

           {/* Skeletons (Loading) */}
           <div className="bg-card p-6 rounded-xl border shadow-sm space-y-6">
              <h2 className="text-lg font-semibold flex items-center gap-2 text-foreground">
                 <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" /> Завантаження (Skeletons)
              </h2>
              <div className="space-y-4">
                 <div className="flex items-center space-x-4">
                    <div className="h-12 w-12 rounded-full bg-muted animate-pulse" />
                    <div className="space-y-2">
                      <div className="h-4 w-[250px] bg-muted rounded animate-pulse" />
                      <div className="h-4 w-[200px] bg-muted rounded animate-pulse" />
                    </div>
                 </div>
                 
                 <div className="grid grid-cols-3 gap-4 mt-6">
                    <div className="h-32 bg-muted rounded-xl animate-pulse" />
                    <div className="h-32 bg-muted rounded-xl animate-pulse" />
                    <div className="h-32 bg-muted rounded-xl animate-pulse" />
                 </div>
              </div>
           </div>

           {/* Alerts */}
           <div className="bg-card p-6 rounded-xl border shadow-sm space-y-6">
              <h2 className="text-lg font-semibold text-foreground">Алерти</h2>
              <div className="grid gap-4 max-w-2xl">
                <Alert>
                  <Terminal className="h-4 w-4" />
                  <AlertTitle>Системне повідомлення</AlertTitle>
                  <AlertDescription>Система працює стабільно.</AlertDescription>
                </Alert>
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertTitle>Критична помилка</AlertTitle>
                  <AlertDescription>Втрачено з'єднання.</AlertDescription>
                </Alert>
              </div>
           </div>
        </TabsContent>

      </Tabs>
    </div>
  );
}

function ColorSwatch({ name, bg, text, label }: { name: string, bg: string, text: string, label: string }) {
  return (
    <div className="group cursor-pointer">
      <div className={`h-16 w-full rounded-lg shadow-sm border border-border ${bg} ${text} flex flex-col items-center justify-center transition-transform hover:scale-105`}>
         <span className="text-lg font-bold">Aa</span>
      </div>
      <div className="mt-2 text-center">
        <p className="text-sm font-semibold text-foreground">{name}</p>
        <p className="text-[10px] uppercase tracking-wider text-muted-foreground">{label}</p>
      </div>
    </div>
  )
}