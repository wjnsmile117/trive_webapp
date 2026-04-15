import React, { useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  DndContext,
  PointerSensor,
  closestCenter,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import {
  SortableContext,
  arrayMove,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  ArrowLeft,
  CalendarPlus,
  CalendarRange,
  Camera,
  ChartColumn,
  ChevronRight,
  Clock3,
  GripVertical,
  Link2,
  Lock,
  MapPin,
  Menu,
  Pencil,
  Plane,
  Plus,
  ReceiptText,
  Save,
  Settings2,
  Ticket,
  Trash2,
  Users,
  Wallet,
} from "lucide-react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

type TicketRound = {
  departAirport: string;
  arriveAirport: string;
  airline: string;
  flightNo: string;
  departTime: string;
  arriveTime: string;
};

type TicketInfo = {
  outbound: TicketRound;
  inbound: TicketRound;
};

type Member = {
  id: string;
  name: string;
  avatar: string;
};

type ItineraryItem = {
  id: string;
  title: string;
  dayDate: string;
  startTime: string;
  endTime: string;
  location: string;
  note: string;
  ticket: number;
};

type ExpenseItem = {
  id: string;
  date: string;
  merchant: string;
  item: string;
  category: string;
  foreignAmount: number;
  currency: string;
  twdAmount: number;
  paymentMethod: string;
  memberId: string;
  note: string;
};

type Trip = {
  id: string;
  title: string;
  startDate: string;
  endDate: string;
  dayPlans: string[];
  ticketInfo: TicketInfo;
  currency: string;
  fxRate: number;
  members: Member[];
  itinerary: ItineraryItem[];
  expenses: ExpenseItem[];
};

const categories = ["交通", "住宿", "餐飲", "購物", "門票", "咖啡", "伴手禮", "其他"];
const payments = ["現金", "信用卡", "行動支付", "交通卡"];
const emojiOptions = ["🐻", "🐰", "🐶", "🐱", "🦊", "🐼", "🐯", "🐸", "🦁", "🐨", "🐵", "🐹", "🌷", "⭐", "🍓", "☁️"];
const chartColors = ["#8d9b8a", "#b7b7a4", "#a5a58d", "#cb997e", "#ddbea9", "#b56576", "#6d6875", "#adc178"];

const palette = {
  shell: "bg-[#f4f1ed]",
  shellInner: "from-[#faf7f3] to-[#fffdfb]",
  border: "border-[#ddd5cc]",
  currentTrip: "from-[#b7b7a4] via-[#a5a58d] to-[#cb997e]",
  soft: "bg-[#ede6de]",
  soft2: "bg-[#f6f0ea]",
  ticketWrap: "bg-[#f5efe8]",
  ticketCard: "bg-[rgba(200,182,166,0.22)]",
  button: "bg-[#a5a58d] hover:bg-[#8d9b8a]",
  activeTab: "bg-[#e6ded3] text-[#6b5e55]",
  activeDay: "bg-[#a5a58d] text-white shadow-sm",
  highlight: "bg-[#efe8df] text-[#6b5e55]",
};

const defaultMembers: Member[] = [
  { id: "m1", name: "我", avatar: "🐻" },
  { id: "m2", name: "旅伴A", avatar: "🐰" },
  { id: "m3", name: "旅伴B", avatar: "🐶" },
];

const emptyRoundTicket: TicketRound = {
  departAirport: "TPE",
  arriveAirport: "HND",
  airline: "AIRLINE",
  flightNo: "AB123",
  departTime: "09:00",
  arriveTime: "12:30",
};

const initialTrips: Trip[] = [
  {
    id: "trip-1",
    title: "東京春季自由行",
    startDate: "2026-04-20",
    endDate: "2026-04-25",
    dayPlans: ["2026-04-20", "2026-04-21", "2026-04-22"],
    ticketInfo: {
      outbound: {
        departAirport: "TPE",
        arriveAirport: "NRT",
        airline: "STARLUX",
        flightNo: "JX802",
        departTime: "08:30",
        arriveTime: "12:45",
      },
      inbound: {
        departAirport: "NRT",
        arriveAirport: "TPE",
        airline: "STARLUX",
        flightNo: "JX803",
        departTime: "16:10",
        arriveTime: "19:05",
      },
    },
    currency: "JPY",
    fxRate: 0.22,
    members: defaultMembers,
    itinerary: [
      { id: "it-1", title: "淺草寺 + 仲見世通", dayDate: "2026-04-20", startTime: "10:00", endTime: "12:00", location: "東京都台東區淺草", note: "可安排和服拍照，午餐吃天丼", ticket: 0 },
      { id: "it-2", title: "晴空塔", dayDate: "2026-04-20", startTime: "15:00", endTime: "17:00", location: "東京晴空塔", note: "建議先預約時段", ticket: 2100 },
      { id: "it-3", title: "新宿逛街", dayDate: "2026-04-21", startTime: "14:00", endTime: "18:00", location: "新宿", note: "藥妝、百貨、晚餐", ticket: 0 },
      { id: "it-4", title: "上野公園散步", dayDate: "2026-04-21", startTime: "09:30", endTime: "11:30", location: "上野公園", note: "早上先去賞景，再去阿美橫町", ticket: 0 },
      { id: "it-5", title: "迪士尼海洋", dayDate: "2026-04-22", startTime: "08:00", endTime: "20:00", location: "東京迪士尼海洋", note: "先搶快速通關，晚上看表演", ticket: 8900 },
    ],
    expenses: [
      { id: "ex-1", date: "2026-04-20", merchant: "Skyliner", item: "車票", category: "交通", foreignAmount: 2470, currency: "JPY", twdAmount: 543, paymentMethod: "信用卡", memberId: "m1", note: "機場往上野" },
      { id: "ex-2", date: "2026-04-20", merchant: "淺草今半", item: "午餐", category: "餐飲", foreignAmount: 3200, currency: "JPY", twdAmount: 704, paymentMethod: "現金", memberId: "m2", note: "壽喜燒套餐" },
      { id: "ex-3", date: "2026-04-21", merchant: "Don Quijote", item: "藥妝", category: "購物", foreignAmount: 8900, currency: "JPY", twdAmount: 1958, paymentMethod: "信用卡", memberId: "m1", note: "防曬、零食、面膜" },
      { id: "ex-4", date: "2026-04-21", merchant: "東京晴空塔", item: "門票", category: "門票", foreignAmount: 2100, currency: "JPY", twdAmount: 462, paymentMethod: "行動支付", memberId: "m3", note: "展望台門票" },
    ],
  },
  {
    id: "trip-2",
    title: "首爾快閃 3 天",
    startDate: "2026-05-10",
    endDate: "2026-05-12",
    dayPlans: ["2026-05-10", "2026-05-11", "2026-05-12"],
    ticketInfo: {
      outbound: {
        departAirport: "TPE",
        arriveAirport: "ICN",
        airline: "KOREAN AIR",
        flightNo: "KE692",
        departTime: "09:10",
        arriveTime: "12:40",
      },
      inbound: {
        departAirport: "ICN",
        arriveAirport: "TPE",
        airline: "KOREAN AIR",
        flightNo: "KE691",
        departTime: "18:20",
        arriveTime: "19:55",
      },
    },
    currency: "KRW",
    fxRate: 0.024,
    members: defaultMembers,
    itinerary: [],
    expenses: [],
  },
];

function currency(value: number | string, code = "TWD") {
  return new Intl.NumberFormat("zh-TW", {
    style: "currency",
    currency: code,
    maximumFractionDigits: code === "JPY" || code === "KRW" ? 0 : 2,
  }).format(Number(value || 0));
}

function formatMonthDay(dateStr: string) {
  if (!dateStr) return "未設定";
  const date = new Date(dateStr);
  const week = ["日", "一", "二", "三", "四", "五", "六"];
  return `${date.getMonth() + 1}/${date.getDate()}（${week[date.getDay()]}）`;
}

function formatTimeRange(startTime: string, endTime: string) {
  if (!startTime && !endTime) return "未設定時間";
  if (!endTime) return startTime;
  if (!startTime) return endTime;
  return `${startTime} - ${endTime}`;
}

function MobileShell({ children }: { children: React.ReactNode }) {
  return (
    <div className={`mx-auto min-h-screen max-w-[420px] ${palette.shell} p-3`}>
      <div className={`overflow-hidden rounded-[32px] border ${palette.border} bg-white shadow-2xl`}>
        <div className="mx-auto mt-2 h-1.5 w-20 rounded-full bg-[#ddd5cc]" />
        <div className={`min-h-[860px] bg-gradient-to-b ${palette.shellInner}`}>{children}</div>
      </div>
    </div>
  );
}

function SectionTitle({ title, sub, action }: { title: string; sub?: string; action?: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between gap-2">
      <div>
        <h2 className="text-[15px] font-semibold text-slate-900">{title}</h2>
        {sub ? <p className="mt-0.5 text-[11px] text-slate-500">{sub}</p> : null}
      </div>
      {action}
    </div>
  );
}

function FlightInfoCard({ label, ticketInfo }: { label: string; ticketInfo?: TicketRound }) {
  if (!ticketInfo) return null;
  return (
    <div className={`rounded-[24px] border ${palette.border} ${palette.ticketCard} px-3 py-3 backdrop-blur-sm`}>
      <div className="flex items-center justify-between gap-2">
        <div>
          <p className="text-[11px] tracking-[0.18em] text-slate-500">{label}</p>
          <p className="mt-1 text-sm font-semibold text-slate-800">{ticketInfo.airline}</p>
          <p className="text-[11px] text-slate-500">{ticketInfo.flightNo}</p>
        </div>
        <div className="text-right text-[11px] text-slate-600">
          <p>{ticketInfo.departTime}</p>
          <p>{ticketInfo.arriveTime}</p>
        </div>
      </div>
      <div className="mt-2 flex items-center justify-between gap-2 rounded-2xl bg-white/55 px-3 py-2">
        <div>
          <p className="text-base font-bold text-slate-800">{ticketInfo.departAirport}</p>
          <p className="text-[10px] text-slate-500">起飛</p>
        </div>
        <Plane className="h-4 w-4 text-slate-400" />
        <div className="text-right">
          <p className="text-base font-bold text-slate-800">{ticketInfo.arriveAirport}</p>
          <p className="text-[10px] text-slate-500">抵達</p>
        </div>
      </div>
    </div>
  );
}

function TicketEditor({ ticketInfo, onChange }: { ticketInfo: TicketInfo; onChange: (value: TicketInfo) => void }) {
  const updateRound = (round: keyof TicketInfo, key: keyof TicketRound, value: string) => {
    onChange({
      ...ticketInfo,
      [round]: {
        ...ticketInfo[round],
        [key]: value,
      },
    });
  };

  const RoundBlock = ({ roundKey, title }: { roundKey: keyof TicketInfo; title: string }) => (
    <div className={`rounded-3xl ${palette.soft2} p-4`}>
      <p className="mb-3 text-sm font-semibold text-slate-800">{title}</p>
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-2"><Label>起飛機場</Label><Input value={ticketInfo[roundKey]?.departAirport || ""} onChange={(e) => updateRound(roundKey, "departAirport", e.target.value)} /></div>
        <div className="space-y-2"><Label>抵達機場</Label><Input value={ticketInfo[roundKey]?.arriveAirport || ""} onChange={(e) => updateRound(roundKey, "arriveAirport", e.target.value)} /></div>
        <div className="space-y-2"><Label>航空公司</Label><Input value={ticketInfo[roundKey]?.airline || ""} onChange={(e) => updateRound(roundKey, "airline", e.target.value)} /></div>
        <div className="space-y-2"><Label>航班</Label><Input value={ticketInfo[roundKey]?.flightNo || ""} onChange={(e) => updateRound(roundKey, "flightNo", e.target.value)} /></div>
        <div className="space-y-2"><Label>起飛時間</Label><Input type="time" value={ticketInfo[roundKey]?.departTime || ""} onChange={(e) => updateRound(roundKey, "departTime", e.target.value)} /></div>
        <div className="space-y-2"><Label>抵達時間</Label><Input type="time" value={ticketInfo[roundKey]?.arriveTime || ""} onChange={(e) => updateRound(roundKey, "arriveTime", e.target.value)} /></div>
      </div>
    </div>
  );

  return (
    <div className="space-y-3">
      <RoundBlock roundKey="outbound" title="去程" />
      <RoundBlock roundKey="inbound" title="回程" />
    </div>
  );
}

function SortableDayCard({ item, onOpen }: { item: ItineraryItem; onOpen: () => void }) {
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id: item.id });
  const style = { transform: CSS.Transform.toString(transform), transition };

  return (
    <div ref={setNodeRef} style={style}>
      <button onClick={onOpen} className="w-full rounded-[24px] border border-[#ddd5cc] bg-white px-3 py-3 text-left shadow-sm">
        <div className="flex items-start gap-2">
          <div className="mt-0.5 rounded-xl border border-[#ddd5cc] p-1.5 text-slate-400" {...attributes} {...listeners}>
            <GripVertical className="h-3.5 w-3.5" />
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex items-center justify-between gap-2">
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold text-slate-900">{item.title}</p>
                <p className="mt-0.5 flex items-center gap-1 text-[11px] text-slate-500">
                  <Clock3 className="h-3 w-3" />
                  {formatTimeRange(item.startTime, item.endTime)}
                </p>
              </div>
              <ChevronRight className="h-4 w-4 text-slate-400" />
            </div>
            <p className="mt-1 flex items-center gap-1 text-[11px] text-slate-500">
              <MapPin className="h-3 w-3" />
              {item.location || "未填地點"}
            </p>
            {item.note ? <p className="mt-1 line-clamp-1 text-[11px] text-slate-500">{item.note}</p> : null}
            <div className="mt-2 inline-flex items-center gap-1 rounded-full bg-[#efe8df] px-2 py-1 text-[10px] text-[#7b6254]">
              <Ticket className="h-3 w-3" />
              門票 {item.ticket || 0}
            </div>
          </div>
        </div>
      </button>
    </div>
  );
}

function ItineraryEditor({
  item,
  dayPlans,
  onChange,
  onSave,
  onDelete,
}: {
  item: ItineraryItem;
  dayPlans: string[];
  onChange: (key: keyof ItineraryItem, value: string | number) => void;
  onSave: () => void;
  onDelete: () => void;
}) {
  return (
    <div className="space-y-3">
      <div className={`rounded-3xl ${palette.soft2} p-4`}>
        <SectionTitle title="行程預覽" sub="先看摘要，再調整內容" />
        <div className="mt-3 space-y-2 rounded-3xl bg-white p-3 shadow-sm">
          <div className="flex flex-wrap gap-2">
            <Badge variant="outline">{formatMonthDay(item.dayDate)}</Badge>
            <Badge variant="outline">{formatTimeRange(item.startTime, item.endTime)}</Badge>
          </div>
          <p className="text-base font-semibold text-slate-900">{item.title || "未命名行程"}</p>
          <p className="flex items-center gap-1 text-sm text-slate-500"><MapPin className="h-4 w-4" />{item.location || "未填地點"}</p>
          {item.note ? <p className="text-sm leading-6 text-slate-600">{item.note}</p> : null}
          <div className="inline-flex items-center gap-1 rounded-full bg-[#efe8df] px-2 py-1 text-[11px] text-[#7b6254]">門票 {item.ticket || 0}</div>
        </div>
      </div>

      <div className="rounded-3xl border border-[#ddd5cc] bg-white p-4 shadow-sm">
        <SectionTitle title="編輯內容" />
        <div className="mt-4 space-y-4">
          <div className="space-y-2"><Label>行程名稱</Label><Input value={item.title} onChange={(e) => onChange("title", e.target.value)} /></div>
          <div className="space-y-2">
            <Label>所在天數</Label>
            <Select value={item.dayDate} onValueChange={(value) => onChange("dayDate", value)}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {dayPlans.map((day) => <SelectItem key={day} value={day}>{formatMonthDay(day)}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2"><Label>開始時間</Label><Input type="time" value={item.startTime} onChange={(e) => onChange("startTime", e.target.value)} /></div>
            <div className="space-y-2"><Label>結束時間</Label><Input type="time" value={item.endTime} onChange={(e) => onChange("endTime", e.target.value)} /></div>
          </div>
          <div className="space-y-2"><Label>地點</Label><Input value={item.location} onChange={(e) => onChange("location", e.target.value)} /></div>
          <div className="space-y-2"><Label>門票</Label><Input type="number" value={item.ticket} onChange={(e) => onChange("ticket", Number(e.target.value) || 0)} /></div>
          <div className="space-y-2"><Label>備註</Label><Textarea className="min-h-[96px]" value={item.note} onChange={(e) => onChange("note", e.target.value)} /></div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 pb-3">
        <Button variant="outline" className="rounded-2xl" onClick={onDelete}><Trash2 className="mr-2 h-4 w-4" />刪除</Button>
        <Button className={`rounded-2xl ${palette.button}`} onClick={onSave}><Save className="mr-2 h-4 w-4" />完成編輯</Button>
      </div>
    </div>
  );
}

function BottomNav({ activeTab, setActiveTab }: { activeTab: string; setActiveTab: (key: string) => void }) {
  const items = [
    { key: "itinerary", label: "行程", icon: CalendarRange },
    { key: "expenses", label: "支出", icon: Wallet },
    { key: "members", label: "旅伴", icon: Users },
    { key: "analytics", label: "分析", icon: ChartColumn },
  ];

  return (
    <div className="fixed bottom-0 left-1/2 z-30 w-full max-w-[420px] -translate-x-1/2 bg-transparent px-4 pb-4 pt-2">
      <div className={`grid grid-cols-4 rounded-[26px] border ${palette.border} bg-white/95 p-1.5 shadow-2xl backdrop-blur`}>
        {items.map((item) => {
          const Icon = item.icon;
          const active = activeTab === item.key;
          return (
            <button key={item.key} onClick={() => setActiveTab(item.key)} className={`flex flex-col items-center justify-center gap-1 rounded-2xl px-2 py-2 text-[11px] transition ${active ? palette.activeTab : "text-slate-500"}`}>
              <Icon className="h-4 w-4" />
              <span>{item.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

export default function TravelExpenseMobileApp() {
  const [trips, setTrips] = useState<Trip[]>(initialTrips);
  const [selectedTripId, setSelectedTripId] = useState(initialTrips[0].id);
  const [screen, setScreen] = useState<"home" | "itinerary-edit">("home");
  const [activeTab, setActiveTab] = useState("itinerary");
  const [tripDialogOpen, setTripDialogOpen] = useState(false);
  const [tripMenuOpen, setTripMenuOpen] = useState(false);
  const [expenseDrawerOpen, setExpenseDrawerOpen] = useState(false);
  const [receiptDrawerOpen, setReceiptDrawerOpen] = useState(false);
  const [itineraryDrawerOpen, setItineraryDrawerOpen] = useState(false);
  const [ticketDrawerOpen, setTicketDrawerOpen] = useState(false);
  const [dayDrawerOpen, setDayDrawerOpen] = useState(false);
  const [memberDrawerOpen, setMemberDrawerOpen] = useState(false);
  const [editingMemberId, setEditingMemberId] = useState<string | null>(null);
  const [editingItineraryId, setEditingItineraryId] = useState<string | null>(null);
  const [receiptImage, setReceiptImage] = useState<string | null>(null);
  const [selectedDay, setSelectedDay] = useState("");
  const [newDayDate, setNewDayDate] = useState("");

  const [newTrip, setNewTrip] = useState({ title: "", startDate: "", endDate: "", currency: "JPY", fxRate: 0.22 });
  const [newExpense, setNewExpense] = useState({ date: "", merchant: "", item: "", category: "餐飲", foreignAmount: "", paymentMethod: "現金", memberId: "m1", note: "" });
  const [newItinerary, setNewItinerary] = useState<Omit<ItineraryItem, "id">>({ title: "", dayDate: "", startTime: "", endTime: "", location: "", note: "", ticket: 0 });
  const [memberDraft, setMemberDraft] = useState({ name: "", avatar: emojiOptions[0] });
  const [receiptDraft, setReceiptDraft] = useState({ merchant: "Shibuya Food Hall", item: "晚餐套餐", foreignAmount: 3280, currency: "JPY", twdAmount: 722, category: "餐飲", paymentMethod: "信用卡", memberId: "m1", date: "2026-04-22", note: "AI 辨識後可手動修正翻譯與金額" });
  const [collabSettings, setCollabSettings] = useState({ allowInvite: true, inviteCode: "TRIP-2026-88", inviteLink: "travel-app.demo/invite/TRIP-2026-88" });

  const selectedTrip = trips.find((trip) => trip.id === selectedTripId) || trips[0];
  const editingItinerary = selectedTrip.itinerary.find((item) => item.id === editingItineraryId) || null;
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        delay: 180,
        tolerance: 5,
      },
    }),
  );

  const totalTwd = useMemo(() => selectedTrip.expenses.reduce((sum, cur) => sum + Number(cur.twdAmount || 0), 0), [selectedTrip]);
  const totalForeign = useMemo(() => selectedTrip.expenses.reduce((sum, cur) => sum + Number(cur.foreignAmount || 0), 0), [selectedTrip]);
  const tripDays = useMemo(() => Math.max(selectedTrip.dayPlans.length, 1), [selectedTrip.dayPlans.length]);

  const groupedDays = useMemo(() => selectedTrip.dayPlans.map((date) => ({
    date,
    items: selectedTrip.itinerary.filter((item) => item.dayDate === date),
  })), [selectedTrip]);

  useEffect(() => {
    const firstDate = groupedDays[0]?.date || "";
    if (!groupedDays.some((day) => day.date === selectedDay)) setSelectedDay(firstDate);
  }, [groupedDays, selectedDay]);

  useEffect(() => {
    if (!newItinerary.dayDate && selectedTrip.dayPlans[0]) {
      setNewItinerary((prev) => ({ ...prev, dayDate: selectedTrip.dayPlans[0] }));
    }
  }, [selectedTrip.dayPlans, newItinerary.dayDate]);

  const currentDayItems = groupedDays.find((day) => day.date === selectedDay)?.items || [];

  const dailyTrend = useMemo(() => {
    const grouped = selectedTrip.expenses.reduce<Record<string, number>>((acc, cur) => {
      acc[cur.date] = (acc[cur.date] || 0) + Number(cur.twdAmount || 0);
      return acc;
    }, {});
    return Object.entries(grouped).map(([date, amount]) => ({ date, amount }));
  }, [selectedTrip]);

  const categoryStats = useMemo(() => {
    const grouped = selectedTrip.expenses.reduce<Record<string, number>>((acc, cur) => {
      acc[cur.category] = (acc[cur.category] || 0) + Number(cur.twdAmount || 0);
      return acc;
    }, {});
    return Object.entries(grouped).map(([name, value]) => ({ name, value }));
  }, [selectedTrip]);

  const paymentStats = useMemo(() => {
    const grouped = selectedTrip.expenses.reduce<Record<string, number>>((acc, cur) => {
      acc[cur.paymentMethod] = (acc[cur.paymentMethod] || 0) + Number(cur.twdAmount || 0);
      return acc;
    }, {});
    return Object.entries(grouped).map(([name, amount]) => ({ name, amount }));
  }, [selectedTrip]);

  const topExpenses = useMemo(() => [...selectedTrip.expenses].sort((a, b) => Number(b.twdAmount) - Number(a.twdAmount)).slice(0, 10), [selectedTrip]);

  const memberSummary = useMemo(
    () => selectedTrip.members.map((member) => ({
      ...member,
      total: selectedTrip.expenses.filter((x) => x.memberId === member.id).reduce((sum, cur) => sum + Number(cur.twdAmount || 0), 0),
    })),
    [selectedTrip],
  );

  const addTrip = () => {
    if (!newTrip.title) return;
    const id = `trip-${Date.now()}`;
    const startDay = newTrip.startDate || new Date().toISOString().slice(0, 10);
    const trip: Trip = {
      id,
      title: newTrip.title,
      startDate: newTrip.startDate,
      endDate: newTrip.endDate,
      dayPlans: [startDay],
      ticketInfo: {
        outbound: { ...emptyRoundTicket },
        inbound: { ...emptyRoundTicket, departAirport: "HND", arriveAirport: "TPE" },
      },
      currency: newTrip.currency,
      fxRate: Number(newTrip.fxRate || 1),
      members: defaultMembers.map((member) => ({ ...member })),
      itinerary: [],
      expenses: [],
    };
    setTrips((prev) => [trip, ...prev]);
    setSelectedTripId(id);
    setSelectedDay(startDay);
    setTripDialogOpen(false);
    setTripMenuOpen(false);
    setNewTrip({ title: "", startDate: "", endDate: "", currency: "JPY", fxRate: 0.22 });
  };

  const addDayPlan = () => {
    if (!newDayDate) return;
    setTrips((prev) => prev.map((trip) => {
      if (trip.id !== selectedTripId || trip.dayPlans.includes(newDayDate)) return trip;
      const dayPlans = [...trip.dayPlans, newDayDate].sort();
      return { ...trip, dayPlans };
    }));
    setSelectedDay(newDayDate);
    setDayDrawerOpen(false);
    setNewDayDate("");
  };

  const updateTicketInfo = (ticketInfo: TicketInfo) => {
    setTrips((prev) => prev.map((trip) => (trip.id === selectedTripId ? { ...trip, ticketInfo } : trip)));
  };

  const addExpense = () => {
    const foreignAmount = Number(newExpense.foreignAmount || 0);
    const twdAmount = Math.round(foreignAmount * Number(selectedTrip.fxRate || 1));
    const expense: ExpenseItem = {
      id: `ex-${Date.now()}`,
      date: newExpense.date,
      merchant: newExpense.merchant,
      item: newExpense.item,
      category: newExpense.category,
      foreignAmount,
      currency: selectedTrip.currency,
      twdAmount,
      paymentMethod: newExpense.paymentMethod,
      memberId: newExpense.memberId,
      note: newExpense.note,
    };
    setTrips((prev) => prev.map((trip) => (trip.id === selectedTripId ? { ...trip, expenses: [expense, ...trip.expenses] } : trip)));
    setExpenseDrawerOpen(false);
    setNewExpense({ date: "", merchant: "", item: "", category: "餐飲", foreignAmount: "", paymentMethod: "現金", memberId: selectedTrip.members[0]?.id || "m1", note: "" });
  };

  const addItinerary = () => {
    if (!newItinerary.title || !newItinerary.dayDate) return;
    const item: ItineraryItem = { id: `it-${Date.now()}`, ...newItinerary, ticket: Number(newItinerary.ticket || 0) };
    setTrips((prev) => prev.map((trip) => (trip.id === selectedTripId ? { ...trip, itinerary: [...trip.itinerary, item] } : trip)));
    setNewItinerary({ title: "", dayDate: selectedTrip.dayPlans[0] || "", startTime: "", endTime: "", location: "", note: "", ticket: 0 });
    setItineraryDrawerOpen(false);
    setSelectedDay(item.dayDate);
  };

  const saveMember = () => {
    if (!memberDraft.name) return;
    if (editingMemberId) {
      setTrips((prev) => prev.map((trip) => trip.id === selectedTripId ? { ...trip, members: trip.members.map((member) => (member.id === editingMemberId ? { ...member, ...memberDraft } : member)) } : trip));
    } else {
      const member: Member = { id: `m-${Date.now()}`, ...memberDraft };
      setTrips((prev) => prev.map((trip) => (trip.id === selectedTripId ? { ...trip, members: [...trip.members, member] } : trip)));
    }
    setMemberDrawerOpen(false);
    setEditingMemberId(null);
    setMemberDraft({ name: "", avatar: emojiOptions[0] });
  };

  const openCreateMember = () => {
    setEditingMemberId(null);
    setMemberDraft({ name: "", avatar: emojiOptions[0] });
    setMemberDrawerOpen(true);
  };

  const openEditMember = (member: Member) => {
    setEditingMemberId(member.id);
    setMemberDraft({ name: member.name, avatar: member.avatar });
    setMemberDrawerOpen(true);
  };

  const deleteMember = (memberId: string) => {
    const fallbackMemberId = selectedTrip.members.find((m) => m.id !== memberId)?.id || "";
    setTrips((prev) => prev.map((trip) => trip.id === selectedTripId ? {
      ...trip,
      members: trip.members.filter((member) => member.id !== memberId),
      expenses: trip.expenses.map((expense) => (expense.memberId === memberId ? { ...expense, memberId: fallbackMemberId } : expense)),
    } : trip));
    setMemberDrawerOpen(false);
    setEditingMemberId(null);
  };

  const updateEditingItinerary = (key: keyof ItineraryItem, value: string | number) => {
    setTrips((prev) => prev.map((trip) => trip.id === selectedTripId ? {
      ...trip,
      itinerary: trip.itinerary.map((item) => (item.id === editingItineraryId ? { ...item, [key]: value } : item)),
    } : trip));
  };

  const deleteItinerary = () => {
    setTrips((prev) => prev.map((trip) => trip.id === selectedTripId ? { ...trip, itinerary: trip.itinerary.filter((item) => item.id !== editingItineraryId) } : trip));
    setScreen("home");
    setEditingItineraryId(null);
  };

  const importReceipt = () => {
    const expense: ExpenseItem = { id: `ex-${Date.now()}`, ...receiptDraft };
    setTrips((prev) => prev.map((trip) => (trip.id === selectedTripId ? { ...trip, expenses: [expense, ...trip.expenses] } : trip)));
    setReceiptDrawerOpen(false);
  };

  const openItineraryEditor = (id: string) => {
    setEditingItineraryId(id);
    setScreen("itinerary-edit");
  };

  const handleDayDragEnd = (event: { active: { id: string | number }; over: { id: string | number } | null }) => {
    const { active, over } = event;
    if (!over || active.id === over.id || !selectedDay) return;
    const oldIndex = currentDayItems.findIndex((item) => item.id === active.id);
    const newIndex = currentDayItems.findIndex((item) => item.id === over.id);
    if (oldIndex < 0 || newIndex < 0) return;
    const reordered = arrayMove(currentDayItems, oldIndex, newIndex);
    const reorderedIds = reordered.map((item) => item.id);

    setTrips((prev) => prev.map((trip) => {
      if (trip.id !== selectedTripId) return trip;
      const otherDays = trip.itinerary.filter((item) => item.dayDate !== selectedDay);
      const thisDayItems = trip.itinerary.filter((item) => item.dayDate === selectedDay);
      const mapped = reorderedIds.map((id) => thisDayItems.find((item) => item.id === id)).filter(Boolean) as ItineraryItem[];
      return { ...trip, itinerary: [...otherDays, ...mapped] };
    }));
  };

  return (
    <MobileShell>
      <AnimatePresence mode="wait">
        {screen === "home" ? (
          <motion.div key="home" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="p-3.5 pb-28">
            <div className="flex items-center justify-between">
              <Drawer open={tripMenuOpen} onOpenChange={setTripMenuOpen}>
                <DrawerTrigger asChild>
                  <Button variant="ghost" size="icon" className={`h-10 w-10 rounded-2xl border ${palette.border} bg-white`}><Menu className="h-5 w-5" /></Button>
                </DrawerTrigger>
                <DrawerContent className="mx-auto max-w-[420px] rounded-t-[28px]">
                  <DrawerHeader><DrawerTitle>旅遊項目</DrawerTitle></DrawerHeader>
                  <div className="space-y-4 px-4 pb-6">
                    <div className="space-y-2.5">
                      {trips.map((trip) => (
                        <button key={trip.id} onClick={() => { setSelectedTripId(trip.id); setTripMenuOpen(false); }} className={`w-full rounded-3xl border p-3.5 text-left transition ${selectedTripId === trip.id ? "border-[#c8b6a6] bg-[#f6f0ea]" : "border-[#ddd5cc] bg-white"}`}>
                          <div className="flex items-center justify-between gap-3">
                            <div>
                              <p className="font-semibold text-slate-900">{trip.title}</p>
                              <p className="mt-0.5 text-[11px] text-slate-500">{trip.startDate} ～ {trip.endDate}</p>
                            </div>
                            <Badge variant="outline">{trip.currency}</Badge>
                          </div>
                        </button>
                      ))}
                    </div>
                    <Dialog open={tripDialogOpen} onOpenChange={setTripDialogOpen}>
                      <DialogTrigger asChild><Button className={`w-full rounded-2xl ${palette.button}`}><Plus className="mr-2 h-4 w-4" />新增旅遊項目</Button></DialogTrigger>
                      <DialogContent className="max-w-md rounded-3xl">
                        <DialogHeader><DialogTitle>新增旅遊項目</DialogTitle></DialogHeader>
                        <div className="space-y-4 py-2">
                          <div className="space-y-2"><Label>旅程名稱</Label><Input value={newTrip.title} onChange={(e) => setNewTrip({ ...newTrip, title: e.target.value })} /></div>
                          <div className="grid grid-cols-2 gap-3">
                            <div className="space-y-2"><Label>開始日期</Label><Input type="date" value={newTrip.startDate} onChange={(e) => setNewTrip({ ...newTrip, startDate: e.target.value })} /></div>
                            <div className="space-y-2"><Label>結束日期</Label><Input type="date" value={newTrip.endDate} onChange={(e) => setNewTrip({ ...newTrip, endDate: e.target.value })} /></div>
                          </div>
                          <div className="grid grid-cols-2 gap-3">
                            <div className="space-y-2"><Label>幣別</Label><Select value={newTrip.currency} onValueChange={(value) => setNewTrip({ ...newTrip, currency: value })}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="JPY">JPY</SelectItem><SelectItem value="KRW">KRW</SelectItem><SelectItem value="USD">USD</SelectItem><SelectItem value="EUR">EUR</SelectItem></SelectContent></Select></div>
                            <div className="space-y-2"><Label>匯率</Label><Input type="number" value={newTrip.fxRate} onChange={(e) => setNewTrip({ ...newTrip, fxRate: Number(e.target.value) || 0 })} /></div>
                          </div>
                          <Button className={`w-full rounded-2xl ${palette.button}`} onClick={addTrip}>建立旅程</Button>
                        </div>
                      </DialogContent>
                    </Dialog>
                  </div>
                </DrawerContent>
              </Drawer>

              <div className="text-center">
                <p className="text-[11px] text-slate-500">手機版正式雛形</p>
                <h1 className="mt-0.5 text-lg font-bold text-slate-900">旅遊記帳 App</h1>
              </div>
              <div className={`flex h-10 w-10 items-center justify-center rounded-2xl ${palette.soft} text-[#6b5e55]`}><Plane className="h-4.5 w-4.5" /></div>
            </div>

            <div className={`mt-3 rounded-[28px] bg-gradient-to-br ${palette.currentTrip} px-4 py-3.5 text-white shadow-lg`}>
              <p className="text-[11px] text-white/70">目前旅遊</p>
              <div className="mt-1.5 flex items-start justify-between gap-3">
                <div>
                  <h2 className="text-lg font-bold">{selectedTrip.title}</h2>
                  <p className="mt-0.5 text-[11px] text-white/80">{selectedTrip.startDate} ～ {selectedTrip.endDate} ・ {tripDays} 天</p>
                </div>
                <Badge className="rounded-full border-0 bg-white/20 text-white hover:bg-white/20">{selectedTrip.currency}</Badge>
              </div>
              <div className="mt-3 grid grid-cols-2 gap-2.5">
                <div className="rounded-2xl bg-white/15 p-2.5 backdrop-blur-sm"><p className="text-[10px] text-white/70">總消費</p><p className="mt-0.5 text-base font-bold">{currency(totalTwd, "TWD")}</p></div>
                <div className="rounded-2xl bg-white/15 p-2.5 backdrop-blur-sm"><p className="text-[10px] text-white/70">外幣總額</p><p className="mt-0.5 text-base font-bold">{currency(totalForeign, selectedTrip.currency)}</p></div>
              </div>
            </div>

            {activeTab === "itinerary" ? (
              <>
                <div className={`mt-3 rounded-[28px] ${palette.ticketWrap} p-3`}>
                  <SectionTitle
                    title="航班資訊"
                    sub="來回資訊可編輯"
                    action={<Drawer open={ticketDrawerOpen} onOpenChange={setTicketDrawerOpen}><DrawerTrigger asChild><Button size="sm" className={`h-8 rounded-2xl px-3 ${palette.button}`}><Pencil className="mr-1 h-3.5 w-3.5" />編輯</Button></DrawerTrigger><DrawerContent className="mx-auto max-w-[420px] rounded-t-[28px]"><DrawerHeader><DrawerTitle>編輯航班資訊</DrawerTitle></DrawerHeader><div className="px-4 pb-6"><TicketEditor ticketInfo={selectedTrip.ticketInfo} onChange={updateTicketInfo} /></div></DrawerContent></Drawer>}
                  />
                  <div className="mt-2.5 space-y-2.5">
                    <FlightInfoCard label="去程" ticketInfo={selectedTrip.ticketInfo?.outbound} />
                    <FlightInfoCard label="回程" ticketInfo={selectedTrip.ticketInfo?.inbound} />
                  </div>
                </div>

                <div className="mt-4 space-y-3.5">
                  <SectionTitle
                    title="行程總覽"
                    sub="先新增日期，再把卡片掛進對應天數"
                    action={<div className="flex gap-2"><Drawer open={dayDrawerOpen} onOpenChange={setDayDrawerOpen}><DrawerTrigger asChild><Button size="sm" variant="outline" className="h-8 rounded-2xl px-3"><CalendarPlus className="mr-1 h-3.5 w-3.5" />新增天數</Button></DrawerTrigger><DrawerContent className="mx-auto max-w-[420px] rounded-t-[28px]"><DrawerHeader><DrawerTitle>新增日期</DrawerTitle></DrawerHeader><div className="space-y-4 px-4 pb-6"><div className="space-y-2"><Label>日期</Label><Input type="date" value={newDayDate} onChange={(e) => setNewDayDate(e.target.value)} /></div>{newDayDate ? <div className={`rounded-2xl ${palette.soft2} px-3 py-3 text-sm text-slate-700`}>將新增：{formatMonthDay(newDayDate)}</div> : null}<Button className={`w-full rounded-2xl ${palette.button}`} onClick={addDayPlan}>加入這一天</Button></div></DrawerContent></Drawer><Drawer open={itineraryDrawerOpen} onOpenChange={setItineraryDrawerOpen}><DrawerTrigger asChild><Button size="sm" className={`h-8 rounded-2xl px-3 ${palette.button}`}><Plus className="mr-1 h-3.5 w-3.5" />新增行程</Button></DrawerTrigger><DrawerContent className="mx-auto max-w-[420px] rounded-t-[28px]"><DrawerHeader><DrawerTitle>新增行程卡片</DrawerTitle></DrawerHeader><div className="space-y-4 px-4 pb-6"><div className="space-y-2"><Label>所在天數</Label><Select value={newItinerary.dayDate} onValueChange={(value) => setNewItinerary({ ...newItinerary, dayDate: value })}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent>{selectedTrip.dayPlans.map((day) => <SelectItem key={day} value={day}>{formatMonthDay(day)}</SelectItem>)}</SelectContent></Select></div><div className="space-y-2"><Label>行程名稱</Label><Input placeholder="例如：淺草寺" value={newItinerary.title} onChange={(e) => setNewItinerary({ ...newItinerary, title: e.target.value })} /></div><div className="grid grid-cols-2 gap-3"><div className="space-y-2"><Label>開始時間</Label><Input type="time" value={newItinerary.startTime} onChange={(e) => setNewItinerary({ ...newItinerary, startTime: e.target.value })} /></div><div className="space-y-2"><Label>結束時間</Label><Input type="time" value={newItinerary.endTime} onChange={(e) => setNewItinerary({ ...newItinerary, endTime: e.target.value })} /></div></div><div className="space-y-2"><Label>地點</Label><Input placeholder="地點" value={newItinerary.location} onChange={(e) => setNewItinerary({ ...newItinerary, location: e.target.value })} /></div><div className="space-y-2"><Label>門票</Label><Input type="number" placeholder="門票" value={newItinerary.ticket} onChange={(e) => setNewItinerary({ ...newItinerary, ticket: Number(e.target.value) || 0 })} /></div><div className="space-y-2"><Label>備註</Label><Textarea placeholder="備註" value={newItinerary.note} onChange={(e) => setNewItinerary({ ...newItinerary, note: e.target.value })} /></div><Button className={`w-full rounded-2xl ${palette.button}`} onClick={addItinerary}>新增行程卡片</Button></div></DrawerContent></Drawer></div>}
                  />

                  <div className="-mx-1 overflow-x-auto px-1 pb-1">
                    <div className="flex gap-2.5">
                      {groupedDays.map((day, index) => (
                        <button key={day.date} onClick={() => setSelectedDay(day.date)} className={`min-w-[112px] rounded-[22px] px-3 py-2.5 text-left transition ${selectedDay === day.date ? palette.activeDay : `border ${palette.border} bg-white text-slate-700`}`}>
                          <p className={`text-[10px] ${selectedDay === day.date ? "text-white/75" : "text-slate-500"}`}>DAY {index + 1}</p>
                          <p className="mt-1 text-sm font-semibold">{formatMonthDay(day.date)}</p>
                          <p className={`mt-0.5 text-[10px] ${selectedDay === day.date ? "text-white/75" : "text-slate-500"}`}>{day.items.length} 個行程</p>
                        </button>
                      ))}
                    </div>
                  </div>

                  <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDayDragEnd}>
                    <SortableContext items={currentDayItems.map((item) => item.id)} strategy={verticalListSortingStrategy}>
                      <div className="space-y-2.5">
                        {currentDayItems.map((item) => <SortableDayCard key={item.id} item={item} onOpen={() => openItineraryEditor(item.id)} />)}
                      </div>
                    </SortableContext>
                  </DndContext>
                </div>
              </>
            ) : null}

            {activeTab === "expenses" ? (
              <div className="mt-4 space-y-3.5">
                <SectionTitle
                  title="支出明細"
                  sub="支援手動新增與收據匯入"
                  action={<div className="flex gap-2"><Drawer open={receiptDrawerOpen} onOpenChange={setReceiptDrawerOpen}><DrawerTrigger asChild><Button size="icon" variant="outline" className="h-8 w-8 rounded-2xl"><Camera className="h-4 w-4" /></Button></DrawerTrigger><DrawerContent className="mx-auto max-w-[420px] rounded-t-[28px]"><DrawerHeader><DrawerTitle>拍照翻譯收據</DrawerTitle></DrawerHeader><div className="space-y-4 px-4 pb-6"><Input type="file" accept="image/*" capture="environment" onChange={(e) => { const file = e.target.files?.[0]; if (file) setReceiptImage(URL.createObjectURL(file)); }} /><div className="flex min-h-[180px] items-center justify-center rounded-3xl border border-dashed bg-slate-50 p-4 text-sm text-slate-500">{receiptImage ? <img src={receiptImage} alt="receipt" className="max-h-[160px] rounded-2xl object-contain" /> : <div className="text-center"><Camera className="mx-auto mb-2 h-7 w-7" />收據預覽</div>}</div><div className={`rounded-3xl ${palette.soft2} p-4`}><p className="mb-3 flex items-center gap-2 text-sm font-medium text-slate-900"><ReceiptText className="h-4 w-4" />辨識結果</p><div className="space-y-3"><Input value={receiptDraft.merchant} onChange={(e) => setReceiptDraft({ ...receiptDraft, merchant: e.target.value })} placeholder="店名" /><Input value={receiptDraft.item} onChange={(e) => setReceiptDraft({ ...receiptDraft, item: e.target.value })} placeholder="品項" /><div className="grid grid-cols-2 gap-3"><Input type="number" value={receiptDraft.foreignAmount} onChange={(e) => setReceiptDraft({ ...receiptDraft, foreignAmount: Number(e.target.value) || 0, twdAmount: Math.round((Number(e.target.value) || 0) * Number(selectedTrip.fxRate || 1)) })} placeholder="外幣金額" /><Input type="number" value={receiptDraft.twdAmount} onChange={(e) => setReceiptDraft({ ...receiptDraft, twdAmount: Number(e.target.value) || 0 })} placeholder="台幣金額" /></div><Textarea value={receiptDraft.note} onChange={(e) => setReceiptDraft({ ...receiptDraft, note: e.target.value })} placeholder="翻譯備註" /></div></div><Button className={`w-full rounded-2xl ${palette.button}`} onClick={importReceipt}>匯入支出</Button></div></DrawerContent></Drawer><Drawer open={expenseDrawerOpen} onOpenChange={setExpenseDrawerOpen}><DrawerTrigger asChild><Button size="sm" className={`h-8 rounded-2xl px-3 ${palette.button}`}><Plus className="mr-1 h-3.5 w-3.5" />新增</Button></DrawerTrigger><DrawerContent className="mx-auto max-w-[420px] rounded-t-[28px]"><DrawerHeader><DrawerTitle>新增支出</DrawerTitle></DrawerHeader><div className="space-y-4 px-4 pb-6"><Input type="date" value={newExpense.date} onChange={(e) => setNewExpense({ ...newExpense, date: e.target.value })} /><Input placeholder="店名" value={newExpense.merchant} onChange={(e) => setNewExpense({ ...newExpense, merchant: e.target.value })} /><Input placeholder="品項" value={newExpense.item} onChange={(e) => setNewExpense({ ...newExpense, item: e.target.value })} /><Input type="number" placeholder={`外幣金額（${selectedTrip.currency}）`} value={newExpense.foreignAmount} onChange={(e) => setNewExpense({ ...newExpense, foreignAmount: e.target.value })} /><div className="grid grid-cols-2 gap-3"><Select value={newExpense.category} onValueChange={(value) => setNewExpense({ ...newExpense, category: value })}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent>{categories.map((item) => <SelectItem key={item} value={item}>{item}</SelectItem>)}</SelectContent></Select><Select value={newExpense.paymentMethod} onValueChange={(value) => setNewExpense({ ...newExpense, paymentMethod: value })}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent>{payments.map((item) => <SelectItem key={item} value={item}>{item}</SelectItem>)}</SelectContent></Select></div><Select value={newExpense.memberId} onValueChange={(value) => setNewExpense({ ...newExpense, memberId: value })}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent>{selectedTrip.members.map((member) => <SelectItem key={member.id} value={member.id}>{member.avatar} {member.name}</SelectItem>)}</SelectContent></Select><Textarea placeholder="備註" value={newExpense.note} onChange={(e) => setNewExpense({ ...newExpense, note: e.target.value })} /><Button className={`w-full rounded-2xl ${palette.button}`} onClick={addExpense}>加入支出</Button></div></DrawerContent></Drawer></div>}
                />
                <div className="space-y-2.5">
                  {selectedTrip.expenses.map((expense) => {
                    const member = selectedTrip.members.find((m) => m.id === expense.memberId);
                    return (
                      <Card key={expense.id} className="rounded-[24px] border-0 shadow-sm">
                        <CardContent className="p-3.5">
                          <div className="flex items-start justify-between gap-3">
                            <div>
                              <div className="flex flex-wrap items-center gap-2"><p className="font-semibold text-slate-900">{expense.merchant}</p><Badge variant="outline">{expense.category}</Badge></div>
                              <p className="mt-1 text-sm text-slate-500">{expense.item}</p>
                              <div className="mt-1.5 flex flex-wrap gap-2 text-[11px] text-slate-500"><span>{expense.date}</span><span>{expense.paymentMethod}</span><span>{member?.avatar} {member?.name}</span></div>
                            </div>
                            <div className="text-right"><p className="text-[11px] text-slate-500">{currency(expense.foreignAmount, expense.currency)}</p><p className="text-sm font-bold text-slate-900">{currency(expense.twdAmount, "TWD")}</p></div>
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              </div>
            ) : null}

            {activeTab === "members" ? (
              <div className="mt-4 space-y-3.5">
                <SectionTitle title="多人記帳" sub="可新增旅伴，也可設定一起編輯行程" action={<Button size="sm" className={`h-8 rounded-2xl px-3 ${palette.button}`} onClick={openCreateMember}><Plus className="mr-1 h-3.5 w-3.5" />新增</Button>} />
                {memberSummary.map((member) => (
                  <Card key={member.id} className="rounded-[24px] border-0 shadow-sm">
                    <CardContent className="flex items-center justify-between p-3.5">
                      <button className="flex items-center gap-3 text-left" onClick={() => openEditMember(member)}>
                        <div className={`flex h-11 w-11 items-center justify-center rounded-2xl ${palette.soft} text-2xl`}>{member.avatar}</div>
                        <div>
                          <p className="font-semibold text-slate-900">{member.name}</p>
                          <p className="text-[11px] text-slate-500">點一下可編輯資料</p>
                        </div>
                      </button>
                      <p className="font-bold text-slate-900">{currency(member.total, "TWD")}</p>
                    </CardContent>
                  </Card>
                ))}

                <Card className="rounded-[24px] border-0 shadow-sm">
                  <CardHeader className="pb-1 pt-4"><CardTitle className="flex items-center gap-2 text-sm"><Settings2 className="h-4 w-4" />簡易使用者設定</CardTitle></CardHeader>
                  <CardContent className="space-y-3 p-4 pt-2">
                    <div className={`rounded-2xl ${palette.soft2} px-3 py-3`}>
                      <p className="text-xs text-slate-500">邀請碼</p>
                      <p className="mt-1 text-sm font-semibold text-slate-900">{collabSettings.inviteCode}</p>
                    </div>
                    <div className={`rounded-2xl ${palette.soft2} px-3 py-3`}>
                      <p className="text-xs text-slate-500">邀請連結</p>
                      <p className="mt-1 break-all text-sm text-slate-800">{collabSettings.inviteLink}</p>
                    </div>
                    <div className="flex gap-2">
                      <Button variant="outline" className="flex-1 rounded-2xl" onClick={() => setCollabSettings((prev) => ({ ...prev, allowInvite: !prev.allowInvite }))}>{collabSettings.allowInvite ? <><Lock className="mr-2 h-4 w-4" />關閉共編</> : <><Users className="mr-2 h-4 w-4" />開啟共編</>}</Button>
                      <Button className={`flex-1 rounded-2xl ${palette.button}`}><Link2 className="mr-2 h-4 w-4" />複製連結</Button>
                    </div>
                    <p className="text-[11px] text-slate-500">朋友加入後，可一起編輯行程並上傳自己的發票記帳。</p>
                  </CardContent>
                </Card>

                <Drawer open={memberDrawerOpen} onOpenChange={setMemberDrawerOpen}>
                  <DrawerContent className="mx-auto max-w-[420px] rounded-t-[28px]">
                    <DrawerHeader><DrawerTitle>{editingMemberId ? "編輯旅伴" : "新增旅伴"}</DrawerTitle></DrawerHeader>
                    <div className="space-y-4 px-4 pb-6">
                      <div className="space-y-2"><Label>旅伴名稱</Label><Input value={memberDraft.name} onChange={(e) => setMemberDraft({ ...memberDraft, name: e.target.value })} placeholder="例如：小花" /></div>
                      <div className="space-y-2"><Label>選擇頭像</Label><div className="grid grid-cols-4 gap-3">{emojiOptions.map((emoji) => <button key={emoji} onClick={() => setMemberDraft({ ...memberDraft, avatar: emoji })} className={`flex h-14 items-center justify-center rounded-2xl border text-2xl transition ${memberDraft.avatar === emoji ? "border-[#a5a58d] bg-[#efe8df]" : "border-[#ddd5cc] bg-white"}`}>{emoji}</button>)}</div></div>
                      <Button className={`w-full rounded-2xl ${palette.button}`} onClick={saveMember}>{editingMemberId ? "儲存旅伴" : "新增旅伴"}</Button>
                      {editingMemberId ? <Button variant="outline" className="w-full rounded-2xl" onClick={() => deleteMember(editingMemberId)}><Trash2 className="mr-2 h-4 w-4" />刪除此旅伴</Button> : null}
                    </div>
                  </DrawerContent>
                </Drawer>
              </div>
            ) : null}

            {activeTab === "analytics" ? (
              <div className="mt-4 space-y-3.5">
                <SectionTitle title="統計分析" sub="每日趨勢、類別佔比、支付方式、TOP 10" />
                <Card className="rounded-[24px] border-0 shadow-sm"><CardHeader className="pb-0 pt-4"><CardTitle className="text-sm">每日趨勢</CardTitle></CardHeader><CardContent className="h-[200px] p-3"><ResponsiveContainer width="100%" height="100%"><LineChart data={dailyTrend}><CartesianGrid strokeDasharray="3 3" /><XAxis dataKey="date" hide /><YAxis hide /><Tooltip /><Line type="monotone" dataKey="amount" stroke="#8d9b8a" strokeWidth={2} dot={false} /></LineChart></ResponsiveContainer></CardContent></Card>
                <div className="grid grid-cols-2 gap-3"><Card className="rounded-[24px] border-0 shadow-sm"><CardHeader className="pb-0 pt-4"><CardTitle className="text-sm">類別佔比</CardTitle></CardHeader><CardContent className="h-[190px] p-2"><ResponsiveContainer width="100%" height="100%"><PieChart><Pie data={categoryStats} dataKey="value" nameKey="name" innerRadius={28} outerRadius={58}>{categoryStats.map((_, index) => <Cell key={index} fill={chartColors[index % chartColors.length]} />)}</Pie><Tooltip /></PieChart></ResponsiveContainer></CardContent></Card><Card className="rounded-[24px] border-0 shadow-sm"><CardHeader className="pb-0 pt-4"><CardTitle className="text-sm">支付方式</CardTitle></CardHeader><CardContent className="h-[190px] p-2"><ResponsiveContainer width="100%" height="100%"><BarChart data={paymentStats}><XAxis dataKey="name" hide /><YAxis hide /><Tooltip /><Bar dataKey="amount" fill="#a5a58d" radius={[8, 8, 0, 0]} /></BarChart></ResponsiveContainer></CardContent></Card></div>
                <Card className="rounded-[24px] border-0 shadow-sm"><CardHeader className="pb-2 pt-4"><CardTitle className="text-sm">TOP 10 消費</CardTitle></CardHeader><CardContent className="space-y-2.5">{topExpenses.map((item, index) => { const member = selectedTrip.members.find((m) => m.id === item.memberId); return <div key={item.id} className={`flex items-center justify-between rounded-2xl ${palette.soft2} px-3 py-2.5`}><div className="flex items-center gap-3"><div className="flex h-7 w-7 items-center justify-center rounded-xl bg-white text-[11px] font-bold text-slate-600">{index + 1}</div><div><p className="text-sm font-medium text-slate-900">{item.merchant}</p><p className="text-[11px] text-slate-500">{item.item} ・ {member?.avatar} {member?.name}</p></div></div><p className="text-sm font-semibold text-slate-900">{currency(item.twdAmount, "TWD")}</p></div>; })}</CardContent></Card>
              </div>
            ) : null}
          </motion.div>
        ) : (
          <motion.div key="itinerary-edit" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="p-3.5 pb-28">
            <div className="mb-3 flex items-center justify-between gap-3">
              <Button variant="ghost" className="rounded-2xl px-3" onClick={() => { setScreen("home"); setEditingItineraryId(null); }}><ArrowLeft className="mr-1 h-4 w-4" />返回</Button>
              <div className={`flex items-center gap-2 rounded-2xl ${palette.highlight} px-3 py-2 text-sm font-medium`}><Pencil className="h-4 w-4" />行程編輯</div>
            </div>
            {editingItinerary ? <ItineraryEditor item={editingItinerary} dayPlans={selectedTrip.dayPlans} onChange={updateEditingItinerary} onSave={() => { setScreen("home"); setEditingItineraryId(null); setSelectedDay(editingItinerary.dayDate); }} onDelete={deleteItinerary} /> : null}
          </motion.div>
        )}
      </AnimatePresence>
      {screen === "home" ? <BottomNav activeTab={activeTab} setActiveTab={setActiveTab} /> : null}
    </MobileShell>
  );
}
